// Catálogo por categoría: incluye buscador, filtros y tarjetas de producto.
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import AppLink from '../components/AppLink.jsx';
import { formatPrice } from '../components/ProductCard.jsx';
import { getProducts, subscribeProducts } from '../data/mockDatabase.js';

export default function ProductCatalogPage({ title, category }) {
  // Los filtros se guardan por separado para poder combinarlos.
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts);
  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [genre, setGenre] = useState('all');
  const categories = useMemo(() => [...new Set(
    products.filter((product) => product.category === category)
      .map((product) => product.subcategory).filter(Boolean),
  )], [category, products]);
  const platforms = useMemo(() => [...new Set(
    products.filter((product) => product.category === category)
      .map((product) => product.platform).filter(Boolean),
  )], [category, products]);
  const genres = useMemo(() => [...new Set(
    products.filter((product) => product.category === category)
      .flatMap((product) => product.genre.split(/\s+/).filter(Boolean)),
  )], [category, products]);
  // Se muestran solo productos que cumplen categoría, texto y filtros activos.
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return products.filter((product) => {
      if (product.category !== category) return false;
      const matchesSearch = !query || `${product.title} ${product.description}`.toLocaleLowerCase('es').includes(query);
      const matchesSubcategory = subcategory === 'all' || product.subcategory === subcategory;
      const matchesPlatform = platform === 'all' || product.platform.toLowerCase() === platform.toLowerCase();
      const matchesGenre = genre === 'all' || product.genre.toLowerCase().split(/\s+/).includes(genre.toLowerCase());
      return matchesSearch && matchesSubcategory && matchesPlatform && matchesGenre;
    });
  }, [category, genre, platform, products, search, subcategory]);

  return (
    <main className="contenedor react-page">
        {/* Título y cantidad actualizada según los filtros seleccionados. */}
        <section className="tarjeta catalog-header">
          <div>
            <p className="catalog-eyebrow">La Taverna Gaming</p>
            <h1>{title}</h1>
          </div>
          <span className="catalog-count">{visibleProducts.length} productos</span>
        </section>

        {/* Buscador y filtros opcionales por tipo, consola y género. */}
        <section className="filtros-seccion react-catalog-filters" aria-label="Filtros del catálogo">
          <div className="catalog-filter-field">
            <label htmlFor="catalog-search">Buscar productos</label>
            <input
              id="catalog-search"
              type="search"
              value={search}
              placeholder={`Buscar en ${title.toLocaleLowerCase('es')}...`}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {categories.length > 0 && (
            <div className="catalog-filter-field">
              <label htmlFor="catalog-subcategory">Tipo</label>
              <select id="catalog-subcategory" value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
                <option value="all">Todos los tipos</option>
                {categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          )}
          {platforms.length > 0 && (
            <div className="catalog-filter-field">
              <label htmlFor="catalog-platform">Consola</label>
              <select id="catalog-platform" value={platform} onChange={(event) => setPlatform(event.target.value)}>
                <option value="all">Todas las consolas</option>
                {platforms.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          )}
          {genres.length > 0 && (
            <div className="catalog-filter-field">
              <label htmlFor="catalog-genre">Género</label>
              <select id="catalog-genre" value={genre} onChange={(event) => setGenre(event.target.value)}>
                <option value="all">Todos los géneros</option>
                {genres.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          )}
        </section>

        {/* Cada tarjeta lleva al detalle individual del producto. */}
        {visibleProducts.length > 0 ? (
          <section className="tarjeta catalog-products" aria-label={`${title}: productos disponibles`}>
            {visibleProducts.map((product) => (
              <article
                className="producto-detalle"
                key={product.id}
                onClick={(event) => {
                  if (!event.target.closest('a')) {
                    window.location.assign(`/producto.html?id=${encodeURIComponent(product.id)}`);
                  }
                }}
              >
                <img src={product.image} alt={product.title} loading="lazy" />
                <div>
                  <span className="catalog-product-category">{product.category}</span>
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                  <strong>{formatPrice(product.price)}</strong>
                  <AppLink href={`/producto.html?id=${encodeURIComponent(product.id)}`}>Comprar</AppLink>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="tarjeta sin-resultados react-no-results" role="status">
            No se encontraron productos que coincidan con la búsqueda.
          </section>
        )}
    </main>
  );
}
