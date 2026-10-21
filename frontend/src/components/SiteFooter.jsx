// Pie compartido con horario de servicio técnico y correo de contacto.
import React from 'react';

export default function SiteFooter() {
  return (
    <footer className="pie-pagina">
      <p>
        <strong>Servicio Técnico:</strong> Lunes a Viernes 09:00–21:00 | Sábado 10:00–15:00
        {' | '}
        <strong>Contacto:</strong>{' '}
        <a href="mailto:latavernast@contacto.com">latavernast@contacto.com</a>
      </p>
    </footer>
  );
}
