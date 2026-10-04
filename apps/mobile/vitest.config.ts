import { defineConfig } from 'vitest/config';

// Tests unitaires de la logique sans UI (src/lib). Les écrans seront testés
// séparément quand ils auront de la logique propre.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
