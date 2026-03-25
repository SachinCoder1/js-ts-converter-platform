export type FileType = 'js' | 'jsx';
export type OutputFileType = 'ts' | 'tsx';
export type AIProvider = 'gemini' | 'deepseek' | 'openrouter' | 'ast-only';
export type ToolId = 'js-to-ts' | 'json-to-ts' | 'json-to-zod' | 'css-to-tailwind';

// ---- Landing page types ----

export type ToolCategory = 'typescript' | 'json' | 'css' | 'react' | 'schema';
export type ToolTag = 'AI-Powered' | 'Instant' | 'Popular';
export type FilterCategory = 'all' | ToolCategory;

export interface ToolMeta {
  id: string;
  categories: ToolCategory[];
  tags: ToolTag[];
  sourceLabel: string;
  targetLabel: string;
  featured?: boolean;
}

export interface ConversionRequest {
  code: string;
  fileType: FileType;
  preferredProvider?: AIProvider;
}

export interface ConversionStats {
  interfacesCreated: number;
  typesAdded: number;
  anyCount: number;
}

export interface ConversionResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: ConversionStats;
  duration: number;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}

export interface ASTConversionResult {
  code: string;
  stats: ConversionStats;
  unknownZones: number;
  errors: string[];
}

export interface CacheEntry {
  result: ConversionResult;
  timestamp: number;
}

// ---- JSON-to-TypeScript types ----

export type JsonOutputStyle = 'interface' | 'type';
export type JsonOptionalFields = 'required' | 'optional' | 'smart';

export interface JsonToTsOptions {
  outputStyle: JsonOutputStyle;
  exportKeyword: boolean;
  optionalFields: JsonOptionalFields;
  readonlyProperties: boolean;
  rootTypeName: string;
}

export interface JsonToTsRequest {
  json: string;
  options: JsonToTsOptions;
  preferredProvider?: AIProvider;
}

export interface JsonToTsStats {
  interfacesCreated: number;
  propertiesTyped: number;
  nullableFields: number;
  arrayTypes: number;
}

export interface JsonToTsResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: JsonToTsStats;
  duration: number;
}

// ---- JSON-to-Zod types ----

export interface JsonToZodOptions {
  importStyle: 'import' | 'require';
  addDescriptions: boolean;
  coerceDates: boolean;
  generateInferredType: boolean;
  schemaVariableName: string;
}

export interface JsonToZodRequest {
  json: string;
  options: JsonToZodOptions;
  preferredProvider?: AIProvider;
}

export interface JsonToZodStats {
  fieldsProcessed: number;
  zodMethodsUsed: number;
  nestedObjectCount: number;
  arraysDetected: number;
}

export interface JsonToZodResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: JsonToZodStats;
  duration: number;
}

// ---- CSS-to-Tailwind types ----

export interface CssToTailwindOptions {
  tailwindVersion: 'v3' | 'v4';
  arbitraryValues: 'allow' | 'closest-match';
  outputFormat: 'classes-only' | 'html-structure' | 'apply';
  prefix: string;
  colorFormat: 'named' | 'arbitrary-hex';
}

export interface CssToTailwindRequest {
  css: string;
  options: CssToTailwindOptions;
  preferredProvider?: AIProvider;
}

export interface CssToTailwindStats {
  rulesProcessed: number;
  classesGenerated: number;
  arbitraryValuesUsed: number;
  unmappedProperties: number;
}

export interface CssToTailwindResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: CssToTailwindStats;
  duration: number;
}

// ---- SCSS/SASS-to-CSS types ----

export type ScssSyntax = 'scss' | 'sass';
export type ScssOutputStyle = 'expanded' | 'compressed';

export interface ScssConversionResult {
  css: string;
  stats: {
    compilationTime: number;
  };
}

// ---- PropTypes-to-TypeScript types ----

export type PropTypesOutputMode = 'interface-only' | 'interface-and-component';
export type PropTypesDefaultPropsHandling = 'merge-optional' | 'keep-separate';
export type PropTypesFunctionTypes = 'generic' | 'event-inference';

export interface PropTypesToTsOptions {
  outputMode: PropTypesOutputMode;
  defaultPropsHandling: PropTypesDefaultPropsHandling;
  functionTypes: PropTypesFunctionTypes;
}

export interface PropTypesToTsRequest {
  code: string;
  options: PropTypesToTsOptions;
  preferredProvider?: AIProvider;
}

export interface PropTypesToTsStats {
  propsConverted: number;
  interfacesCreated: number;
  requiredProps: number;
  optionalProps: number;
}

export interface PropTypesToTsResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: PropTypesToTsStats;
  duration: number;
}

// ---- GraphQL-to-TypeScript types ----

export type GraphqlEnumStyle = 'enum' | 'union';
export type GraphqlNullableStyle = 'null' | 'maybe';

export interface GraphqlToTsOptions {
  enumStyle: GraphqlEnumStyle;
  nullableStyle: GraphqlNullableStyle;
  exportAll: boolean;
  readonlyProperties: boolean;
  rootTypeName: string;
}

export interface GraphqlToTsRequest {
  graphql: string;
  options: GraphqlToTsOptions;
  preferredProvider?: AIProvider;
}

export interface GraphqlToTsStats {
  typesGenerated: number;
  enumsConverted: number;
  fieldsTyped: number;
  inputTypesGenerated: number;
}

export interface GraphqlToTsResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: GraphqlToTsStats;
  duration: number;
}

// ---- SQL-to-TypeScript types ----

export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite';
export type SqlDateHandling = 'date-object' | 'string';
export type SqlNullableStyle = 'union-null' | 'optional';
export type SqlOutputFormat = 'interfaces' | 'prisma' | 'drizzle';
export type SqlGenerateMode = 'select-only' | 'select-insert';

export interface SqlToTsOptions {
  dialect: SqlDialect;
  dateHandling: SqlDateHandling;
  nullableStyle: SqlNullableStyle;
  outputFormat: SqlOutputFormat;
  generateMode: SqlGenerateMode;
}

export interface SqlToTsRequest {
  sql: string;
  options: SqlToTsOptions;
  preferredProvider?: AIProvider;
}

export interface SqlToTsStats {
  tablesConverted: number;
  columnsTyped: number;
  foreignKeysDetected: number;
  enumsGenerated: number;
}

export interface SqlToTsResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: SqlToTsStats;
  duration: number;
}

// ---- OpenAPI/Swagger-to-TypeScript types ----

export type OpenApiSpecVersion = 'auto' | 'openapi3' | 'swagger2';
export type OpenApiInputFormat = 'json' | 'yaml';
export type OpenApiOutputMode = 'interfaces-only' | 'interfaces-and-client' | 'interfaces-and-fetch';
export type OpenApiEnumStyle = 'union' | 'enum';

export interface OpenApiToTsOptions {
  specVersion: OpenApiSpecVersion;
  inputFormat: OpenApiInputFormat;
  outputMode: OpenApiOutputMode;
  enumStyle: OpenApiEnumStyle;
  addJsDoc: boolean;
}

export interface OpenApiToTsRequest {
  spec: string;
  options: OpenApiToTsOptions;
  preferredProvider?: AIProvider;
}

export interface OpenApiToTsStats {
  schemasConverted: number;
  endpointsTyped: number;
  enumsGenerated: number;
  refsResolved: number;
}

export interface OpenApiToTsResult {
  convertedCode: string;
  provider: AIProvider;
  fromCache: boolean;
  stats: OpenApiToTsStats;
  duration: number;
}
