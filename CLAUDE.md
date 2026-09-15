# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install               # install dependencies

pnpm run start:dev         # dev server with watch mode
pnpm run start:debug       # dev server with --inspect + watch

pnpm run build              # nest build
pnpm run lint                # oxlint src/ test/
pnpm run format               # prettier --write src/**/*.ts test/**/*.ts

pnpm run test               # unit tests (vitest run, *.spec.ts)
pnpm run test:watch          # unit tests, watch mode
pnpm run test:cov             # unit tests with coverage
pnpm run test:e2e              # e2e tests (vitest.config.e2e.ts, *.e2e-spec.ts)
pnpm run test:debug             # --inspect-brk --no-file-parallelism

pnpm exec vitest run path/to/file.spec.ts -t "test name"   # run a single test

pnpm run prisma:generate    # regenerate Prisma client into src/generated/prisma
pnpm run prisma:migrate      # create/apply a dev migration
pnpm run prisma:reset          # reset the dev database

docker compose up -d db     # start local Postgres (postgres:15-alpine, port 5432, db "estocai")
```

Swagger/OpenAPI docs are served at `/docs` once the app is running.

## Architecture

NestJS + Prisma 7 (with `@prisma/adapter-pg`) + `nestjs-zod` API. Package manager is pnpm; module system is ESM (`"type": "module"`, `nodenext` resolution — relative imports in TS source use `.js` extensions where required, e.g. `main.ts` imports `./app.module.js`).

### Subpath imports instead of relative paths

`package.json#imports` defines these aliases (mirrored by `tsconfig`/`vite-tsconfig-paths` for the TS build/test tooling), always used instead of deep relative paths:

- `#modules/*` → `src/modules/*`
- `#shared-modules/*` → `src/modules/shared/modules/*`
- `#shared-libs/*` → `src/modules/shared/libs/*`
- `#prisma/*` → `src/generated/prisma/*` (Prisma client is generated here, not in `node_modules`)

### Domain module layering

Modules under `src/modules/<domain>/` are organized by business domain, not by individual feature/use-case — e.g. `user-management` holds everything about the user domain (user CRUD, login/auth, etc.), not just user creation. Currently `user-management` is the only domain module. Each is split into layers, wired together by a single `<domain>.module.ts`:

- `core/model/` — plain domain model classes with a static `create()` factory that fills defaults/generates IDs (uuid v7). Not a Prisma type.
- `core/use-case/` — one class per use case implementing `UseCase<Input, Output>` (`#shared-libs/interfaces/core/use-case.interface.ts`), injected with repositories, orchestrates domain logic.
- `http/controller/` — Nest controllers, thin: call a use case and return its result. Annotated with `@ApiTags`/`@ApiOperation` (Swagger) and `@ZodResponse` (nestjs-zod).
- `http/dto/` — classes built via `createZodDto(schema)` from `nestjs-zod`, bridging Zod schemas to Nest's DTO/OpenAPI system.
- `schema/` — Zod schemas (e.g. `create-user.schema.ts`) are the source of truth for validation; DTOs and derived response shapes are `.pick()`/composed from a base entity schema.
- `persistence/` — Prisma-backed repositories, one per aggregate, extending `PrismaDefaultRepository` for consistent error handling. Includes mappers (e.g. `user-status.mapper.ts`) translating between domain enums and Prisma enums when they diverge.

Validation and serialization are global: `ZodValidationPipe` (APP_PIPE) validates request bodies against DTO schemas, `ZodSerializerInterceptor` (APP_INTERCEPTOR) serializes responses — set up once in `app.module.ts`, not per-controller.

### Shared modules (`src/modules/shared/`)

- `modules/env/` — typed config. `envSchema` (Zod, in `utils/env.schema.ts`) is the single source of truth for env shape; `utils/env.factory.ts` reads `process.env` and validates against it (throws `EnvException` on failure); `EnvModule.forRoot()` registers it globally via `@nestjs/config`; inject `EnvService` and call `.get('app.port')` / `.get('database.url')` — dotted paths are type-checked against `Env`.
- `modules/persistence/prisma/` — `PrismaService` extends the generated `PrismaClient`, constructed with a `PrismaPg` adapter using `database.url` from `EnvService`. `PrismaDefaultRepository` is the base class all feature repositories extend; its `handleAndThrowError` maps `Prisma.PrismaClientValidationError` to `PersistenceClientException` and anything else to `PersistenceInternalException`.
- `libs/interfaces/core/use-case.interface.ts` — the `UseCase<I, O>` contract every use case implements.
- `libs/generics/with-optional.ts` — a `WithOptional<T, K>` helper used by domain models to type their `create()` input (required fields plus a subset made optional).

### Database

Prisma schema at `prisma/schema.prisma`, generated client output goes to `src/generated/prisma` (not `node_modules/.prisma`) and is imported via `#prisma/*`. Table/column/enum names are snake_case in Postgres via `@@map`/`@map`, camelCase in the Prisma/TS layer. IDs are UUIDs generated app-side (uuid v7), not DB defaults.

## Linting

`oxlint` (not ESLint) is configured in `.oxlintrc.json`: default exports are forbidden repo-wide (use named exports/imports only) except in `*.spec.ts`/`*.e2e-spec.ts`/`vitest.config.ts`.
