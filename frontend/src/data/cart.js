// Funciones compartidas para sesión, carrito, RUT y validación del checkout.
export const CART_UPDATED_EVENT = 'taverna:cart-updated';
export const LOGIN_REQUIRED_EVENT = 'taverna:login-required';
export const USER_UPDATED_EVENT = 'taverna:user-updated';
export const CART_STORAGE_KEY = 'carrito';

export function readCart() {
  // El carrito se guarda localmente para conservarlo al cambiar de vista.
  const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  if (!Array.isArray(saved)) throw new Error('El carrito guardado no tiene un formato válido.');
  return saved;
}

export function getActiveUser() {
  return JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
}

export function getRutValidationError(value, { required = false } = {}) {
  // Valida formato chileno y calcula el dígito verificador módulo 11.
  const rut = String(value ?? '').trim().toUpperCase();
  if (!rut) return required ? 'El RUT es obligatorio.' : '';
  if (!/^[0-9K]+$/.test(rut)) return 'Usa solo números y K como dígito verificador, sin puntos ni guion.';
  if (rut.length > 9) return 'El RUT no puede superar 9 caracteres.';
  if (rut.length < 8) return 'El RUT debe tener entre 8 y 9 caracteres.';

  const body = rut.slice(0, -1);
  const providedCheckDigit = rut.slice(-1);
  if (!/^\d{7,8}$/.test(body)) return 'El RUT debe contener 7 u 8 números antes del dígito verificador.';

  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expectedCheckDigit = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  if (providedCheckDigit !== expectedCheckDigit) return 'El dígito verificador del RUT no es válido.';
  return '';
}

export function addProductToCart(product) {
  // Si ya existe, aumenta cantidad; si no, guarda una versión para el carrito.
  const cart = readCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.cantidad = (Number(existing.cantidad) || 0) + 1;
  } else {
    cart.push({
      id: product.id,
      titulo: product.title,
      precio: product.price,
      imagen: product.image,
      cantidad: 1,
      seccion: product.category,
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function requestLoginForProduct(product, action = 'cart') {
  window.dispatchEvent(new CustomEvent(LOGIN_REQUIRED_EVENT, { detail: { product, action } }));
}

export function formatItemPrice(item) {
  if (typeof item.precio === 'number') return item.precio;
  const value = Number(String(item.precio ?? '').replace(/[^\d-]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

export function createOrderNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

export function validateCheckout(customer, cart) {
  // Centraliza las reglas para que el formulario y el pago usen los mismos datos.
  const errors = [];
  if (!customer.nombres.trim()) errors.push('El nombre es obligatorio.');
  const paternalLastName = customer.apellidoPaterno ?? customer.apellidos ?? '';
  const maternalLastName = customer.apellidoMaterno ?? '';
  if (customer.apellidoPaterno === undefined) {
    if (!String(paternalLastName).trim()) errors.push('Los apellidos son obligatorios.');
  } else {
    if (!String(paternalLastName).trim()) errors.push('El apellido paterno es obligatorio.');
    if (!String(maternalLastName).trim()) errors.push('El apellido materno es obligatorio.');
  }
  if (!customer.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.correo.trim())) {
    errors.push('Ingresa un correo electrónico válido.');
  }
  const rutError = getRutValidationError(customer.rut);
  if (rutError) errors.push(rutError);
  if (!customer.calle.trim()) errors.push('La calle y número son obligatorios.');
  if (!customer.region.trim()) errors.push('La región es obligatoria.');
  if (!customer.comuna.trim()) errors.push('La comuna es obligatoria.');
  if (cart.length === 0) errors.push('Agrega al menos un producto antes de pagar.');
  return errors;
}
