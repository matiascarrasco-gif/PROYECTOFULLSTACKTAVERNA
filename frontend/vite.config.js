// Configuración de Vite, React y el entorno de pruebas con Vitest.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // jsdom permite probar componentes como si estuvieran en el navegador.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    restoreMocks: true,
  },
});
