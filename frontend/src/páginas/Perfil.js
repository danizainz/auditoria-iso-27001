import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout'; 
import CursosConcluidos from './CursosConcluidos'; 

function Perfil() {
  const navigate = useNavigate();
  const [abaQualificacoes, setAbaQualificacoes] = useState('formacao'); 
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [credenciais, setCredenciais] = useState({
    n_registo: '',
    certificacoes: '',
    ficheiro: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro a carregar perfil:", error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleExportarDados = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/exportar-dados/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meus_dados_RGPD.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert("📥 Os seus dados foram exportados com sucesso!");
    } catch (err) {
      alert("Erro ao exportar os dados.");
    }
  };

  if (loading || !userData) {
    return (
      <Layout>
        <div style={{ padding: '50px', textAlign: 'center', color: '#6b7280' }}>A carregar perfil... 🔄</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ backgroundColor: '#f4f5f7', minHeight: '100vh', margin: '-40px', padding: '40px' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fdf4ff 100%)', borderRadius: '12px 12px 0 0', height: '120px', border: '1px solid #e5e7eb', borderBottom: 'none' }}></div>
        
        <div style={{ backgroundColor: 'white', padding: '0 30px 30px 30px', borderRadius: '0 0 12px 12px', border: '1px solid #e5e7eb', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            <div style={{ width: '90px', height: '90px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                {userData.iniciais}
              </div>
            </div>
            <div style={{ paddingBottom: '10px' }}>
              <h1 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '24px' }}>{userData.nome}</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Auditor / Gestor de Segurança</p>
            </div>
          </div>
          <div style={{ paddingBottom: '10px' }}>
            <button onClick={() => navigate('/definicoes')} style={{ background: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              ⚙️ Definições da Conta
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '16px' }}>Sobre</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Email</span>
                <span style={{ color: '#4f46e5', fontSize: '14px', fontWeight: '500' }}>{userData.email}</span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Data de Registo</span>
                <span style={{ color: '#111827', fontSize: '14px' }}>{userData.data_entrada}</span>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Fuso Horário</span>
                <span style={{ color: '#111827', fontSize: '14px' }}>Lisboa (GMT+00:00)</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '16px' }}>Organizações / Grupos</h3>
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏢</div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{userData.empresa}</p>
                <span style={{ fontSize: '12px' }}>Grupo Principal</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '16px' }}>Qualificações</h3>
            <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '16px' }}>Qualificações & Privacidade</h3>
            
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #e5e7eb', marginBottom: '25px' }}>
              <button onClick={() => setAbaQualificacoes('credenciais')} style={{ background: 'none', border: 'none', padding: '10px 5px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: abaQualificacoes === 'credenciais' ? '#4f46e5' : '#6b7280', borderBottom: abaQualificacoes === 'credenciais' ? '2px solid #4f46e5' : '2px solid transparent' }}>Credenciais</button>
              <button onClick={() => setAbaQualificacoes('formacao')} style={{ background: 'none', border: 'none', padding: '10px 5px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: abaQualificacoes === 'formacao' ? '#4f46e5' : '#6b7280', borderBottom: abaQualificacoes === 'formacao' ? '2px solid #4f46e5' : '2px solid transparent' }}>Formação ISO</button>
              
              {/* NOVO BOTÃO DA ABA */}
              <button onClick={() => setAbaQualificacoes('rgpd')} style={{ background: 'none', border: 'none', padding: '10px 5px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: abaQualificacoes === 'rgpd' ? '#10b981' : '#6b7280', borderBottom: abaQualificacoes === 'rgpd' ? '2px solid #10b981' : '2px solid transparent' }}>🛡️ Privacidade (RGPD)</button>
            </div>

            {/* ABA: CREDENCIAIS (O teu código original) */}
            {abaQualificacoes === 'credenciais' && (
               /* ... a tua div das credenciais fica aqui ... */
               <div>
                 <p style={{ color: '#6b7280' }}>Área de credenciais (mantém o teu código que lá estava!)</p>
               </div>
            )}

            {/* ABA: FORMAÇÃO (O teu código original) */}
            {abaQualificacoes === 'formacao' && (
              <div style={{ marginTop: '-10px' }}>
                <CursosConcluidos isEmbedded={true} />
              </div>
            )}

            {/* 👇 COLA AQUI O CONTEÚDO DA NOVA ABA RGPD 👇 */}
            {abaQualificacoes === 'rgpd' && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Direitos do Titular dos Dados</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Gerencie as suas informações em conformidade com o Regulamento Geral sobre a Proteção de Dados.</p>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '15px' }}>Direito à Portabilidade (Art. 20.º)</h4>
                  <p style={{ margin: '0 0 15px 0', color: '#15803d', fontSize: '13px' }}>
                    Tem o direito de receber os dados pessoais que lhe dizem respeito num formato estruturado, de uso corrente e de leitura automática.
                  </p>
                  <button 
                    onClick={handleExportarDados}
                    style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    📥 Exportar Dados para JSON
                  </button>
                </div>
              </div>
            )}
            {/* */}
            
            
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Perfil;