import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sourceAliases } from './vitest.shared.js';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: { alias: sourceAliases },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/load-test-env.ts'],
    // Todos os specs de e2e batem no mesmo Postgres (db-test) e fazem
    // seed/cleanup direto na base. Rodando os arquivos em paralelo, o
    // afterEach/resetDatabase de um spec pode apagar dados que outro spec
    // acabou de inserir (mesmas tabelas, mesmo banco). Sem isolamento por
    // schema/transação por teste, a saída simples é serializar os arquivos.
    fileParallelism: false,
  },
});
