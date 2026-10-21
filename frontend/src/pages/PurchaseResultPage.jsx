// Comprobante final: muestra compra exitosa o pago fallido con sus datos.
import React from 'react';
import { formatPrice } from '../components/ProductCard.jsx';
import { formatItemPrice } from '../data/cart.js';

const orderStorageKey = 'taverna:last-order';

export default function PurchaseResultPage({ success }) {
  // Recupera el pedido que el checkout dejó guardado en este navegador.
  const order = JSON.parse(localStorage.getItem(orderStorageKey) || 'null');
  const title = success
    ? `Se ha realizado la compra nro. ${order?.number ?? '—'}`
    : `No se pudo realizar el pago nro. ${order?.number ?? '—'}`;

  // Abre el cliente de correo con el resumen del pedido listo para enviar.
  function emailReceipt() {
    if (!order) return;
    const lines = [
      `Comprobante de compra nro. ${order.number}`,
      `Cliente: ${order.customer.nombres} ${order.customer.apellidos}`,
      `Correo: ${order.customer.correo}`,
      `Dirección: ${order.customer.calle}, ${order.customer.comuna}, ${order.customer.region}`,
      '',
      ...order.products.map((item) => `${item.titulo || item.title} x${item.cantidad} - ${formatPrice(formatItemPrice(item) * item.cantidad)}`),
      `Total: ${formatPrice(order.total)}`,
    ];
    const subject = encodeURIComponent(`Comprobante de compra nro. ${order.number}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${encodeURIComponent(order.customer.correo)}?subject=${subject}&body=${body}`;
  }

  return (
    <main className="contenedor react-page purchase-result-page">
        {/* Estado de la orden, errores de validación y comprobante. */}
        <section className={`tarjeta purchase-result-card${success ? ' purchase-success' : ' purchase-failure'}`}>
          <span className="purchase-result-icon" aria-hidden="true">{success ? '✓' : '!'}</span>
          <h1>{title}</h1>
          <p>{success
            ? 'Tu pedido fue registrado correctamente. Guarda los datos de tu compra.'
            : 'Revisa los datos indicados e intenta realizar el pago nuevamente.'}</p>

          {!success && order?.errors?.length > 0 && (
            <div className="purchase-errors" role="alert">
              <strong>No pudimos continuar porque:</strong>
              <ul>{order.errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          )}

          {order ? (
            <div className="purchase-receipt">
              <section>
                <h2>Información del cliente</h2>
                <dl>
                  <div><dt>Nombre</dt><dd>{order.customer.nombres} {order.customer.apellidos}</dd></div>
                  <div><dt>Correo</dt><dd>{order.customer.correo}</dd></div>
                </dl>
              </section>
              <section>
                <h2>Dirección de entrega</h2>
                <dl>
                  <div><dt>Calle</dt><dd>{order.customer.calle}</dd></div>
                  {order.customer.departamento && <div><dt>Departamento</dt><dd>{order.customer.departamento}</dd></div>}
                  <div><dt>Región</dt><dd>{order.customer.region}</dd></div>
                  <div><dt>Comuna</dt><dd>{order.customer.comuna}</dd></div>
                  <div><dt>Indicaciones</dt><dd>{order.customer.indicaciones || 'Sin indicaciones adicionales'}</dd></div>
                </dl>
              </section>
              <section>
                <h2>Productos comprados</h2>
                <ul className="purchase-items">
                  {order.products.map((item) => (
                    <li key={item.id}>
                      <img src={item.imagen || item.image} alt="" />
                      <span>{item.titulo || item.title} <small>× {item.cantidad}</small></span>
                      <strong>{formatPrice(formatItemPrice(item) * item.cantidad)}</strong>
                    </li>
                  ))}
                </ul>
                <p className="purchase-total"><span>Total</span><strong>{formatPrice(order.total)}</strong></p>
              </section>
            </div>
          ) : (
            <p role="alert">No encontramos los datos del pedido en este navegador. Puedes volver a la tienda.</p>
          )}

          {/* Acciones disponibles según el resultado del pago. */}
          <div className="purchase-actions">
            {success && order && (
              <>
                <button className="checkout-secondary-button" type="button" onClick={emailReceipt}>Enviar comprobante por correo</button>
                <button className="checkout-primary-button" type="button" onClick={() => window.print()}>Imprimir boleta / Guardar PDF</button>
              </>
            )}
            {!success && <a className="checkout-primary-button" href="/carrito.html">Volver al carrito</a>}
            <a className="purchase-back-link" href="/">Volver a la tienda</a>
          </div>
        </section>
    </main>
  );
}
