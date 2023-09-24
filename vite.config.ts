import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 100_000,
    testTimeout: 100_000,
    watchExclude: ['**/node_modules/**', '**/*.yml', '**/.__cosmopark'],
  },
});
