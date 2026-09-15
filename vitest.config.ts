import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sourceAliases } from './vitest.shared.js';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  resolve: { alias: sourceAliases },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
