import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    resolveAlias: {
      // Babel needs these Node.js modules polyfilled for browser use
      fs: { browser: './src/lib/empty-module.ts' },
      module: { browser: './src/lib/empty-module.ts' },
      path: { browser: './src/lib/empty-module.ts' },
      net: { browser: './src/lib/empty-module.ts' },
      tls: { browser: './src/lib/empty-module.ts' },
    },
  },
};

export default nextConfig;
