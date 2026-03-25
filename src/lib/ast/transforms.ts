import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { File } from '@babel/types';

interface TransformStats {
  typesAdded: number;
  interfacesCreated: number;
  requiresConverted: number;
  exportsConverted: number;
}

export function transformToTypeScript(ast: File, isJSX: boolean): TransformStats {
  const stats: TransformStats = {
    typesAdded: 0,
    interfacesCreated: 0,
    requiresConverted: 0,
    exportsConverted: 0,
  };

  convertRequireToImport(ast, stats);
  convertModuleExports(ast, stats);
  addParameterTypes(ast, stats);
  addReturnTypes(ast, stats);

  if (isJSX) {
    addReactTypes(ast, stats);
  }

  return stats;
}

function convertRequireToImport(ast: File, stats: TransformStats): void {
  traverse(ast, {
    VariableDeclaration(path) {
      const declarations = path.node.declarations;
      if (declarations.length !== 1) return;

      const decl = declarations[0];
      if (
        !t.isCallExpression(decl.init) ||
        !t.isIdentifier(decl.init.callee, { name: 'require' }) ||
        decl.init.arguments.length !== 1 ||
        !t.isStringLiteral(decl.init.arguments[0])
      ) return;

      const source = decl.init.arguments[0].value;

      if (t.isIdentifier(decl.id)) {
        // const foo = require('foo') → import foo from 'foo'
        const importDecl = t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier(decl.id.name))],
          t.stringLiteral(source)
        );
        path.replaceWith(importDecl);
        stats.requiresConverted++;
      } else if (t.isObjectPattern(decl.id)) {
        // const { a, b } = require('foo') → import { a, b } from 'foo'
        const specifiers = decl.id.properties
          .filter((prop): prop is t.ObjectProperty => t.isObjectProperty(prop))
          .filter(prop => t.isIdentifier(prop.key) && t.isIdentifier(prop.value))
          .map(prop =>
            t.importSpecifier(
              t.identifier((prop.value as t.Identifier).name),
              t.identifier((prop.key as t.Identifier).name)
            )
          );

        if (specifiers.length > 0) {
          const importDecl = t.importDeclaration(specifiers, t.stringLiteral(source));
          path.replaceWith(importDecl);
          stats.requiresConverted++;
        }
      }
    },
  });
}

function convertModuleExports(ast: File, stats: TransformStats): void {
  traverse(ast, {
    ExpressionStatement(path) {
      const expr = path.node.expression;
      if (!t.isAssignmentExpression(expr, { operator: '=' })) return;

      // module.exports = ... → export default ...
      if (
        t.isMemberExpression(expr.left) &&
        t.isIdentifier(expr.left.object, { name: 'module' }) &&
        t.isIdentifier(expr.left.property, { name: 'exports' })
      ) {
        if (t.isFunctionExpression(expr.right) || t.isArrowFunctionExpression(expr.right) || t.isIdentifier(expr.right)) {
          path.replaceWith(t.exportDefaultDeclaration(expr.right as t.Expression));
          stats.exportsConverted++;
        } else if (t.isObjectExpression(expr.right)) {
          // module.exports = { a, b } → export { a, b } if all are identifiers
          const allShorthand = expr.right.properties.every(
            p => t.isObjectProperty(p) && t.isIdentifier(p.key) && t.isIdentifier(p.value) && p.shorthand
          );
          if (allShorthand) {
            const specifiers = expr.right.properties
              .filter((p): p is t.ObjectProperty => t.isObjectProperty(p))
              .map(p => t.exportSpecifier(
                t.identifier((p.key as t.Identifier).name),
                t.identifier((p.key as t.Identifier).name)
              ));
            path.replaceWith(t.exportNamedDeclaration(null, specifiers));
          } else {
            path.replaceWith(t.exportDefaultDeclaration(expr.right));
          }
          stats.exportsConverted++;
        }
        return;
      }

      // exports.foo = bar → export { bar as foo } (simplified)
      if (
        t.isMemberExpression(expr.left) &&
        t.isIdentifier(expr.left.object, { name: 'exports' }) &&
        t.isIdentifier(expr.left.property)
      ) {
        const name = expr.left.property.name;
        if (t.isIdentifier(expr.right) || t.isFunctionExpression(expr.right) || t.isArrowFunctionExpression(expr.right)) {
          // Convert to: export const foo = ...
          const varDecl = t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(name), expr.right as t.Expression)
          ]);
          path.replaceWith(t.exportNamedDeclaration(varDecl, []));
          stats.exportsConverted++;
        }
      }
    },
  });
}

function addParameterTypes(ast: File, stats: TransformStats): void {
  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
      const node = path.node as t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression;

      for (const param of node.params) {
        if (t.isIdentifier(param) && !param.typeAnnotation) {
          // Check for default values to infer types
          // Already handled by TypeScript inference for defaults
          // Mark params without defaults or types
          if (t.isAssignmentPattern(param)) continue;

          // Check JSDoc comments for type hints
          const leadingComments = (path.node as t.Node).leadingComments;
          if (leadingComments) {
            const jsdocType = extractParamTypeFromJSDoc(leadingComments, param.name);
            if (jsdocType) {
              param.typeAnnotation = t.tsTypeAnnotation(jsdocToTsType(jsdocType));
              stats.typesAdded++;
              continue;
            }
          }
        }

        // Handle destructured params with defaults
        if (t.isAssignmentPattern(param) && t.isIdentifier(param.left) && !param.left.typeAnnotation) {
          const inferredType = inferTypeFromValue(param.right);
          if (inferredType) {
            param.left.typeAnnotation = t.tsTypeAnnotation(inferredType);
            stats.typesAdded++;
          }
        }
      }
    },
  });
}

function addReturnTypes(ast: File, stats: TransformStats): void {
  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.returnType) return;

      const returnStatements: t.Expression[] = [];
      path.traverse({
        ReturnStatement(retPath) {
          if (retPath.node.argument) {
            returnStatements.push(retPath.node.argument);
          }
        },
        // Don't traverse into nested functions
        FunctionDeclaration(innerPath) { innerPath.skip(); },
        FunctionExpression(innerPath) { innerPath.skip(); },
        ArrowFunctionExpression(innerPath) { innerPath.skip(); },
      });

      if (returnStatements.length === 0) {
        path.node.returnType = t.tsTypeAnnotation(t.tsVoidKeyword());
        stats.typesAdded++;
      } else if (returnStatements.length === 1) {
        const inferredType = inferTypeFromValue(returnStatements[0]);
        if (inferredType) {
          path.node.returnType = t.tsTypeAnnotation(inferredType);
          stats.typesAdded++;
        }
      }
    },
  });
}

function addReactTypes(ast: File, stats: TransformStats): void {
  traverse(ast, {
    // Add React.ChangeEvent types for common event handler patterns
    ArrowFunctionExpression(path) {
      if (path.node.params.length !== 1) return;
      const param = path.node.params[0];
      if (!t.isIdentifier(param, { name: 'e' }) && !t.isIdentifier(param, { name: 'event' })) return;
      if (param.typeAnnotation) return;

      // Check if parent is an onChange/onClick/onSubmit prop
      const parent = path.parent;
      if (
        t.isJSXExpressionContainer(parent) &&
        t.isJSXAttribute(path.parentPath?.parent) &&
        t.isJSXIdentifier(path.parentPath.parent.name)
      ) {
        const eventName = path.parentPath.parent.name.name;
        const eventType = getReactEventType(eventName);
        if (eventType) {
          param.typeAnnotation = t.tsTypeAnnotation(
            t.tsTypeReference(
              t.tsQualifiedName(t.identifier('React'), t.identifier(eventType))
            )
          );
          stats.typesAdded++;
        }
      }
    },
  });
}

function getReactEventType(propName: string): string | null {
  const eventMap: Record<string, string> = {
    onChange: 'ChangeEvent<HTMLInputElement>',
    onClick: 'MouseEvent<HTMLElement>',
    onSubmit: 'FormEvent<HTMLFormElement>',
    onKeyDown: 'KeyboardEvent<HTMLElement>',
    onKeyUp: 'KeyboardEvent<HTMLElement>',
    onKeyPress: 'KeyboardEvent<HTMLElement>',
    onFocus: 'FocusEvent<HTMLElement>',
    onBlur: 'FocusEvent<HTMLElement>',
    onMouseEnter: 'MouseEvent<HTMLElement>',
    onMouseLeave: 'MouseEvent<HTMLElement>',
  };
  return eventMap[propName] || null;
}

function extractParamTypeFromJSDoc(
  comments: readonly t.Comment[],
  paramName: string
): string | null {
  for (const comment of comments) {
    if (comment.type !== 'CommentBlock') continue;
    const paramRegex = new RegExp(
      `@param\\s+\\{([^}]+)\\}\\s+${paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i'
    );
    const match = comment.value.match(paramRegex);
    if (match) return match[1].trim();
  }
  return null;
}

function jsdocToTsType(jsdocType: string): t.TSType {
  const normalized = jsdocType.toLowerCase().trim();
  switch (normalized) {
    case 'string': return t.tsStringKeyword();
    case 'number': return t.tsNumberKeyword();
    case 'boolean': return t.tsBooleanKeyword();
    case 'void': return t.tsVoidKeyword();
    case 'any': return t.tsAnyKeyword();
    case 'object': return t.tsObjectKeyword();
    case 'function': return t.tsFunctionType(null, [], t.tsTypeAnnotation(t.tsAnyKeyword()));
    case 'array': return t.tsArrayType(t.tsAnyKeyword());
    default:
      if (normalized.endsWith('[]')) {
        const inner = jsdocToTsType(normalized.slice(0, -2));
        return t.tsArrayType(inner);
      }
      return t.tsTypeReference(t.identifier(jsdocType));
  }
}

function inferTypeFromValue(node: t.Node): t.TSType | null {
  if (t.isStringLiteral(node) || t.isTemplateLiteral(node)) return t.tsStringKeyword();
  if (t.isNumericLiteral(node)) return t.tsNumberKeyword();
  if (t.isBooleanLiteral(node)) return t.tsBooleanKeyword();
  if (t.isNullLiteral(node)) return t.tsNullKeyword();
  if (t.isArrayExpression(node)) {
    if (node.elements.length === 0) return t.tsArrayType(t.tsUnknownKeyword());
    const firstEl = node.elements[0];
    if (firstEl && !t.isSpreadElement(firstEl)) {
      const elType = inferTypeFromValue(firstEl);
      if (elType) return t.tsArrayType(elType);
    }
    return t.tsArrayType(t.tsAnyKeyword());
  }
  return null;
}
