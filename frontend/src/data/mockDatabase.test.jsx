// Pruebas de persistencia, CRUD y notificaciones del catálogo compartido.
import { vi } from 'vitest';
import {
  createProduct,
  deleteProduct,
  getProducts,
  resetProductDatabase,
  subscribeProducts,
  updateProduct,
} from './mockDatabase.js';

const initialProduct = {
  id: 'fixture-headset',
  sourceId: 'fixture-headset',
  title: 'Audífonos Gamer',
  description: 'Audífonos para pruebas.',
  price: 25000,
  image: '/images/accesorios/Microfono.webp',
  category: 'Accesorios',
  sourceRoute: 'Accesorios.html',
  platform: '',
  genre: '',
  subcategory: '',
};

describe('mock product database', () => {
  beforeEach(() => {
    localStorage.clear();
    resetProductDatabase([initialProduct]);
  });

  it('creates, persists, updates, and deletes products', () => {
    const created = createProduct({
      title: 'Mouse Gamer',
      description: 'Mouse de prueba.',
      price: 19990,
      image: '/images/Mouses/1.jpg',
      category: 'Mouse / Mousepad',
    });

    expect(getProducts().some((product) => product.id === created.id)).toBe(true);
    expect(JSON.parse(localStorage.getItem('taverna_react_products_v1')).length).toBe(2);

    updateProduct(created.id, { ...created, title: 'Mouse Gamer RGB' });
    expect(getProducts().find((product) => product.id === created.id).title).toBe('Mouse Gamer RGB');

    deleteProduct(created.id);
    expect(getProducts().map((product) => product.id)).toEqual([initialProduct.id]);
  });

  it('rejects incomplete and invalid product data', () => {
    expect(() => createProduct({
      title: 'A',
      description: '',
      price: 0,
      image: '',
      category: '',
    })).toThrowError();
    expect(getProducts()).toEqual([initialProduct]);
  });

  it('notifies React subscribers after each successful write', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeProducts(listener);
    createProduct({
      title: 'Teclado mecánico',
      description: 'Teclado de prueba.',
      price: 45000,
      image: '/images/accesorios/teclado1.webp',
      category: 'Accesorios',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
