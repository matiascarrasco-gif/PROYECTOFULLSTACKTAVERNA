// Servicio técnico: servicios disponibles, formulario de solicitud y preguntas.
import React, { useState } from 'react';

const services = [
  ['💻', 'Diagnóstico de PC Gamer', 'Revisión completa de hardware y software para detectar fallas y cuellos de botella en tu setup.'],
  ['🎮', 'Reparación de Consolas', 'PS5, PS4, Xbox, Nintendo Switch: lentes, HDMI, joystick drift y más.'],
  ['🧹', 'Limpieza Interna Profunda', 'Limpieza de polvo, cambio de pasta térmica y revisión de ventilación para evitar sobrecalentamiento.'],
  ['⚡', 'Optimización y Aceleración', 'Instalamos SSD, ampliamos RAM y optimizamos Windows para que tu PC vuele en los juegos.'],
  ['🖥️', 'Armado de PC Gamer', 'Te ayudamos a armar tu PC gamer desde cero: elegimos las piezas, la ensamblamos y configuramos.'],
  ['🛡️', 'Instalación de Software', 'Instalación de Windows, drivers, antivirus y programas esenciales para gaming.'],
  ['🔌', 'Reparación de Periféricos', 'Arreglamos mouse, teclados, auriculares y otros periféricos con fallas eléctricas o mecánicas.'],
  ['📡', 'Configuración de Red y Wi-Fi', 'Optimizamos tu conexión para gaming online: reducción de latencia, configuración de router y más.'],
];

// Respuestas desplegables que reutiliza la sección de preguntas frecuentes.
const questions = [
  ['¿Cuánto demora una reparación típica?', 'Un diagnóstico básico tarda entre 1 y 2 días hábiles. Una reparación de consola puede tomar entre 3 y 7 días según la disponibilidad de repuestos. Te avisamos por correo sobre el avance.'],
  ['¿Entregan garantía por los trabajos realizados?', 'Todos nuestros servicios incluyen garantía de 30 días por la reparación realizada. Si el problema reaparece dentro de ese período, lo revisamos sin costo adicional.'],
  ['¿Puedo llevar mi equipo en persona?', 'Atendemos de forma presencial de lunes a sábado. Escríbenos primero para coordinar el horario de entrega y evitar esperas.'],
  ['¿Cuáles son los métodos de pago?', 'Aceptamos efectivo, transferencia bancaria y pagos por Mercado Pago. El cobro del diagnóstico se abona al retirar el equipo junto con la reparación.'],
  ['¿Hacen envíos para recibir equipos de otras ciudades?', 'Aceptamos equipos enviados por Starken o Chilexpress. El cliente se hace cargo del costo de envío de ida y la devolución se coordina caso a caso.'],
];

const serviceOptions = services.map(([, title]) => title).concat('Otro');

export default function TechnicalServicePage() {
  // Guarda la pregunta abierta y si el formulario fue enviado.
  const [openQuestion, setOpenQuestion] = useState(-1);
  const [submitted, setSubmitted] = useState(false);

  // La solicitud es una demostración: muestra confirmación sin enviar al servidor.
  function submitRequest(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  // Bloques de contacto, servicios, horarios, solicitud y preguntas frecuentes.
  return (
    <main className="contenedor react-page react-service-page">
        {/* Presentación del servicio técnico y formas de contacto. */}
        <section className="st-hero">
          <span className="hero-icon" aria-hidden="true">🔧</span>
          <h1>Servicio Técnico Especializado</h1>
          <p>Reparamos y mantenemos tu equipo gamer como nuevo. Profesionales con experiencia en hardware, software y consolas.</p>
        </section>

        <section className="st-info-grid" aria-label="Información de contacto y atención">
          <article className="st-info-card purple"><span className="card-icon" aria-hidden="true">📧</span><h2>Correo de Contacto</h2><p><a href="mailto:latavernast@contacto.com">latavernast@contacto.com</a></p><p className="st-info-note">Respondemos en menos de 24 hrs</p></article>
          <article className="st-info-card pink"><span className="card-icon" aria-hidden="true">🕘</span><h2>Horario de Atención</h2><p>Lunes a Viernes</p><p><strong>09:00 am – 21:00 pm</strong></p></article>
          <article className="st-info-card blue"><span className="card-icon" aria-hidden="true">📍</span><h2>Ubícanos</h2><p>Santiago, Chile</p><p><a href="mailto:latavernast@contacto.com">Solicita dirección por correo</a></p></article>
        </section>

        <section className="tarjeta" aria-labelledby="services-heading">
          <h2 id="services-heading">Nuestros Servicios</h2>
          <p className="st-section-intro">Todo lo que necesita tu equipo para rendir al máximo.</p>
          <div className="st-services-grid">
            {services.map(([icon, title, description]) => (
              <article className="st-service-item" key={title}>
                <span className="svc-icon" aria-hidden="true">{icon}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="tarjeta" aria-labelledby="schedule-heading">
          <h2 id="schedule-heading">Horarios de Atención</h2>
          <div className="table-responsive">
            <table className="st-schedule">
              <thead><tr><th>Día</th><th>Horario</th><th>Estado</th></tr></thead>
              <tbody>
                <tr><td><strong>Lunes – Viernes</strong></td><td>09:00 am – 21:00 pm</td><td><span className="disponible">✔ Disponible</span></td></tr>
                <tr><td><strong>Sábado</strong></td><td>10:00 am – 15:00 pm</td><td><span className="disponible">✔ Disponible</span></td></tr>
                <tr><td><strong>Domingo</strong></td><td>—</td><td><span className="cerrado">✖ Cerrado</span></td></tr>
                <tr><td><strong>Festivos</strong></td><td>—</td><td><span className="cerrado">✖ Cerrado</span></td></tr>
              </tbody>
            </table>
          </div>
          <p className="st-footnote">* Para urgencias fuera de horario, puedes escribir al correo y te responderemos a la brevedad.</p>
        </section>

        {/* Formulario local que confirma visualmente el envío. */}
        <section className="tarjeta" aria-labelledby="request-heading">
          <h2 id="request-heading">Solicita tu Servicio Técnico</h2>
          <p className="st-section-intro">Completa el formulario y nos contactaremos contigo a la brevedad.</p>
          {submitted ? (
            <div className="form-success-msg react-form-success" role="status">
              ¡Solicitud enviada con éxito! Te contactaremos pronto a tu correo.
            </div>
          ) : (
            <form className="st-form" onSubmit={submitRequest}>
              <div>
                <label htmlFor="service-name">Nombre completo *</label>
                <input id="service-name" name="name" type="text" placeholder="Ej: Juan Pérez" required />
              </div>
              <div>
                <label htmlFor="service-email">Correo electrónico *</label>
                <input id="service-email" name="email" type="email" placeholder="tucorreo@ejemplo.com" required />
              </div>
              <div>
                <label htmlFor="service-phone">Teléfono / WhatsApp</label>
                <input id="service-phone" name="phone" type="tel" placeholder="+56 9 1234 5678" />
              </div>
              <div>
                <label htmlFor="service-type">Tipo de servicio *</label>
                <select id="service-type" name="service" required defaultValue="">
                  <option value="" disabled>-- Selecciona un servicio --</option>
                  {serviceOptions.map((service) => <option key={service}>{service}</option>)}
                </select>
              </div>
              <div className="full-width">
                <label htmlFor="service-description">Descripción del problema *</label>
                <textarea id="service-description" name="description" rows="4" placeholder="Cuéntanos qué le pasa a tu equipo..." required />
              </div>
              <div className="full-width st-submit-wrap">
                <button className="st-form-btn" type="submit">📨 Enviar Solicitud</button>
              </div>
              <p className="st-form-disclaimer">Esta demostración no envía datos a un servidor; la solicitud solo muestra una confirmación local.</p>
            </form>
          )}
        </section>

        {/* Acordeón de preguntas: permite abrir una respuesta a la vez. */}
        <section className="tarjeta" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Preguntas Frecuentes</h2>
          <div>
            {questions.map(([question, answer], index) => {
              const isOpen = openQuestion === index;
              return (
                <div className="faq-item" key={question}>
                  <h3 className="faq-heading">
                    <button
                      className={`faq-question${isOpen ? ' active' : ''}`}
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                    >
                      {question}
                      <span className="faq-arrow" aria-hidden="true">▼</span>
                    </button>
                  </h3>
                  {isOpen && <div className="faq-answer react-faq-answer">{answer}</div>}
                </div>
              );
            })}
          </div>
        </section>
    </main>
  );
}
