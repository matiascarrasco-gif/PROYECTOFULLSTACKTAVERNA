// Resultados globales de búsqueda con coincidencias por todas las palabras.
import React, { useMemo, useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, subscribeProducts } from '../data/mockDatabase.js';

export default function SearchResultsPage() {
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  // Normaliza acentos, mayúsculas y espacios para hacer más flexible la búsqueda.
  const normalize = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
  // Compara los términos escritos con nombre, descripción y categoría.
  const matches = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return [];
    const queryTerms = normalizedQuery.split(' ');
    return products.filter((product) => {
      const searchableText = normalize(`${product.title} ${product.description} ${product.category}`);
      return queryTerms.every((term) => searchableText.includes(term));
    });
  }, [products, query]);

  return (
    <main className="contenedor react-page search-results-page">
        <section className="tarjeta">
          <p className="catalog-eyebrow">Buscar en La Taverna</p>
          <h1>Resultados para “{query || 'tu búsqueda'}”</h1>
          <p role="status">{matches.length} productos encontrados</p>
        </section>
        {matches.length ? (
          <section className="search-results-grid" aria-label="Resultados de búsqueda">
            {matches.map((product) => <ProductCard key={product.id} product={product} />)}
          </section>
        ) : (
          <section className="tarjeta react-no-results" role="status">
            No encontramos productos que coincidan. Prueba con otro nombre o categoría.
          </section>
        )}
    </main>
  );
}
