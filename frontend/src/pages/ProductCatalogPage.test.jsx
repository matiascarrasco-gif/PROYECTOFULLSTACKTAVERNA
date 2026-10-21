// Pruebas del catálogo y sus filtros combinados.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProductCatalogPage from './ProductCatalogPage.jsx';
import { resetProductDatabase } from '../data/mockDatabase.js';

const products = [
  {
    id: 'game-one',
    title: 'Aventura Galáctica',
    description: 'Juego de aventura para pruebas.',
    price: 30000,
    image: '/images/juegos/fc27-ps5-0.webp',
    category: 'Juegos',
    sourceId: 'game-one',
    sourceRoute: 'Juegos.html',
    platform: 'PS5',
    genre: 'aventura accion',
    subcategory: '',
  },
  {
    id: 'game-two',
    title: 'Carreras del Futuro',
    description: 'Juego de velocidad para pruebas.',
    price: 45000,
    image: '/images/juegos/fc27-ps5-0.webp',
    category: 'Juegos',
    sourceId: 'game-two',
    sourceRoute: 'Juegos.html',
    platform: 'PS4',
    genre: 'deportes',
    subcategory: '',
  },
];

describe('ProductCatalogPage', () => {
  beforeEach(() => resetProductDatabase(products));

  it('renders catalogue products and filters by the search field', () => {
    render(<ProductCatalogPage title="Juegos Digitales" category="Juegos" />);

    expect(screen.getByRole('heading', { name: 'Aventura Galáctica' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Carreras del Futuro' })).toBeTruthy();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar productos' }), {
      target: { value: 'galáctica' },
    });

    expect(screen.getByRole('heading', { name: 'Aventura Galáctica' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Carreras del Futuro' })).toBeNull();
  });

  it('filters games by platform and genre', () => {
    render(<ProductCatalogPage title="Juegos Digitales" category="Juegos" />);

    fireEvent.change(screen.getByLabelText('Consola'), { target: { value: 'PS4' } });
    fireEvent.change(screen.getByLabelText('Género'), { target: { value: 'deportes' } });

    expect(screen.getByRole('heading', { name: 'Carreras del Futuro' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Aventura Galáctica' })).toBeNull();
  });
});
