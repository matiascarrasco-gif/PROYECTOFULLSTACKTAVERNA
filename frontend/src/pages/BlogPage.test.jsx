// Pruebas del filtro de noticias y la ventana de lectura de artículos.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BlogPage from './BlogPage.jsx';

describe('BlogPage', () => {
  it('filters articles and opens an article dialog', () => {
    render(<BlogPage />);
    fireEvent.click(screen.getByRole('button', { name: '🕹️ Consolas' }));

    expect(screen.getByRole('heading', { name: 'Nintendo Switch 2: Análisis completo tras el primer mes' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'FC 27: El fútbol virtual nunca fue tan real' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Leer artículo →' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar artículo' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('validates and confirms newsletter subscription', () => {
    render(<BlogPage />);
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'gamer@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Suscribirme' }));

    expect(screen.getByRole('status').textContent).toContain('Suscripción exitosa');
  });
});
