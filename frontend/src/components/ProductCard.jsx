// Tarjeta reutilizable para mostrar un producto y su acceso a la compra.
import React from 'react';
import AppLink from './AppLink.jsx';

const currency = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

// Formatea precios usando pesos chilenos sin decimales.
export function formatPrice(price) {
  return currency.format(price);
}

export default function ProductCard({ product }) {
  // La ruta mantiene el identificador para abrir el detalle correcto.
  const productHref = `/producto.html?id=${encodeURIComponent(product.id)}`;

  return (
    <article
      className="producto"
      onClick={(event) => {
        if (!event.target.closest('a')) window.location.assign(productHref);
      }}
    >
      <AppLink className="producto-enlace" href={productHref}>
        <img src={product.image} alt={product.title} loading="lazy" />
        <h3>{product.title}</h3>
      </AppLink>
      <p>{formatPrice(product.price)}</p>
      <AppLink href={productHref}>Comprar</AppLink>
    </article>
  );
}
