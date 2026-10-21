// Enrutador principal: conecta cada URL con su página React correspondiente.
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import SiteLayout from '../components/SiteLayout.jsx';
import ProductCatalogPage from './ProductCatalogPage.jsx';
import ProductDetailPage from './ProductDetailPage.jsx';
import AdminProductsPage from './AdminProductsPage.jsx';
import HomePage from './HomePage.jsx';
import BlogPage from './BlogPage.jsx';
import TechnicalServicePage from './TechnicalServicePage.jsx';
import CartPage from './CartPage.jsx';
import PurchaseResultPage from './PurchaseResultPage.jsx';
import SearchResultsPage from './SearchResultsPage.jsx';
import { initializeProductDatabase } from '../data/mockDatabase.js';
import { getSeedProducts } from '../data/seedProducts.js';
import { getActiveUser } from '../data/cart.js';

const catalogs = {
  '/accesorios.html': { title: 'Accesorios', category: 'Accesorios' },
  '/consolas.html': { title: 'Consolas', category: 'Consolas' },
  '/juegos.html': { title: 'Juegos Digitales', category: 'Juegos' },
  '/mouse-mousepad.html': { title: 'Mouse / Mousepad', category: 'Mouse / Mousepad' },
  '/pcgamers.html': { title: 'PC Gamers', category: 'PC Gamers' },
  '/poleras.html': { title: 'Poleras Personalizadas', category: 'Poleras Personalizadas' },
  '/poleron.html': { title: 'Polerones Gamers Personalizados', category: 'Polerones Gamers Personalizados' },
  '/sillasgamers.html': { title: 'Sillas Gamers', category: 'Sillas Gamers' },
};
// El seed se comparte al inicializar el catálogo simulado.
const seedProducts = getSeedProducts();

export default function App() {
  const { pathname } = useLocation();
  const path = pathname.toLowerCase();
  // Mantiene disponibles los productos iniciales y los creados en administración.
  initializeProductDatabase(seedProducts);

  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route path="/blog.html" element={<BlogPage />} />
        <Route path="/serviciotecnico.html" element={<TechnicalServicePage />} />
        <Route path="/buscar.html" element={<SearchResultsPage />} />
        <Route path="/carrito.html" element={<CartPage />} />
        <Route path="/compra-realizada.html" element={<PurchaseResultPage success />} />
        <Route path="/pago-fallido.html" element={<PurchaseResultPage success={false} />} />
        {Object.entries(catalogs).map(([route, config]) => (
          <Route key={route} path={route} element={<ProductCatalogPage key={route} {...config} />} />
        ))}
        <Route path="/producto.html" element={<ProductDetailPage />} />
        <Route path="/admin-panel.html" element={
          getActiveUser()?.isAdmin ? <AdminProductsPage /> : (
            <main className="contenedor react-page">
              <section className="tarjeta checkout-login-required">
                <h1>Acceso de demostración restringido</h1>
                <p>Para entrar al panel, utiliza la opción de administrador disponible en el inicio de sesión del Blog.</p>
                <a className="checkout-primary-link" href="/blog.html">Ir al Blog</a>
              </section>
            </main>
          )
        } />
        <Route path="*" element={
          <main className="container py-5">
            <section className="card p-4">
              <h1 className="h3">Página no encontrada</h1>
              <p>La página solicitada no existe.</p>
              <a href="/">Volver al inicio</a>
            </section>
          </main>
        } />
      </Routes>
    </SiteLayout>
  );
}
