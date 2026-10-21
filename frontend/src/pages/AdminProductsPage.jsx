// Panel de administración: permite crear, editar, buscar y eliminar productos.
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import {
  createProduct,
  deleteProduct,
  getProducts,
  subscribeProducts,
  updateProduct,
} from '../data/mockDatabase.js';

const categories = [
  'Accesorios',
  'Consolas',
  'Juegos',
  'Mouse / Mousepad',
  'PC Gamers',
  'Poleras Personalizadas',
  'Polerones Gamers Personalizados',
  'Sillas Gamers',
];
// Estado inicial reutilizado cuando se limpia o cancela el formulario.
const emptyForm = { title: '', description: '', price: '', image: '', category: 'Accesorios' };

export default function AdminProductsPage() {
  // El catálogo se actualiza en vivo cuando el CRUD local hace cambios.
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts);
  const [authorized] = useState(() => localStorage.getItem('taverna_admin_logged') === 'true');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Búsqueda administrativa por nombre y categoría.
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return query ? products.filter((product) =>
      `${product.title} ${product.category}`.toLocaleLowerCase('es').includes(query),
    ) : products;
  }, [products, search]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId('');
    setError('');
  }

  // Decide entre crear y editar, mostrando errores sin ocultarlos.
  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editingId) {
        updateProduct(editingId, form);
        setMessage('Producto actualizado.');
      } else {
        createProduct(form);
        setMessage('Producto creado.');
      }
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el producto.');
    }
  }

  // Carga un producto existente en el formulario para editarlo.
  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      image: product.image,
      category: product.category,
    });
    setMessage('');
    setError('');
    const formElement = document.getElementById('product-admin-form');
    if (typeof formElement?.scrollIntoView === 'function') {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Elimina el producto seleccionado y actualiza el catálogo compartido.
  function removeProduct(id) {
    setError('');
    setMessage('');
    try {
      deleteProduct(id);
      if (editingId === id) resetForm();
      setMessage('Producto eliminado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el producto.');
    }
  }

  // El formulario y el listado se muestran solo a la sesión administrativa.
  return (
    <main className="container py-4 react-page">
        {/* Resumen de administración y cantidad total de productos. */}
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <p className="text-uppercase text-secondary fw-semibold mb-1">Administración</p>
            <h1 className="h2 mb-0">Gestión de productos</h1>
          </div>
          <span className="badge text-bg-dark">{products.length} productos</span>
        </div>

        {!authorized ? (
          <div className="alert alert-warning" role="alert">
            <h2 className="h5">Acceso restringido</h2>
            <p className="mb-2">Inicia sesión como administrador desde la tienda para gestionar el catálogo.</p>
            <a className="btn btn-primary" href="/">Ir a la tienda</a>
          </div>
        ) : (
          <>
            {/* Formulario reutilizado para crear un producto o editarlo. */}
            <section className="card p-3 p-md-4 mb-4" aria-labelledby="product-admin-heading">
              <h2 id="product-admin-heading" className="h4">
                {editingId ? 'Editar producto' : 'Agregar producto'}
              </h2>
              <form id="product-admin-form" className="row g-3" onSubmit={handleSubmit}>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="product-title">Nombre</label>
                  <input className="form-control" id="product-title" name="title" value={form.title} onChange={updateField} minLength={2} maxLength={120} required />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label" htmlFor="product-price">Precio (CLP)</label>
                  <input className="form-control" id="product-price" name="price" type="number" min="1" step="1" value={form.price} onChange={updateField} required />
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label" htmlFor="product-category">Categoría</label>
                  <select className="form-select" id="product-category" name="category" value={form.category} onChange={updateField} required>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="product-description">Descripción</label>
                  <textarea className="form-control" id="product-description" name="description" rows="3" maxLength={2000} value={form.description} onChange={updateField} required />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="product-image">Ruta de imagen o URL</label>
                  <input className="form-control" id="product-image" name="image" type="text" value={form.image} onChange={updateField} maxLength={500} placeholder="/images/accesorios/producto.webp" required />
                </div>
                {error && <div className="col-12"><div className="alert alert-danger mb-0" role="alert">{error}</div></div>}
                {message && <div className="col-12"><div className="alert alert-success mb-0" role="status">{message}</div></div>}
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
                  {editingId && <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancelar edición</button>}
                </div>
              </form>
            </section>

            {/* Listado filtrable con acciones para modificar o quitar productos. */}
            <section aria-labelledby="product-list-heading">
              <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
                <h2 id="product-list-heading" className="h4 mb-0">Catálogo</h2>
                <div>
                  <label className="form-label visually-hidden" htmlFor="admin-product-search">Buscar producto en el catálogo</label>
                  <input className="form-control" id="admin-product-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto..." />
                </div>
              </div>
              {filteredProducts.length === 0 ? (
                <p className="alert alert-info" role="status">No hay productos para mostrar.</p>
              ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                  {filteredProducts.map((product) => (
                    <div className="col" key={product.id}>
                      <div className="card h-100 react-product-card">
                        <img className="card-img-top react-product-image" src={product.image} alt={product.title} loading="lazy" />
                        <div className="card-body d-flex flex-column">
                          <span className="badge text-bg-secondary align-self-start mb-2">{product.category}</span>
                          <h3 className="card-title h5">{product.title}</h3>
                          <p className="card-text text-body-secondary flex-grow-1">{product.description}</p>
                          <div className="d-flex gap-2 mt-auto">
                            <button className="btn btn-outline-primary flex-grow-1" type="button" aria-label={`Editar ${product.title}`} onClick={() => editProduct(product)}>Editar</button>
                            <button className="btn btn-outline-danger" type="button" aria-label={`Eliminar ${product.title}`} onClick={() => removeProduct(product.id)}>Eliminar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
    </main>
  );
}
