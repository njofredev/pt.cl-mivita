'use client';

import React, { useState } from 'react';

export default function Home() {
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; estado?: string; error?: string } | null>(null);

  const formatRut = (value: string) => {
    // Remove any non-alphanumeric characters
    const cleanValue = value.replace(/[^0-9kK]/g, '');
    if (cleanValue.length < 2) return cleanValue;

    const cuerpo = cleanValue.slice(0, -1);
    const dv = cleanValue.slice(-1).toUpperCase();
    return `${cuerpo}-${dv}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rut) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'CONNECTION_ERROR' });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setResult(null);
    setRut('');
  };

  const renderResultContent = () => {
    if (!result) return null;

    if (result.success && result.estado === 'VIGENTE') {
      return (
        <div className="result-content vigente-state">
          <h2>✅ ¡Felicidades! Tu Tarjeta Mi Vita está Vigente 🎉</h2>
          <div className="benefits">
            <p><strong>Puedes disfrutar de aranceles preferenciales (25% de descuento) en los siguientes servicios:</strong></p>
            <p>Odontología, Salud Mental, Medicina General, Enfermería, Kinesiología, Podología y Terapias Complementarias.</p>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0, 255, 157, 0.2)', paddingTop: '1rem' }}>
              <p>Llama al <strong>+562 2933 6740</strong> (Sucursal Vitacura) para conversar con una de nuestras recepcionistas y registrar tus datos en nuestro sistema.</p>
            </div>
          </div>
        </div>
      );
    }

    if (result.error === 'VECINO_NO_EXISTE') {
      return (
        <div className="result-content error-state">
          <h2>Lo sentimos 😔</h2>
          <p>No hemos encontrado tu RUT en el sistema de Tarjeta Mi Vita.</p>
          <div className="benefits" style={{ borderLeftColor: 'var(--white)', background: 'rgba(255, 255, 255, 0.05)' }}>
            <p>Si eres residente de la comuna de Vitacura, llama al <strong>+562 2240 2333</strong>, ingresa a <a href="https://www.tarjetamivita.cl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>www.tarjetamivita.cl</a> o envía un correo a <strong>info.mivita@vitacura.cl</strong> para obtener mayor información y acceder al beneficio.</p>
          </div>
        </div>
      );
    }

    if (result.success && result.estado === 'NO_VIGENTE') {
      return (
        <div className="result-content warning-state" style={{ color: 'white' }}>
          <h2 style={{ color: '#f1c40f' }}>Lo sentimos 😔</h2>
          <p>Tu beneficio de Tarjeta Mi Vita no se encuentra vigente en este momento.</p>
          <div className="benefits" style={{ borderLeftColor: '#f1c40f', background: 'rgba(241, 196, 15, 0.05)' }}>
            <p><strong>Para renovar o actualizar tu beneficio:</strong></p>
            <p>Ingresa a <a href="https://www.tarjetamivita.cl" target="_blank" rel="noopener noreferrer" style={{ color: '#f1c40f' }}>www.tarjetamivita.cl</a> o comunícate con nosotros:</p>
            <ul style={{ listStyle: 'none', marginTop: '0.5rem', padding: 0 }}>
              <li>📞 Teléfono: <strong>+562 2240 2333</strong></li>
              <li>📧 Email: <strong>info.mivita@vitacura.cl</strong></li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="result-content error-state">
        <h2>⚠️ Error de consulta</h2>
        <p>{result.error || 'Hubo un problema al consultar el sistema. Por favor intenta más tarde.'}</p>
      </div>
    );
  };

  return (
    <main className="container">
      <div className="card">
        {/* If no result, show form. If result, show result content */}
        {!result ? (
          <>
            <h1 className="header">¿Tu Tarjeta Mi Vita está vigente?</h1>
            <p className="subtitle">Ingresa tu RUT y revisa el estado de tu beneficio de inmediato.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: 12345678-9"
                  value={rut}
                  onChange={handleInputChange}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="button" disabled={loading || !rut}>
                {loading ? (
                  'Validando...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Consultar Estado
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="result-container">
            {renderResultContent()}
            <div className="result-actions">
              <button onClick={resetSearch} className="button secondary-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Nueva Consulta
              </button>
              <a href="https://www.policlinicotabancura.cl" target="_blank" rel="noopener noreferrer" className="button link-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Nuestro sitio web
              </a>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
