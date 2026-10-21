// Pruebas del panel: permisos, formulario y acciones del catálogo.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminProductsPage from './AdminProductsPage.jsx';
import { getProducts, resetProductDatabase } from '../data/mockDatabase.js';

const fixture = {
  id: 'fixture-console',
  sourceId: 'fixture-console',
  title: 'Consola de prueba',
  description: 'Consola para pruebas unitarias.',
  price: 100000,
  image: '/images/consolas/ps1.png',
  category: 'Consolas',
  sourceRoute: 'Consolas.html',
  platform: '',
  genre: '',
  subcategory: '',
};

describe('AdminProductsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('taverna_admin_logged', 'true');
    resetProductDatabase([fixture]);
  });

  it('requires an administrator session before displaying product management', () => {
    localStorage.removeItem('taverna_admin_logged');
    render(<AdminProductsPage />);

    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Crear producto' })).toBeNull();
  });

  it('creates a product and displays validation errors for invalid prices', () => {
    render(<AdminProductsPage />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Teclado React' } });
    fireEvent.change(screen.getByLabelText('Precio (CLP)'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Teclado para pruebas.' } });
    fireEvent.change(screen.getByLabelText('Ruta de imagen o URL'), { target: { value: '/images/accesorios/teclado1.webp' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear producto' }).closest('form'));

    expect(screen.getByRole('alert').textContent).toContain('mayor que cero');
    expect(getProducts()).toHaveLength(1);

    fireEvent.change(screen.getByLabelText('Precio (CLP)'), { target: { value: '54990' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear producto' }).closest('form'));

    expect(screen.getByRole('status').textContent).toBe('Producto creado.');
    expect(getProducts()).toHaveLength(2);
  });

  it('updates and deletes the selected catalogue product', () => {
    render(<AdminProductsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Editar Consola de prueba' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Consola actualizada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(getProducts()[0].title).toBe('Consola actualizada');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Consola actualizada' }));
    expect(getProducts()).toHaveLength(0);
    expect(screen.getByText('Producto eliminado.')).toBeTruthy();
  });
});
