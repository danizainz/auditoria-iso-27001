import React, { useState, useEffect } from 'react';

const ConsentBanner = () => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Verifica se o utilizador já aceitou anteriormente
    const consentimento = localStorage.getItem('consentimento_rgpd');
    if (!consentimento) {
      setVisivel(true);
    }
  }, []);

  const aceitar = () => {
    localStorage.setItem('consentimento_rgpd', 'true');
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      backgroundColor: '#111827',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid #374151',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      <div style={{ flex: '1', minWidth: '300px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Transparência e Segurança (RGPD)
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
          Utilizamos apenas identificadores (tokens JWT) estritamente necessários para garantir a segurança da sua sessão, 
          integridade dos dados e proteção contra ataques. Não utilizamos cookies de rastreamento ou marketing de terceiros.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={aceitar}
          style={{
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4338ca'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4f46e5'}
        >
          Compreendi
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;