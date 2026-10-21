// Inicio: slider principal, accesos a categorías y productos destacados.
import React, { useState, useSyncExternalStore } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import AppLink from '../components/AppLink.jsx';
import { getProducts, subscribeProducts } from '../data/mockDatabase.js';

const featuredSlides = [
  {
    title: 'GTA VI',
    description: 'Reserva tu copia y disfruta esta increíble experiencia.',
    image: '/images/jasonylucia.jpg',
    productTitle: 'grand theft auto vi',
    action: 'Reservar',
  },
  {
    title: 'FC 27',
    description: 'Vive la emoción del fútbol con FC 27.',
    image: '/images/fc27.avif',
    productTitle: 'fc 27',
    action: 'Comprar',
  },
  {
    title: 'Mando PS5 GTA VI Limited Edition',
    description: 'Control personalizado para los fanáticos de GTA.',
    image: '/images/mandogta6.webp',
    productTitle: 'mando gta vi ps5',
    action: 'Comprar',
  },
];

// Categorías que se muestran como secciones reutilizables en la portada.
const featuredCategories = [
  ['Juegos Digitales', 'Juegos', '/juegos.html'],
  ['Consolas', 'Consolas', '/consolas.html'],
  ['PC Gamers', 'PC Gamers', '/pcgamers.html'],
  ['Mouse / Mousepad', 'Mouse / Mousepad', '/mouse-mousepad.html'],
  ['Sillas Gamers', 'Sillas Gamers', '/sillasgamers.html'],
  ['Accesorios', 'Accesorios', '/accesorios.html'],
  ['Poleras Personalizadas', 'Poleras Personalizadas', '/poleras.html'],
  ['Polerones Gamers Personalizados', 'Polerones Gamers Personalizados', '/poleron.html'],
];

export default function HomePage() {
  const products = useSyncExternalStore(subscribeProducts, getProducts, getProducts);
  const [slideIndex, setSlideIndex] = useState(0);

  // Cicla el slider en ambas direcciones sin salir de sus diapositivas.
  function moveSlide(offset) {
    setSlideIndex((current) => (current + offset + featuredSlides.length) % featuredSlides.length);
  }

  return (
    <main className="contenedor react-page react-home-page">
        {/* Slider de anuncios destacados; botones y puntos cambian la diapositiva. */}
        <section className="tarjeta bienvenida" aria-label="Anuncios destacados">
          <p className="slider-label-destacados">✨ Anuncios Destacados ✨</p>
          <div className="slider-container">
            <button className="slider-btn prev-btn" type="button" aria-label="Anuncio anterior" onClick={() => moveSlide(-1)}>&#10094;</button>
            <button className="slider-btn next-btn" type="button" aria-label="Anuncio siguiente" onClick={() => moveSlide(1)}>&#10095;</button>
            <div className="slider-slides">
              {featuredSlides.map((item, index) => (
                (() => {
                  const product = products.find((entry) => entry.title.toLowerCase().includes(item.productTitle));
                  const productHref = product
                    ? `/producto.html?id=${encodeURIComponent(product.id)}`
                    : '/juegos.html';
                  return (
                    <article
                      className={`slide${index === slideIndex ? ' active' : ''}`}
                      key={item.title}
                      aria-hidden={index !== slideIndex}
                      onClick={(event) => {
                        if (product && !event.target.closest('a')) window.location.assign(productHref);
                      }}
                    >
                      <img className="imagen-principal" src={item.image} alt={item.title} />
                      <div className="slide-overlay">
                        <h2>{item.title}</h2>
                        <p>{item.description}</p>
                        <AppLink className="boton-compra" href={productHref} tabIndex={index === slideIndex ? 0 : -1}>{item.action}</AppLink>
                      </div>
                    </article>
                  );
                })()
              ))}
            </div>
            <div className="slider-dots" aria-label={`Anuncio ${slideIndex + 1} de ${featuredSlides.length}`}>
              {featuredSlides.map((item, index) => (
                <button
                  key={item.title}
                  className={`dot${index === slideIndex ? ' active' : ''}`}
                  type="button"
                  aria-label={`Mostrar anuncio ${index + 1}`}
                  aria-current={index === slideIndex ? 'true' : undefined}
                  onClick={() => setSlideIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Selección inicial de productos para descubrir desde la portada. */}
        <section className="tarjeta productos-seccion" aria-labelledby="featured-heading">
          <div className="seccion-header">
            <h2 id="featured-heading">Productos destacados</h2>
            <AppLink className="ver-todo-btn" href="/accesorios.html">Explorar tienda →</AppLink>
          </div>
          {products.length ? (
            <div className="react-home-products-grid">
              {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className="react-home-empty" role="status">Todavía no hay productos destacados.</p>
          )}
        </section>

        {/* Bloques de productos por categoría; usan la misma tarjeta reutilizable. */}
        {featuredCategories.map(([title, category, href]) => {
          const categoryProducts = products.filter((product) => product.category === category).slice(0, 4);
          if (!categoryProducts.length) return null;

          return (
            <section className="tarjeta productos-seccion" key={category} aria-labelledby={`home-${category}`}>
              <div className="seccion-header">
                <h2 id={`home-${category}`}>{title}</h2>
                <AppLink className="ver-todo-btn" href={href}>Ver todo <span aria-hidden="true">→</span></AppLink>
              </div>
              <div className="react-home-products-grid">
                {categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          );
        })}
    </main>
  );
}
