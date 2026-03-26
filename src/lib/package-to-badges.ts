// ---- Types ----

export type BadgeStyle = 'flat' | 'flat-square' | 'for-the-badge' | 'plastic' | 'social';
export type BadgeOutputFormat = 'markdown' | 'html' | 'rst';

export interface BadgeCategories {
  packageInfo: boolean;
  engine: boolean;
  typescript: boolean;
  frameworks: boolean;
  testing: boolean;
  linting: boolean;
  buildTools: boolean;
  ci: boolean;
  bundleSize: boolean;
  downloads: boolean;
}

export interface PackageToBadgesOptions {
  style: BadgeStyle;
  colorScheme: string;
  format: BadgeOutputFormat;
  categories: BadgeCategories;
}

export const DEFAULT_OPTIONS: PackageToBadgesOptions = {
  style: 'flat',
  colorScheme: '',
  format: 'markdown',
  categories: {
    packageInfo: true,
    engine: true,
    typescript: true,
    frameworks: true,
    testing: true,
    linting: true,
    buildTools: true,
    ci: true,
    bundleSize: true,
    downloads: true,
  },
};

export interface ConversionOutput {
  badges: string;
  error: string | null;
  duration: number;
  badgeCount: number;
}

// ---- Internal types ----

interface Badge {
  label: string;
  imageUrl: string;
  linkUrl: string;
}

interface BadgeGroup {
  name: string;
  badges: Badge[];
}

interface DetectionEntry {
  logo: string;
  color: string;
  label: string;
  linkPrefix: string;
}

// ---- Detection maps ----

const FRAMEWORK_MAP: Record<string, DetectionEntry> = {
  react: { logo: 'react', color: '61DAFB', label: 'React', linkPrefix: 'https://react.dev' },
  'react-dom': { logo: 'react', color: '61DAFB', label: 'React', linkPrefix: 'https://react.dev' },
  next: { logo: 'nextdotjs', color: '000000', label: 'Next.js', linkPrefix: 'https://nextjs.org' },
  vue: { logo: 'vuedotjs', color: '4FC08D', label: 'Vue.js', linkPrefix: 'https://vuejs.org' },
  svelte: { logo: 'svelte', color: 'FF3E00', label: 'Svelte', linkPrefix: 'https://svelte.dev' },
  '@sveltejs/kit': { logo: 'svelte', color: 'FF3E00', label: 'SvelteKit', linkPrefix: 'https://kit.svelte.dev' },
  angular: { logo: 'angular', color: 'DD0031', label: 'Angular', linkPrefix: 'https://angular.dev' },
  '@angular/core': { logo: 'angular', color: 'DD0031', label: 'Angular', linkPrefix: 'https://angular.dev' },
  express: { logo: 'express', color: '000000', label: 'Express', linkPrefix: 'https://expressjs.com' },
  fastify: { logo: 'fastify', color: '000000', label: 'Fastify', linkPrefix: 'https://fastify.dev' },
  nuxt: { logo: 'nuxtdotjs', color: '00DC82', label: 'Nuxt', linkPrefix: 'https://nuxt.com' },
  gatsby: { logo: 'gatsby', color: '663399', label: 'Gatsby', linkPrefix: 'https://www.gatsbyjs.com' },
  tailwindcss: { logo: 'tailwindcss', color: '06B6D4', label: 'Tailwind CSS', linkPrefix: 'https://tailwindcss.com' },
};

const TESTING_MAP: Record<string, DetectionEntry> = {
  jest: { logo: 'jest', color: 'C21325', label: 'Jest', linkPrefix: 'https://jestjs.io' },
  vitest: { logo: 'vitest', color: '6E9F18', label: 'Vitest', linkPrefix: 'https://vitest.dev' },
  mocha: { logo: 'mocha', color: '8D6748', label: 'Mocha', linkPrefix: 'https://mochajs.org' },
  cypress: { logo: 'cypress', color: '17202C', label: 'Cypress', linkPrefix: 'https://www.cypress.io' },
  '@playwright/test': { logo: 'playwright', color: '2EAD33', label: 'Playwright', linkPrefix: 'https://playwright.dev' },
  playwright: { logo: 'playwright', color: '2EAD33', label: 'Playwright', linkPrefix: 'https://playwright.dev' },
};

const LINTING_MAP: Record<string, DetectionEntry> = {
  eslint: { logo: 'eslint', color: '4B32C3', label: 'ESLint', linkPrefix: 'https://eslint.org' },
  prettier: { logo: 'prettier', color: 'F7B93E', label: 'Prettier', linkPrefix: 'https://prettier.io' },
  '@biomejs/biome': { logo: 'biome', color: '60A5FA', label: 'Biome', linkPrefix: 'https://biomejs.dev' },
  biome: { logo: 'biome', color: '60A5FA', label: 'Biome', linkPrefix: 'https://biomejs.dev' },
};

const BUILD_MAP: Record<string, DetectionEntry> = {
  webpack: { logo: 'webpack', color: '8DD6F9', label: 'Webpack', linkPrefix: 'https://webpack.js.org' },
  vite: { logo: 'vite', color: '646CFF', label: 'Vite', linkPrefix: 'https://vite.dev' },
  esbuild: { logo: 'esbuild', color: 'FFCF00', label: 'esbuild', linkPrefix: 'https://esbuild.github.io' },
  turbo: { logo: 'turborepo', color: 'EF4444', label: 'Turborepo', linkPrefix: 'https://turbo.build' },
  rollup: { logo: 'rollupdotjs', color: 'EC4A3F', label: 'Rollup', linkPrefix: 'https://rollupjs.org' },
};

// ---- Helpers ----

const SHIELDS_BASE = 'https://img.shields.io';

function encodeName(name: string): string {
  return encodeURIComponent(name).replace(/%40/g, '%40').replace(/%2F/g, '%2F');
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]+/, '');
}

function isValidHex(color: string): boolean {
  return /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color);
}

function styleParam(style: BadgeStyle): string {
  return `style=${style}`;
}

function makeBadge(
  shieldPath: string,
  linkUrl: string,
  style: BadgeStyle,
  customColor: string,
  extraParams?: string
): Badge {
  const params = [styleParam(style)];
  if (extraParams) params.push(extraParams);
  if (customColor) params.push(`color=${customColor}`);
  const sep = shieldPath.includes('?') ? '&' : '?';
  const imageUrl = `${SHIELDS_BASE}${shieldPath}${sep}${params.join('&')}`;
  return { label: '', imageUrl, linkUrl };
}

function makeStaticBadge(
  label: string,
  message: string,
  color: string,
  style: BadgeStyle,
  customColor: string,
  logo?: string
): Badge {
  const safeLabel = label.replace(/-/g, '--').replace(/_/g, '__');
  const safeMessage = message.replace(/-/g, '--').replace(/_/g, '__');
  const finalColor = customColor || color;
  let params = `${styleParam(style)}`;
  if (logo) params += `&logo=${logo}&logoColor=white`;
  const imageUrl = `${SHIELDS_BASE}/badge/${encodeURIComponent(safeLabel)}-${encodeURIComponent(safeMessage)}-${finalColor}?${params}`;
  return { label: '', imageUrl, linkUrl: '' };
}

function formatBadge(badge: Badge, format: BadgeOutputFormat, altText: string): string {
  switch (format) {
    case 'html':
      if (badge.linkUrl) {
        return `<a href="${badge.linkUrl}"><img src="${badge.imageUrl}" alt="${altText}"></a>`;
      }
      return `<img src="${badge.imageUrl}" alt="${altText}">`;
    case 'rst':
      if (badge.linkUrl) {
        return `.. image:: ${badge.imageUrl}\n   :target: ${badge.linkUrl}\n   :alt: ${altText}`;
      }
      return `.. image:: ${badge.imageUrl}\n   :alt: ${altText}`;
    default: // markdown
      if (badge.linkUrl) {
        return `[![${altText}](${badge.imageUrl})](${badge.linkUrl})`;
      }
      return `![${altText}](${badge.imageUrl})`;
  }
}

// ---- Badge generators ----

function generatePackageInfoBadges(
  pkg: Record<string, unknown>,
  style: BadgeStyle,
  customColor: string,
  isPrivate: boolean
): BadgeGroup | null {
  const badges: Badge[] = [];
  const name = pkg.name as string | undefined;

  if (name && !isPrivate) {
    const encoded = encodeName(name);
    badges.push({
      ...makeBadge(`/npm/v/${encoded}`, `https://www.npmjs.com/package/${name}`, style, customColor),
      label: `npm version`,
    });
  } else if (pkg.version) {
    badges.push(makeStaticBadge('version', String(pkg.version), 'blue', style, customColor));
  }

  if (name && !isPrivate) {
    const encoded = encodeName(name);
    badges.push({
      ...makeBadge(`/npm/l/${encoded}`, `https://www.npmjs.com/package/${name}`, style, customColor),
      label: 'license',
    });
  } else if (pkg.license) {
    badges.push(makeStaticBadge('license', String(pkg.license), 'green', style, customColor));
  }

  return badges.length ? { name: 'Package Info', badges } : null;
}

function generateEngineBadge(
  pkg: Record<string, unknown>,
  style: BadgeStyle,
  customColor: string
): BadgeGroup | null {
  const engines = pkg.engines as Record<string, string> | undefined;
  if (!engines?.node) return null;
  const badge = makeStaticBadge('node', engines.node, '339933', style, customColor, 'nodedotjs');
  return { name: 'Engine', badges: [badge] };
}

function generateTypescriptBadge(
  allDeps: Record<string, string>,
  pkg: Record<string, unknown>,
  style: BadgeStyle,
  customColor: string
): BadgeGroup | null {
  const hasTS = 'typescript' in allDeps || typeof pkg.types === 'string' || typeof pkg.typings === 'string';
  if (!hasTS) return null;
  const version = allDeps.typescript ? cleanVersion(allDeps.typescript) : '';
  const message = version ? `TypeScript ${version}` : 'TypeScript';
  const badge = makeStaticBadge('', message, '3178C6', style, customColor, 'typescript');
  badge.linkUrl = 'https://www.typescriptlang.org';
  return { name: 'TypeScript', badges: [badge] };
}

function generateDetectionBadges(
  allDeps: Record<string, string>,
  map: Record<string, DetectionEntry>,
  groupName: string,
  style: BadgeStyle,
  customColor: string
): BadgeGroup | null {
  const badges: Badge[] = [];
  const seen = new Set<string>();

  for (const [depName, entry] of Object.entries(map)) {
    if (depName in allDeps && !seen.has(entry.label)) {
      seen.add(entry.label);
      const badge = makeStaticBadge('', entry.label, entry.color, style, customColor, entry.logo);
      badge.linkUrl = entry.linkPrefix;
      badges.push(badge);
    }
  }

  return badges.length ? { name: groupName, badges } : null;
}

function generateCiBadge(
  style: BadgeStyle
): BadgeGroup | null {
  const templateUrl = `${SHIELDS_BASE}/github/actions/workflow/status/{owner}/{repo}/ci.yml?${styleParam(style)}&logo=githubactions&logoColor=white`;
  const badge: Badge = {
    label: 'CI',
    imageUrl: templateUrl,
    linkUrl: 'https://github.com/{owner}/{repo}/actions',
  };
  return { name: 'CI', badges: [badge] };
}

function generateBundleSizeBadge(
  pkg: Record<string, unknown>,
  style: BadgeStyle,
  customColor: string,
  isPrivate: boolean
): BadgeGroup | null {
  const name = pkg.name as string | undefined;
  if (!name || isPrivate) return null;
  const encoded = encodeName(name);
  const badge = makeBadge(
    `/bundlephobia/minzip/${encoded}`,
    `https://bundlephobia.com/package/${name}`,
    style,
    customColor
  );
  badge.label = 'bundle size';
  return { name: 'Bundle Size', badges: [badge] };
}

function generateDownloadsBadge(
  pkg: Record<string, unknown>,
  style: BadgeStyle,
  customColor: string,
  isPrivate: boolean
): BadgeGroup | null {
  const name = pkg.name as string | undefined;
  if (!name || isPrivate) return null;
  const encoded = encodeName(name);
  const badge = makeBadge(
    `/npm/dm/${encoded}`,
    `https://www.npmjs.com/package/${name}`,
    style,
    customColor
  );
  badge.label = 'downloads';
  return { name: 'Downloads', badges: [badge] };
}

// ---- Main conversion function ----

export function convertPackageToBadges(
  jsonString: string,
  options: PackageToBadgesOptions = DEFAULT_OPTIONS
): ConversionOutput {
  const start = performance.now();

  if (!jsonString.trim()) {
    return { badges: '', error: null, duration: 0, badgeCount: 0 };
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(jsonString);
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const message = err instanceof SyntaxError
      ? `Invalid JSON: ${err.message}`
      : `Parse error: ${String(err)}`;
    return { badges: '', error: message, duration, badgeCount: 0 };
  }

  if (typeof pkg !== 'object' || pkg === null || Array.isArray(pkg)) {
    const duration = Math.round(performance.now() - start);
    return { badges: '', error: 'Expected a JSON object', duration, badgeCount: 0 };
  }

  // Check if it looks like a package.json
  const hasPackageFields = pkg.name || pkg.version || pkg.dependencies || pkg.devDependencies;
  if (!hasPackageFields) {
    const duration = Math.round(performance.now() - start);
    return {
      badges: '',
      error: "This doesn't appear to be a package.json. Expected at least one of: name, version, dependencies, devDependencies.",
      duration,
      badgeCount: 0,
    };
  }

  // Merge all dependencies
  const allDeps: Record<string, string> = {
    ...(pkg.dependencies as Record<string, string> || {}),
    ...(pkg.devDependencies as Record<string, string> || {}),
    ...(pkg.peerDependencies as Record<string, string> || {}),
  };

  const isPrivate = pkg.private === true;
  const { style, format, categories } = options;
  const customColor = normalizeColor(options.colorScheme);

  // Generate badge groups
  const groups: BadgeGroup[] = [];

  if (categories.packageInfo) {
    const g = generatePackageInfoBadges(pkg, style, customColor, isPrivate);
    if (g) groups.push(g);
  }
  if (categories.engine) {
    const g = generateEngineBadge(pkg, style, customColor);
    if (g) groups.push(g);
  }
  if (categories.typescript) {
    const g = generateTypescriptBadge(allDeps, pkg, style, customColor);
    if (g) groups.push(g);
  }
  if (categories.frameworks) {
    const g = generateDetectionBadges(allDeps, FRAMEWORK_MAP, 'Frameworks', style, customColor);
    if (g) groups.push(g);
  }
  if (categories.testing) {
    const g = generateDetectionBadges(allDeps, TESTING_MAP, 'Testing', style, customColor);
    if (g) groups.push(g);
  }
  if (categories.linting) {
    const g = generateDetectionBadges(allDeps, LINTING_MAP, 'Code Style', style, customColor);
    if (g) groups.push(g);
  }
  if (categories.buildTools) {
    const g = generateDetectionBadges(allDeps, BUILD_MAP, 'Build Tools', style, customColor);
    if (g) groups.push(g);
  }
  if (categories.ci) {
    const g = generateCiBadge(style);
    if (g) groups.push(g);
  }
  if (categories.bundleSize) {
    const g = generateBundleSizeBadge(pkg, style, customColor, isPrivate);
    if (g) groups.push(g);
  }
  if (categories.downloads) {
    const g = generateDownloadsBadge(pkg, style, customColor, isPrivate);
    if (g) groups.push(g);
  }

  // Format output
  let badgeCount = 0;
  const isCi = (group: BadgeGroup) => group.name === 'CI';
  const sections: string[] = [];

  for (const group of groups) {
    const lines: string[] = [];

    if (isCi(group)) {
      // CI badges are commented-out templates
      if (format === 'markdown') {
        lines.push(`<!-- ${group.name}: Replace {owner}/{repo} with your GitHub repository -->`);
        for (const badge of group.badges) {
          lines.push(`<!-- ${formatBadge(badge, format, badge.label)} -->`);
        }
      } else if (format === 'html') {
        lines.push(`<!-- ${group.name}: Replace {owner}/{repo} with your GitHub repository -->`);
        for (const badge of group.badges) {
          lines.push(`<!-- ${formatBadge(badge, format, badge.label)} -->`);
        }
      } else {
        // RST
        lines.push(`.. ${group.name}: Replace {owner}/{repo} with your GitHub repository`);
        for (const badge of group.badges) {
          lines.push(`.. ${formatBadge(badge, format, badge.label)}`);
        }
      }
      badgeCount += group.badges.length;
    } else {
      for (const badge of group.badges) {
        const altText = badge.label || group.name;
        lines.push(formatBadge(badge, format, altText));
        badgeCount++;
      }
    }

    sections.push(lines.join('\n'));
  }

  const badges = sections.join('\n\n');
  const duration = Math.round(performance.now() - start);

  return { badges, error: null, duration, badgeCount };
}

function normalizeColor(input: string): string {
  if (!input.trim()) return '';
  const stripped = input.trim().replace(/^#/, '');
  return isValidHex(stripped) ? stripped : '';
}
