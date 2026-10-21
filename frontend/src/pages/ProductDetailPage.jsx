// Detalle del producto: información, carrito y reseñas guardadas en el navegador.
import React, { useState, useSyncExternalStore } from 'react';
import { useEffect } from 'react';
import { formatPrice } from '../components/ProductCard.jsx';
import { getProductById, getProducts, subscribeProducts } from '../data/mockDatabase.js';
import { addProductToCart, getActiveUser, requestLoginForProduct } from '../data/cart.js';

export default function ProductDetailPage() {
  // El producto se identifica desde los parámetros de la URL.
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts);
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('id') ?? '';
  const selectedRoute = params.get('pagina') ?? '';
  const product = getProductById(selectedId, selectedRoute);
  const [notice, setNotice] = useState('');
  const reviewKey = product
    ? `resenas_${product.sourceId || product.id || product.image.split('/').pop()}`
    : '';
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Recupera reseñas guardadas para este producto sin mezclarlas con otras.
  useEffect(() => {
    if (!reviewKey) return;
    try {
      const storedReviews = JSON.parse(localStorage.getItem(reviewKey) || '[]');
      if (!Array.isArray(storedReviews)) throw new Error('El formato guardado no es válido.');
      setReviews(storedReviews);
      setReviewError('');
    } catch (error) {
      setReviewError(error instanceof Error
        ? `No se pudieron cargar las reseñas: ${error.message}`
        : 'No se pudieron cargar las reseñas guardadas.');
    }
  }, [reviewKey]);

  // La compra requiere sesión; el encabezado gestiona la solicitud de acceso.
  function addToCart() {
    if (!getActiveUser()) {
      requestLoginForProduct(product);
      return;
    }
    addProductToCart(product);
    setNotice('Producto agregado al carrito.');
  }

  // Guarda una nueva opinión local solo después de validar sesión y comentario.
  function submitReview(event) {
    event.preventDefault();
    if (!getActiveUser()) {
      requestLoginForProduct(null, 'review');
      return;
    }
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setReviewError('Escribe un comentario antes de enviar tu reseña.');
      return;
    }

    const user = getActiveUser();
    const nextReviews = [{
      usuario: user?.nombres?.split(' ')[0] || user?.correo || 'Usuario',
      estrellas: Number(rating),
      comentario: trimmedComment,
    }, ...reviews];

    try {
      localStorage.setItem(reviewKey, JSON.stringify(nextReviews));
      setReviews(nextReviews);
      setComment('');
      setReviewError('');
      setNotice('Gracias. Tu reseña fue publicada.');
    } catch (error) {
      setReviewError(error instanceof Error
        ? `No se pudo guardar la reseña: ${error.message}`
        : 'No se pudo guardar la reseña.');
    }
  }

  return (
    <main className="contenedor react-page">
        {/* Información principal y acción de compra del producto seleccionado. */}
        {!product ? (
          <section className="tarjeta alert-warning" role="alert">
            No se encontró ese producto. <a href="/">Volver a la tienda</a>
          </section>
        ) : (
          <article className="tarjeta producto-individual">
            <div className="producto-imagen-grande">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="producto-informacion">
              <span className="catalog-product-category">{product.category}</span>
              <h1>{product.title}</h1>
              <div className="producto-descripcion-seccion">
                <h2>Descripción del producto</h2>
                <p>{product.description}</p>
              </div>
              <strong>{formatPrice(product.price)}</strong>
              <button className="boton-comprar-individual" type="button" onClick={addToCart}>
                🛒 Agregar al carrito
              </button>
              {notice && <p className="react-shop-notice" role="status">{notice}</p>}
            </div>
          </article>
        )}
        {/* Las reseñas se guardan por producto para mantenerlas separadas. */}
        {product && (
          <section className="tarjeta product-reviews" aria-labelledby="product-reviews-heading">
            <h2 id="product-reviews-heading">Reseñas de clientes</h2>
            {reviews.length ? (
              <ul className="product-review-list">
                {reviews.map((review, index) => {
                  const stars = Math.max(1, Math.min(5, Number(review.estrellas) || 5));
                  return (
                    <li className="product-review" key={`${review.usuario}-${index}`}>
                      <p className="product-review-stars" aria-label={`${stars} de 5 estrellas`}>
                        {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                      </p>
                      <p>{review.comentario}</p>
                      <span>— {review.usuario || 'Usuario'}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="product-review-empty">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
            )}
            <form className="product-review-form" onSubmit={submitReview}>
              <h3>Dejar una reseña</h3>
              <label htmlFor="product-review-rating">Valoración</label>
              <select id="product-review-rating" value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value="5">★★★★★ Excelente</option>
                <option value="4">★★★★ Muy bueno</option>
                <option value="3">★★★ Bueno</option>
                <option value="2">★★ Regular</option>
                <option value="1">★ Malo</option>
              </select>
              <label htmlFor="product-review-comment">Comentario</label>
              <textarea
                id="product-review-comment"
                rows="3"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="¿Qué te pareció este producto?"
              />
              <button className="boton-comprar-individual" type="submit">Enviar reseña</button>
              {reviewError && <p className="product-review-error" role="alert">{reviewError}</p>}
            </form>
          </section>
        )}
    </main>
  );
}
