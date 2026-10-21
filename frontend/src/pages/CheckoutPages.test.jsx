// Pruebas del checkout, validaciones, precarga de perfil y resultado de pago.
import React from 'react';
import { render, screen } from '@testing-library/react';
import CartPage from './CartPage.jsx';
import PurchaseResultPage from './PurchaseResultPage.jsx';
import { validateCheckout } from '../data/cart.js';

describe('checkout and purchase result pages', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('requires an account before displaying the checkout form', () => {
    render(<CartPage />);

    expect(screen.getByRole('heading', { name: 'Inicia sesión para acceder al carrito' })).toBeTruthy();
    expect(screen.queryByLabelText('Calle y número *')).toBeNull();
  });

  it('shows item details and the delivery information form for signed-in customers', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({
      nombres: 'Gamer',
      apellidos: 'Demo',
      correo: 'gamer@example.com',
    }));
    localStorage.setItem('carrito', JSON.stringify([
      { id: 'mouse-1', titulo: 'Mouse gamer', precio: 25990, imagen: '/mouse.webp', cantidad: 2, seccion: 'Accesorios' },
    ]));
    render(<CartPage />);

    expect(screen.getByRole('heading', { name: 'Carrito de compras' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mouse gamer' })).toBeTruthy();
    expect(screen.getByLabelText('Nombres *').value).toBe('Gamer');
    expect(screen.getByLabelText('Correo electrónico *').value).toBe('gamer@example.com');
    expect(screen.getByLabelText('Departamento (opcional)')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pagar pedido' }).disabled).toBe(false);
  });

  it('prefills both surnames and RUT from the active account', () => {
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
    render(<CartPage />);

    expect(screen.getByLabelText('Apellido paterno *').value).toBe('Rojas');
    expect(screen.getByLabelText('Apellido materno *').value).toBe('Pérez');
    expect(screen.getByLabelText('RUT').value).toBe('123456785');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a RUT validation warning inline when the checkout RUT is invalid', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({
      nombres: 'Camila',
      apellidos: 'Rojas Pérez',
      correo: 'camila@example.com',
      rut: '123456784',
    }));
    render(<CartPage />);

    expect(screen.getByRole('alert').textContent).toContain('dígito verificador');
  });

  it('reports missing customer and delivery fields for unsuccessful payments', () => {
    const errors = validateCheckout({
      nombres: '',
      apellidos: '',
      correo: 'invalid-email',
      calle: '',
      region: '',
      comuna: '',
    }, [{ id: 'item-1' }]);

    expect(errors).toEqual([
      'El nombre es obligatorio.',
      'Los apellidos son obligatorios.',
      'Ingresa un correo electrónico válido.',
      'La calle y número son obligatorios.',
      'La región es obligatoria.',
      'La comuna es obligatoria.',
    ]);
  });

  it('accepts a complete delivery address for simulated payment', () => {
    expect(validateCheckout({
      nombres: 'Camila',
      apellidos: 'Rojas',
      correo: 'camila@example.com',
      calle: 'Av. Siempre Viva 123',
      region: 'Metropolitana',
      comuna: 'Santiago',
    }, [{ id: 'item-1' }])).toEqual([]);
  });

  it('renders the failed payment number, customer data, and validation messages', () => {
    localStorage.setItem('taverna:last-order', JSON.stringify({
      number: 483216,
      customer: {
        nombres: 'Ana',
        apellidos: 'Pérez',
        correo: 'ana@example.com',
        calle: '',
        departamento: '',
        region: '',
        comuna: 'Santiago',
        indicaciones: '',
      },
      products: [],
      total: 0,
      errors: ['El nombre es obligatorio.', 'La región es obligatoria.'],
    }));
    render(<PurchaseResultPage success={false} />);

    expect(screen.getByRole('heading', { name: 'No se pudo realizar el pago nro. 483216' })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('La región es obligatoria.');
    expect(screen.getByText('Ana Pérez')).toBeTruthy();
  });
});
