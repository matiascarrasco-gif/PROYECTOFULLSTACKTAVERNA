// Enlace reutilizable: funciona dentro del Router o como enlace HTML común.
import React from 'react';
import { Link, useInRouterContext } from 'react-router-dom';

export default function AppLink({ href, to, ...props }) {
  // Detecta el contexto para mantener el componente compatible con pruebas.
  const inRouter = useInRouterContext();
  const destination = to ?? href ?? '/';

  return inRouter
    ? <Link to={destination} {...props} />
    : <a href={destination} {...props} />;
}
