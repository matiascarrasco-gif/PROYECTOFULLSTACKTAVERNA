// Pruebas de búsqueda por nombre, URL, tildes y espacios.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout.jsx';
import SearchResultsPage from './SearchResultsPage.jsx';
import { resetProductDatabase } from '../data/mockDatabase.js';

describe('SearchResultsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProductDatabase([{
      id: 'rtx-search',
      title: 'Tarjeta de Video RTX 5090',
      description: 'GPU para juegos.',
      price: 3990000,
      image: '/images/accesorios/Rtx5090.webp',
      category: 'Accesorios',
      sourceId: 'rtx-search',
      sourceRoute: '',
      platform: '',
      genre: '',
      subcategory: '',
    }]);
  });

  it('shows global product matches for the URL search query', () => {
    render(
      <MemoryRouter initialEntries={['/buscar.html?q=RTX%205090']}>
        <SiteLayout><SearchResultsPage /></SiteLayout>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Resultados para “RTX 5090”' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tarjeta de Video RTX 5090' })).toBeTruthy();
    expect(screen.getByText('1 productos encontrados')).toBeTruthy();
    expect(screen.getByLabelText('Buscar en la tienda')).toBeTruthy();
  });

  it('matches product terms regardless of spacing and accents', () => {
    render(
      <MemoryRouter initialEntries={['/buscar.html?q=tarjeta%20rtx%205090']}>
        <SiteLayout><SearchResultsPage /></SiteLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText('1 productos encontrados')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Tarjeta de Video RTX 5090' })).toBeTruthy();
  });
});
