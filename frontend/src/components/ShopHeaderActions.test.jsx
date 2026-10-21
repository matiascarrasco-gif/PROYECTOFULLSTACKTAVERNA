// Pruebas de acceso, sesión, carrito, reseñas y edición de perfil.
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ShopHeaderActions from './ShopHeaderActions.jsx';
import CartPage from '../pages/CartPage.jsx';

describe('ShopHeaderActions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens the login and registration forms', () => {
    render(<ShopHeaderActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(screen.getByRole('dialog', { name: /Mi Cuenta/ })).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Registrarse' }));
    expect(screen.getByLabelText('Nombres')).toBeTruthy();
  });

  it('opens registration directly from the create-account header button', () => {
    render(<ShopHeaderActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByLabelText('Nombres')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
  });

  it('does not expose the cart until a customer has signed in', () => {
    localStorage.setItem('carrito', JSON.stringify([
      { id: 'console-1', titulo: 'Consola de prueba', precio: 100000, imagen: '/images/consolas/ps1.png', cantidad: 1 },
    ]));
    render(<ShopHeaderActions />);

    expect(screen.queryByRole('link', { name: 'Abrir carrito, 1 productos' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('shows the cart link for an active account', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombres: 'Gamer', correo: 'gamer@example.com' }));
    localStorage.setItem('carrito', JSON.stringify([
      { id: 'console-1', titulo: 'Consola de prueba', precio: 100000, cantidad: 1 },
    ]));
    render(<ShopHeaderActions />);

    expect(screen.getByRole('link', { name: 'Abrir carrito, 1 productos' }).getAttribute('href')).toBe('/carrito.html');
  });

  it('signs in with the existing simulated account flow and permits sign out', () => {
    render(<ShopHeaderActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'gamer@duoc.cl' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByLabelText('Correo electrónico').closest('form'));

    expect(JSON.parse(localStorage.getItem('usuarioActivo')).isDuoc).toBe(true);
    fireEvent.click(screen.getAllByRole('button', { name: 'Mi cuenta' })[0]);
    expect(screen.getByRole('dialog', { name: 'Mi Perfil' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));
    expect(localStorage.getItem('usuarioActivo')).toBeNull();
    expect(screen.queryByRole('link', { name: /Abrir carrito/ })).toBeNull();
  });

  it('validates and saves profile RUT and synchronizes account details with checkout', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({
      nombres: 'Camila',
      apellidoPaterno: 'Rojas',
      apellidoMaterno: 'Pérez',
      correo: 'camila@example.com',
      rut: '123456785',
    }));
    localStorage.setItem('carrito', JSON.stringify([
      { id: 'game-1', titulo: 'Juego', precio: 1000, cantidad: 1 },
    ]));
    render(<><ShopHeaderActions /><CartPage /></>);

    fireEvent.click(screen.getAllByRole('button', { name: 'Mi cuenta' })[0]);
    fireEvent.change(screen.getByLabelText('Apellido paterno'), { target: { value: 'González' } });
    fireEvent.change(screen.getByLabelText('RUT (sin puntos ni guion)'), { target: { value: '123456784' } });
    expect(screen.getByRole('alert').textContent).toContain('dígito verificador');

    fireEvent.change(screen.getByLabelText('RUT (sin puntos ni guion)'), { target: { value: '123456785' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(screen.getByLabelText('Apellido paterno *').value).toBe('González');
    expect(screen.getByLabelText('RUT').value).toBe('123456785');
    expect(JSON.parse(localStorage.getItem('usuarioActivo')).apellidoPaterno).toBe('González');
  });

  it('requires a session before adding a product and adds it after login', () => {
    render(<ShopHeaderActions />);
    const product = { id: 'p1', title: 'Control', price: 50000, image: '/control.png', category: 'Accesorios' };
    act(() => {
      window.dispatchEvent(new CustomEvent('taverna:login-required', { detail: { product } }));
    });

    expect(screen.getByRole('status').textContent).toContain('primero debes iniciar sesión');
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'gamer@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByLabelText('Correo electrónico').closest('form'));

    expect(JSON.parse(localStorage.getItem('carrito'))[0].titulo).toBe('Control');
    expect(screen.getByRole('link', { name: 'Abrir carrito, 1 productos' })).toBeTruthy();
  });

  it('requests sign-in for a review without adding a product to the cart', () => {
    render(<ShopHeaderActions />);
    act(() => {
      window.dispatchEvent(new CustomEvent('taverna:login-required', { detail: { action: 'review' } }));
    });

    expect(screen.getByRole('status').textContent).toContain('dejar una reseña');
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'gamer@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByLabelText('Correo electrónico').closest('form'));

    expect(localStorage.getItem('carrito')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('compartir tu reseña');
  });

  it('offers administrator sign-in only on the Blog page', () => {
    window.history.replaceState({}, '', '/blog.html');
    const { unmount } = render(<ShopHeaderActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(screen.getByRole('button', { name: 'Iniciar sesión como administrador' })).toBeTruthy();
    unmount();

    window.history.replaceState({}, '', '/');
    render(<ShopHeaderActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(screen.queryByRole('button', { name: 'Iniciar sesión como administrador' })).toBeNull();
  });
});
