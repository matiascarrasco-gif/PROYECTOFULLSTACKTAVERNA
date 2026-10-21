// Entrada de React: carga estilos y monta la app con navegación por rutas.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './pages/App.jsx';
import '../estilos.css';
import './styles/react-pages.css';

// El Router permite navegar entre las vistas sin recargar la aplicación.
createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>,
);
