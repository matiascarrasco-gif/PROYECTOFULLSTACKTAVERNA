// Prueba que las rutas principales carguen la vista que corresponde.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the correct view for a catalog route', () => {
    render(
      <MemoryRouter
        initialEntries={['/juegos.html']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Juegos Digitales' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Grand Theft Auto VI' })).toBeTruthy();
  });

  it('resets catalog filters when navigating to another product section', () => {
    render(
      <MemoryRouter
        initialEntries={['/juegos.html']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );

    const search = screen.getByRole('searchbox', { name: 'Buscar productos' });
    fireEvent.change(search, { target: { value: 'GTA' } });
    expect(screen.getByRole('heading', { name: 'Grand Theft Auto VI' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'FC 27' })).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: 'Mouse / Mousepad' }));

    expect(screen.getByRole('heading', { name: 'Mouse / Mousepad' })).toBeTruthy();
    expect(screen.getByRole('searchbox', { name: 'Buscar productos' }).value).toBe('');
    expect(screen.getByRole('heading', { name: 'Mouse Gamer Alámbrico GXT 160 Ture RGB - Negro' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mouse HyperX Pulsefire Fuse Wireless - Negro' })).toBeTruthy();
  });
});
