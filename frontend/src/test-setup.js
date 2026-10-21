// Configuración común de pruebas: limpia el DOM después de cada caso.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
