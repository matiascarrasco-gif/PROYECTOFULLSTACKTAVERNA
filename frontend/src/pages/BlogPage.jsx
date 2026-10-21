// Blog: noticias filtrables, artículo destacado, lectura y suscripción visual.
import React, { useMemo, useState } from 'react';

const articles = [
  {
    id: 'gta6',
    category: 'juegos',
    categoryLabel: 'Juegos',
    title: 'GTA VI: Todo lo que debes saber antes del lanzamiento definitivo',
    date: '10 Sep 2026',
    readTime: '6 min',
    author: 'Redacción LT',
    image: '/images/jasonylucia.jpg',
    excerpt: 'Rockstar Games ha confirmado la fecha de lanzamiento de Grand Theft Auto VI para finales de 2026. El juego llega con un mapa enorme inspirado en Miami, dos protagonistas jugables y una historia que promete superar a GTA V.',
  },
  {
    id: 'fc27',
    category: 'juegos',
    categoryLabel: 'Juegos',
    title: 'FC 27: El fútbol virtual nunca fue tan real',
    date: '5 Sep 2026',
    readTime: '4 min',
    author: 'Redacción LT',
    image: '/images/juegos/fc27-ps5-0.webp',
    excerpt: 'EA Sports FC 27 llega con un nuevo motor físico, animaciones mejoradas y el regreso del modo carrera renovado. ¿Vale la pena el upgrade desde el FC 26?',
  },
  {
    id: 'bf6',
    category: 'juegos',
    categoryLabel: 'Juegos',
    title: 'Battlefield 6: ¿Por fin de vuelta a su mejor forma?',
    date: '2 Sep 2026',
    readTime: '5 min',
    author: 'Gamer Review',
    image: '/images/juegos/battlefield-6-ps5.webp',
    excerpt: 'Después del polémico lanzamiento de BF 2042, la saga promete redención con mapas destructibles de nueva generación y un modo campaña épico.',
  },
  {
    id: 'switch2',
    category: 'consolas',
    categoryLabel: 'Consolas',
    title: 'Nintendo Switch 2: Análisis completo tras el primer mes',
    date: '28 Ago 2026',
    readTime: '4 min',
    author: 'Redacción LT',
    image: '/images/consolas/nintendoswitch2.png',
    excerpt: 'La nueva consola portátil de Nintendo lleva más de un mes en el mercado. ¿Justifica su precio? Rendimiento, catálogo y compatibilidad con juegos anteriores.',
  },
  {
    id: 'rtx5090',
    category: 'accesorios',
    categoryLabel: 'Accesorios',
    title: 'RTX 5090: La GPU más brutal del mercado llega a La Taverna',
    date: '22 Ago 2026',
    readTime: '7 min',
    author: 'Hardware Team',
    image: '/images/accesorios/Rtx5090.webp',
    excerpt: 'La Nvidia GeForce RTX 5090 ya está disponible. 32GB GDDR7, ray tracing en tiempo real y rendimiento que deja sin palabras. Benchmarks y precios reales.',
  },
  {
    id: 'requiem',
    category: 'juegos',
    categoryLabel: 'Juegos',
    title: 'Resident Evil Requiem: El horror que no te dejará dormir',
    date: '15 Ago 2026',
    readTime: '5 min',
    author: 'Terror Gamer',
    image: '/images/juegos/resident-evil-requiem-ps5.webp',
    excerpt: 'Capcom ofrece una experiencia espeluznante con gráficos ultrarrealistas, recursos escasos y el regreso a la tensión psicológica del survival horror.',
  },
  {
    id: 'setup',
    category: 'setup',
    categoryLabel: 'Setup',
    title: '5 accesorios gaming que transformarán tu setup en 2026',
    date: '10 Ago 2026',
    readTime: '5 min',
    author: 'Setup Tips',
    image: '/images/accesorios/teclado1.webp',
    excerpt: 'Descubre periféricos que pueden mejorar tu espacio de juego: teclados mecánicos, mousepads XL, sillas ergonómicas y auriculares envolventes.',
  },
  {
    id: 'cyberpunk',
    category: 'opinion',
    categoryLabel: 'Opinión',
    title: '¿Por qué Cyberpunk 2077 sigue siendo relevante en 2026?',
    date: '5 Ago 2026',
    readTime: '6 min',
    author: 'Columna LT',
    image: '/images/juegos/cyberpunk-2077-ps5.webp',
    excerpt: 'Han pasado años desde su lanzamiento caótico y hoy se considera uno de los mejores RPGs de la generación. Una reflexión sobre su redención y legado.',
  },
  {
    id: 'gow',
    category: 'juegos',
    categoryLabel: 'Juegos',
    title: 'God of War Ragnarok: Por qué es el mejor juego de PS5',
    date: '1 Ago 2026',
    readTime: '4 min',
    author: 'Redacción LT',
    image: '/images/juegos/god-of-war-ragnarok-ps5.webp',
    excerpt: 'Te explicamos por qué Ragnarok sigue siendo el estándar de calidad en exclusivos de Sony y una aventura imprescindible de PlayStation.',
  },
  {
    id: 'ps5slim',
    category: 'consolas',
    categoryLabel: 'Consolas',
    title: 'PS5 Slim vs PS5 original: ¿Cuál comprar hoy?',
    date: '25 Jul 2026',
    readTime: '3 min',
    author: 'Guía de Compra',
    image: '/images/consolas/ps5slim.png',
    excerpt: 'La versión Slim es más pequeña, más barata y tiene lector de disco separable. Te ayudamos a decidir qué modelo se adapta mejor a tu presupuesto y espacio.',
  },
];

// Opciones del filtro superior; cada valor coincide con la categoría del artículo.
const filters = [
  ['todos', 'Todos'],
  ['juegos', '🎮 Juegos'],
  ['consolas', '🕹️ Consolas'],
  ['accesorios', '🖥️ Accesorios'],
  ['setup', '💡 Setup'],
  ['opinion', '💬 Opinión'],
];

export default function BlogPage() {
  // Guarda categoría, artículo abierto y estado del formulario de suscripción.
  const [filter, setFilter] = useState('todos');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  // Filtra los artículos sin modificar el listado original.
  const visibleArticles = useMemo(
    () => articles.filter((article) => filter === 'todos' || article.category === filter),
    [filter],
  );
  const [featured, ...regularArticles] = visibleArticles;

  // Confirmación local: este formulario es demostrativo y no envía datos.
  function subscribe(event) {
    event.preventDefault();
    setSubscribed(true);
  }

  // Secciones visuales: portada, filtros, tarjetas, suscripción y lectura.
  return (
    <>
      <main className="contenedor react-page react-blog-page">
        {/* Presentación del Blog y controles para filtrar noticias. */}
        <section className="blog-hero">
          <span className="blog-hero-tag">🎮 Noticias Gaming</span>
          <h1>El Blog de La Taverna</h1>
          <p>Noticias, reviews y novedades del mundo gamer. Siempre al tanto de lo que se viene.</p>
        </section>

        <nav className="blog-filtros" aria-label="Filtrar noticias por categoría">
          {filters.map(([value, label]) => (
            <button
              key={value}
              className={`blog-filtro-btn${filter === value ? ' activo' : ''}`}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* La primera noticia filtrada toma el formato destacado. */}
        {featured ? (
          <>
            <article className="blog-featured">
              <div className="blog-featured-img">
                <img src={featured.image} alt={featured.title} />
                <span className="blog-featured-badge">⭐ Destacado</span>
              </div>
              <div className="blog-featured-content">
                <div className="blog-featured-meta">
                  <span>🗓️ {featured.date}</span>
                  <span>⏱️ {featured.readTime} de lectura</span>
                  <span>🎮 {featured.categoryLabel}</span>
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <button className="blog-read-btn" type="button" onClick={() => setSelectedArticle(featured)}>
                  Leer artículo →
                </button>
              </div>
            </article>

            <section aria-label="Artículos del blog">
              <div className="blog-grid">
                {regularArticles.map((article) => (
                  <article className="blog-card" key={article.id}>
                    <div className="blog-card-img">
                      <img src={article.image} alt={article.title} loading="lazy" />
                      <span className={`blog-card-cat cat-${article.category}`}>{article.categoryLabel}</span>
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-meta">
                        <span>🗓️ {article.date}</span>
                        <span>⏱️ {article.readTime}</span>
                      </div>
                      <h2>{article.title}</h2>
                      <p>{article.excerpt}</p>
                      <div className="blog-card-footer">
                        <span className="blog-card-author">👤 {article.author}</span>
                        <button className="blog-card-link" type="button" onClick={() => setSelectedArticle(article)}>Leer más →</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="tarjeta" role="status">No hay artículos en esta categoría.</section>
        )}

        {/* Formulario demostrativo de suscripción al boletín. */}
        <section className="blog-newsletter" aria-labelledby="newsletter-title">
          <h2 id="newsletter-title">📬 Mantente al día con lo más gamer</h2>
          <p>Suscríbete para recibir noticias, lanzamientos y ofertas de La Taverna.</p>
          {subscribed ? (
            <p className="newsletter-ok" role="status">✅ ¡Suscripción exitosa! Gracias por unirte.</p>
          ) : (
            <form className="newsletter-form" onSubmit={subscribe}>
              <label className="visually-hidden" htmlFor="newsletter-email">Correo electrónico</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
              <button type="submit">Suscribirme</button>
            </form>
          )}
        </section>
      </main>
      {/* Modal reutilizable para leer la noticia completa. */}
      {selectedArticle && (
        <div className="modal-noticia-overlay activo" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedArticle(null);
        }}>
          <section className="modal-noticia-contenedor" role="dialog" aria-modal="true" aria-labelledby="article-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-noticia-cerrar" type="button" aria-label="Cerrar artículo" onClick={() => setSelectedArticle(null)}>✕</button>
            <div className="modal-noticia-header">
              <span className="modal-noticia-cat">{selectedArticle.categoryLabel}</span>
              <h2 id="article-title">{selectedArticle.title}</h2>
              <div className="modal-noticia-meta">
                <span>🗓️ {selectedArticle.date}</span>
                <span>⏱️ {selectedArticle.readTime}</span>
                <span>👤 {selectedArticle.author}</span>
              </div>
            </div>
            <div className="modal-noticia-img-wrap">
              <img src={selectedArticle.image} alt={selectedArticle.title} />
            </div>
            <div className="modal-noticia-cuerpo">
              <p>{selectedArticle.excerpt}</p>
              <p>Encuentra novedades y productos relacionados en las categorías de <a href="/juegos.html">La Taverna</a>.</p>
            </div>
            <div className="modal-noticia-footer">
              <button className="btn-cerrar-modal" type="button" onClick={() => setSelectedArticle(null)}>Cerrar Noticia</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
