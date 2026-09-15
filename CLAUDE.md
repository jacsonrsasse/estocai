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
pnpm run test:e2e              # domain integration tests (vitest.config.e2e.ts, *.e2e-spec.ts) — needs db-test running + migrated, see Testing below
pnpm run test:debug             # --inspect-brk --no-file-parallelism

pnpm exec vitest run path/to/file.spec.ts -t "test name"        # run a single unit test
pnpm exec vitest run --config ./vitest.config.e2e.ts path/to/file.e2e-spec.ts -t "test name"   # run a single e2e test

pnpm run prisma:generate    # regenerate Prisma client into src/generated/prisma
pnpm run prisma:migrate      # create/apply a dev migration
pnpm run prisma:migrate:test  # apply migrations to the db-test database (DOTENV_CONFIG_PATH=.env.test)
pnpm run prisma:reset          # reset the dev database

docker compose up -d db     # start local Postgres for dev (postgres:15-alpine, port 5432, db "estocai")
docker compose up -d db-test # start local Postgres for e2e tests (ephemeral, no volume, port 5433, db "estocai_test")
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
- `#test/*` → `test/*` (shared e2e test infra; only usable from test files, see Testing below)

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

## Testing

Integration tests live inside each domain, not in a central `test/` folder: `src/modules/<domain>/__test__/e2e/*.e2e-spec.ts`. They boot a real Nest app (via `createNestApp` from `#test/test-e2e.setup`) with only the modules that domain needs — never the full `AppModule` — and hit it over HTTP with `supertest`.

- **`test/test-e2e.setup.ts`** — `createNestApp(modules)`: always loads `EnvModule.forRoot()` + `PrismaModule`, plus whatever domain modules are passed in; registers the same `ZodValidationPipe`/`ZodSerializerInterceptor` as `APP_PIPE`/`APP_INTERCEPTOR` that `AppModule` sets up in production (otherwise DTO validation/serialization silently doesn't run in tests); calls `app.init()`. Returns `{ module, app }`.
- **`test/knex.database.ts` + `test/tables.ts`** — a **Knex** client (`testDbClient`), separate from the app's Prisma connection, used only by tests to seed/cleanup/assert data directly. Deliberately decoupled from the app's ORM so a future ORM swap wouldn't require touching tests. `Tables` centralizes table names.
- **`test/reset-database.ts`** — `resetDatabase()` deletes all rows from every table (FK order: `user_identifiers`/`user_auth_methods` before `users`) via `testDbClient`. Called in `afterEach` in each spec.
- **`test/load-test-env.ts`** — loaded via `vitest.config.e2e.ts`'s `setupFiles`; loads `.env.test` with `override: true` before anything else runs, so `EnvModule` (Prisma side) and `testDbClient` (Knex side) both point at the `db-test` database without any source change to `EnvModule`/`env.factory.ts`.
- **`.env.test`** — committed (not gitignored, unlike `.env`). Has `DATABASE_URL` (used by the app's Prisma connection, same shape as `.env`) plus discrete `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME` (used only by `testDbClient`).

**Parallelism**: `vitest.config.e2e.ts` sets `fileParallelism: false`. All e2e spec files share one physical `db-test` Postgres instance with no per-file isolation (no schema-per-worker, no scoped cleanup by ID) — running spec files concurrently lets one file's `resetDatabase()` wipe rows another file just inserted, causing intermittent 404s/failures. Keep this off unless isolation is actually added (e.g. each test tracking/deleting only its own row IDs instead of truncating, or a schema-per-worker setup).

**Vitest resolves `#modules/*`/`#shared-modules/*`/`#shared-libs/*`/`#prisma/*` to `src/`, not `dist/`**: `package.json#imports`' `"default"` condition for these points at `dist/` (correct for the compiled dev/prod runtime, which always runs from `dist/`). Vitest would otherwise also resolve through `"default"` and silently run tests against a stale or missing `dist/` build. Both `vitest.config.ts` and `vitest.config.e2e.ts` override this via `resolve.alias` (shared in `vitest.shared.ts`), forcing these aliases to `src/` for tests. `#test/*` has no such split (it's test-only, no `dist/` counterpart) and needs no alias.

## Linting

`oxlint` (not ESLint) is configured in `.oxlintrc.json`: default exports are forbidden repo-wide (use named exports/imports only) except in `*.spec.ts`/`*.e2e-spec.ts`/`vitest.config.ts`.
