import { resolve } from 'node:path';

// #modules/*, #shared-modules/*, #shared-libs/* and #prisma/* (declared in
// package.json#imports) point their "default" condition at dist/ for the
// compiled runtime (dev/prod both run compiled JS). Vitest runs TS source
// directly and would otherwise also resolve to "default" -> dist/, which may
// be stale or missing, so these aliases force resolution to src/ instead.
export const sourceAliases = [
  {
    find: '#shared-modules',
    replacement: resolve(import.meta.dirname, 'src/modules/shared/modules'),
  },
  {
    find: '#shared-libs',
    replacement: resolve(import.meta.dirname, 'src/modules/shared/libs'),
  },
  {
    find: '#modules',
    replacement: resolve(import.meta.dirname, 'src/modules'),
  },
  {
    find: '#prisma',
    replacement: resolve(import.meta.dirname, 'src/generated/prisma'),
  },
];
