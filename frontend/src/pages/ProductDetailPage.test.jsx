// Pruebas del detalle del producto y del acceso requerido para reseñas.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SiteLayout from '../components/SiteLayout.jsx';
import ProductDetailPage from './ProductDetailPage.jsx';
import { resetProductDatabase } from '../data/mockDatabase.js';

const product = {
  id: 'juegos-gta6',
  sourceId: 'gta6',
  title: 'Grand Theft Auto VI',
  description: 'Juego de prueba.',
  price: 96000,
  image: '/images/juegos/grand-theft-auto-vi-ps5.webp',
  category: 'Juegos',
  sourceRoute: 'Juegos.html',
  platform: 'PS5',
  genre: 'accion',
  subcategory: '',
};

describe('ProductDetailPage reviews', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProductDatabase([product]);
    window.history.replaceState({}, '', '/producto.html?id=juegos-gta6');
  });

  it('loads reviews saved with the legacy product key', () => {
    localStorage.setItem('resenas_gta6', JSON.stringify([
      { usuario: 'Camila', estrellas: 4, comentario: 'Muy buen juego.' },
    ]));

    render(<SiteLayout><ProductDetailPage /></SiteLayout>);

    expect(screen.getByText('Muy buen juego.')).toBeTruthy();
    expect(screen.getByText('— Camila')).toBeTruthy();
  });

  it('requires a signed-in user before publishing a review', () => {
    render(<SiteLayout><ProductDetailPage /></SiteLayout>);
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Excelente producto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }));

    expect(screen.getByRole('dialog', { name: /Mi Cuenta/ })).toBeTruthy();
    expect(localStorage.getItem('resenas_gta6')).toBeNull();
  });

  it('saves a review for the signed-in user', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombres: 'Matías Gamer', correo: 'gamer@example.com' }));
    render(<SiteLayout><ProductDetailPage /></SiteLayout>);
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Excelente producto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar reseña' }));

    const savedReviews = JSON.parse(localStorage.getItem('resenas_gta6'));
    expect(savedReviews[0].usuario).toBe('Matías');
    expect(savedReviews[0].comentario).toBe('Excelente producto.');
    expect(screen.getByText('Excelente producto.')).toBeTruthy();
  });
});
