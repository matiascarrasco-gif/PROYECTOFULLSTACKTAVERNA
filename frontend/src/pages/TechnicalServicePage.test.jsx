// Pruebas de solicitud de servicio técnico y preguntas frecuentes.
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TechnicalServicePage from './TechnicalServicePage.jsx';

describe('TechnicalServicePage', () => {
  it('expands frequently asked questions', () => {
    render(<TechnicalServicePage />);
    const question = screen.getByRole('button', { name: '¿Cuánto demora una reparación típica?' });

    fireEvent.click(question);

    expect(question.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/diagnóstico básico tarda entre 1 y 2 días hábiles/)).toBeTruthy();
  });

  it('validates and confirms a service request', () => {
    render(<TechnicalServicePage />);
    fireEvent.change(screen.getByLabelText('Nombre completo *'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico *'), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText('Tipo de servicio *'), { target: { value: 'Diagnóstico de PC Gamer' } });
    fireEvent.change(screen.getByLabelText('Descripción del problema *'), { target: { value: 'El equipo se sobrecalienta.' } });
    fireEvent.submit(screen.getByLabelText('Nombre completo *').closest('form'));

    expect(screen.getByRole('status').textContent).toContain('Solicitud enviada con éxito');
    expect(screen.queryByRole('button', { name: '📨 Enviar Solicitud' })).toBeNull();
  });
});
