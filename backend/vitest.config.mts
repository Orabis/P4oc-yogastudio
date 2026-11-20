import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globalSetup: './tests/global-setup.ts',
    // une seule base de test partagée, donc on évite que les fichiers tournent en parallèle
    fileParallelism: false,
    env: {
      DATABASE_URL: 'postgresql://yogauser:yogapass@localhost:5446/yogastudio_test',
      JWT_SECRET: 'test-secret',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/dto/**', 'src/types/**'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {statements: 80, branches: 80, functions: 80, lines: 80},
    },
  },
});
