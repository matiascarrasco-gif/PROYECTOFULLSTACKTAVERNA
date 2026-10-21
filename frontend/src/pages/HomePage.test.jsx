// Pruebas de portada: slider principal y navegación a productos.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import HomePage from './HomePage.jsx';
import { resetProductDatabase } from '../data/mockDatabase.js';
import { getSeedProducts } from '../data/seedProducts.js';

describe('HomePage', () => {
  beforeEach(() => resetProductDatabase(getSeedProducts()));

  it('shows the featured announcement and changes slides', () => {
    const { container } = render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'GTA VI' })).toBeTruthy();
    expect(container.querySelector('.slide.active .boton-compra').getAttribute('href')).toBe('/producto.html?id=juegos-gta6');

    fireEvent.click(screen.getByRole('button', { name: 'Anuncio siguiente' }));

    expect(container.querySelector('.slide.active h2').textContent).toBe('FC 27');
    expect(container.querySelector('.slide.active .boton-compra').getAttribute('href')).toBe('/producto.html?id=juegos-fc27');

    fireEvent.click(screen.getByRole('button', { name: 'Anuncio siguiente' }));
    expect(container.querySelector('.slide.active .boton-compra').getAttribute('href')).toBe('/producto.html?id=consolas-mandogta6');
  });

  it('uses a purchase call to action on featured product cards', () => {
    render(<HomePage />);
    const purchaseLinks = screen.getAllByRole('link', { name: 'Comprar' })
      .filter((link) => link.closest('.producto'));

    expect(purchaseLinks.length).toBeGreaterThan(0);
    expect(purchaseLinks[0].getAttribute('href')).toMatch(/^\/producto\.html\?id=/);
  });
});
