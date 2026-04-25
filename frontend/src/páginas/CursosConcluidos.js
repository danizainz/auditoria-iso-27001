import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout'; 

function CursosConcluidos({ isEmbedded = false }) {
  const navigate = useNavigate();
  
  // ESTADOS INICIAIS (Agora vazios)
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ concluidos: 0, pendentes: 0 });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-profile/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        
        const cursos = response.data.meus_cursos || [];
        setHistorico(cursos);
        
        setStats({
          concluidos: response.data.modulos_concluidos,
          pendentes: cursos.filter(c => c.status !== "Concluído").length
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar formação:", error);
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  if (loading && !isEmbedded) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>A carregar a tua formação... 🔄</div>;
  }

  const conteudo = (
    <div style={{ padding: isEmbedded ? '0' : '40px', backgroundColor: isEmbedded ? 'transparent' : '#f9fafb', minHeight: isEmbedded ? 'auto' : '100vh', margin: isEmbedded ? '0' : '-40px' }}>
      
      {!isEmbedded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#111827', fontSize: '28px', marginBottom: '8px' }}>Os Meus Cursos</h1>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Área de formação real baseada na tua base de dados. 🛡️</p>
          </div>
          <button onClick={() => navigate('/biblioteca')} style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            + Explorar Biblioteca
          </button>
        </div>
      )}

      {/* CARTÕES DE RESUMO*/}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', marginTop: isEmbedded ? '10px' : '0' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, borderLeft: '4px solid #10b981' }}>
          <h4 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '14px' }}>Módulos Concluídos</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.concluidos}</span>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', flex: 1, borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '14px' }}>Em Curso / Pendentes</h4>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.pendentes}</span>
        </div>
      </div>

      {/* TABELA DINÂMICA */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px 20px', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase' }}>Módulo de Formação</th>
              <th style={{ padding: '15px 20px', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '15px 20px', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase' }}>Última Interação</th>
              <th style={{ padding: '15px 20px', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {historico.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>
                  Não tens nenhum progresso registado. Começa um curso na Biblioteca!
                </td>
              </tr>
            ) : (
              historico.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', color: '#111827' }}>{item.modulo}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ 
                      backgroundColor: item.status === 'Concluído' ? '#ecfdf5' : '#fef3c7', 
                      color: item.status === 'Concluído' ? '#10b981' : '#d97706',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      {item.status === 'Concluído' ? '✅ Concluído' : '⏳ ' + item.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#6b7280' }}>{item.data}</td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/curso/${item.id}`)}
                      style={{ 
                        background: item.status === 'Concluído' ? '#f3f4f6' : '#0891b2', 
                        border: item.status === 'Concluído' ? '1px solid #d1d5db' : 'none',
                        color: item.status === 'Concluído' ? '#374151' : 'white', 
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                      }}
                    >
                      {item.status === 'Concluído' ? '↻ Rever' : '▶ Continuar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return isEmbedded ? conteudo : <Layout>{conteudo}</Layout>;
}

export default CursosConcluidos;