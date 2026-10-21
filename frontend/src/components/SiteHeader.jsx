// Encabezado compartido: cuenta, logo, navegación por categorías y buscador.
import React from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import ShopHeaderActions from './ShopHeaderActions.jsx';
import AppLink from './AppLink.jsx';

const links = [
  ['Juegos Digitales', '/juegos.html'],
  ['Consolas', '/consolas.html'],
  ['PC Gamers', '/pcgamers.html'],
  ['Mouse / Mousepad', '/mouse-mousepad.html'],
  ['Sillas Gamers', '/sillasgamers.html'],
  ['Accesorios', '/accesorios.html'],
  ['Poleras Personalizadas', '/poleras.html'],
  ['Polerones Gamers', '/poleron.html'],
  ['Blog', '/blog.html'],
  ['Servicio Técnico', '/serviciotecnico.html'],
];

// Buscador integrado al Router para actualizar la vista sin recargar la página.
function RouterSearchForm() {
  const navigate = useNavigate();

  return (
    <form className="site-header-search" role="search" onSubmit={(event) => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get('q');
      navigate(`/buscar.html?q=${encodeURIComponent(String(query || '').trim())}`);
    }}>
      <label className="visually-hidden" htmlFor="site-search">Buscar en la tienda</label>
      <input id="site-search" name="q" type="search" placeholder="Buscar productos..." />
      <button type="submit" aria-label="Buscar">⌕</button>
    </form>
  );
}

export default function SiteHeader() {
  // La referencia controla el desplazamiento horizontal del menú de categorías.
  const menuRef = React.useRef(null);
  const inRouter = useInRouterContext();
  const currentPath = window.location.pathname.toLowerCase();

  return (
    <header className="react-site-header">
      <div className="site-header-top">
        <ShopHeaderActions />
        <h1 className="site-header-brand">
          <AppLink href="/" aria-label="La Taverna, inicio">
            <img src="/images/logosinfondo.png" alt="La Taverna" className="logo-titulo" />
          </AppLink>
        </h1>
      </div>
      <div className="site-header-navigation-row">
        <div className="nav-slider-container" aria-label="Menú principal">
          <button className="nav-btn nav-btn-prev" type="button" aria-label="Desplazar menú a la izquierda" onClick={() => menuRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}>
            &#10094;
          </button>
          <div className="menu-principal-wrapper" ref={menuRef}>
            <nav className="menu-principal" aria-label="Navegación principal">
              {links.map(([label, href]) => (
                <AppLink
                  className={currentPath === href ? 'active-link' : ''}
                  key={href}
                  href={href}
                  aria-current={currentPath === href ? 'page' : undefined}
                >
                  {label}
                </AppLink>
              ))}
            </nav>
          </div>
          <button className="nav-btn nav-btn-next" type="button" aria-label="Desplazar menú a la derecha" onClick={() => menuRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}>
            &#10095;
          </button>
        </div>
        {inRouter ? <RouterSearchForm /> : (
          <form className="site-header-search" action="/buscar.html" method="get" role="search">
            <label className="visually-hidden" htmlFor="site-search">Buscar en la tienda</label>
            <input id="site-search" name="q" type="search" placeholder="Buscar productos..." />
            <button type="submit" aria-label="Buscar">⌕</button>
          </form>
        )}
      </div>
    </header>
  );
}
