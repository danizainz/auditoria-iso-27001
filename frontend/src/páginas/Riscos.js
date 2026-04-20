import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

function Riscos() {
  const navigate = useNavigate();
  const [riscos, setRiscos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('Pendente'); 

  const [modalAberto, setModalAberto] = useState(false);
  const [riscoAtivo, setRiscoAtivo] = useState(null);
  const [planoAcao, setPlanoAcao] = useState({ responsavel: '', prazo: '', descricao: '' });

  useEffect(() => {
    const carregarRiscos = async () => {
      try {
        const response = await axios.get('https://auditoria-iso-27001.onrender.com/api/auditorias-tabela/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const todasAuditorias = response.data;
        let listaRiscos = [];

        // INJEÇÃO DO RISCO GRAVE (hardcoded para já)
        listaRiscos.push({
          id: 'risco-demo-critico',
          auditoriaId: 1,
          n_doc: 'AUD-999',
          empresa: 'Sede Principal (Data Center)',
          pergunta: 'Os backups dos servidores críticos não estão a ser testados nem armazenados em local isolado (Risco Iminente de Perda Total por Ransomware).',
          data: new Date().toISOString().split('T')[0],
          estado: 'Pendente',
          nivel: 'Crítico',
          iso: 'A.8.13',
          categoria: 'Backup de Informação'
        });

        // 2. BUSCA DOS RISCOS REAIS DA TUA BASE DE DADOS
        todasAuditorias.forEach(aud => {
          if (aud.detalhes) {
            aud.detalhes.forEach(det => {
              if (det.resposta === 'Não' || det.resposta === 'NAO') {
                listaRiscos.push({
                  id: `${aud.id}-${listaRiscos.length}`, 
                  auditoriaId: aud.id,
                  n_doc: aud.n_doc,
                  empresa: aud.nome_empresa,
                  pergunta: det.texto_pergunta,
                  data: aud.data_inicio,
                  estado: 'Pendente', 
                  nivel: 'Alto', // No futuro o teu Django pode enviar isto
                  iso: det.referencia_controlo || 'A.5.1', // Badge ISO
                  categoria: det.dominio_iso || 'Políticas de Segurança'
                });
              }
            });
          }
        });

        setRiscos(listaRiscos);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar riscos:", error);
        setLoading(false);
      }
    };
    carregarRiscos();
  }, []);

  const riscosFiltrados = riscos.filter(r => r.estado === filtroEstado);

  const abrirModal = (risco) => {
    setRiscoAtivo(risco);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setRiscoAtivo(null);
    setPlanoAcao({ responsavel: '', prazo: '', descricao: '' }); 
  };

  const submeterPlano = (e) => {
    e.preventDefault();
    const riscosAtualizados = riscos.map(r => 
      r.id === riscoAtivo.id ? { ...r, estado: 'Resolvido', responsavel: planoAcao.responsavel } : r
    );
    setRiscos(riscosAtualizados);
    fecharModal();
    alert("✅ Plano de Ação registado! O risco passou para as Ações Resolvidas.");
  };

  //  Função para cores dinâmicas dependendo da gravidade do risco
  const getCorRisco = (nivel) => {
    switch(nivel) {
      case 'Crítico': return { bg: '#7f1d1d', text: '#fef2f2', border: '#991b1b', label: '🚨 Crítico' }; // Vermelho muito escuro
      case 'Alto': return { bg: '#fee2e2', text: '#ef4444', border: '#ef4444', label: '⚠️ Alto' };
      case 'Médio': return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b', label: '👀 Médio' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af', label: 'Baixo' };
    }
  };

  return (
    <Layout>
      <div style={{ padding: '30px', backgroundColor: '#f4f5f7', minHeight: '100vh', margin: '-40px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Gestão de Riscos & Ações 🛡️</h1>
            <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Acompanha e resolve as Não Conformidades detetadas.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <button 
            onClick={() => setFiltroEstado('Pendente')}
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: filtroEstado === 'Pendente' ? '#111827' : '#e5e7eb', color: filtroEstado === 'Pendente' ? 'white' : '#6b7280' }}
          >
            🔥 Riscos Pendentes ({riscos.filter(r => r.estado === 'Pendente').length})
          </button>
          <button 
            onClick={() => setFiltroEstado('Resolvido')}
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: filtroEstado === 'Resolvido' ? '#10b981' : '#d1fae5', color: filtroEstado === 'Resolvido' ? 'white' : '#10b981' }}
          >
            ✅ Ações Resolvidas ({riscos.filter(r => r.estado === 'Resolvido').length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>A procurar vulnerabilidades... 🔍</div>
        ) : riscosFiltrados.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', color: '#6b7280', border: '1px dashed #d1d5db' }}>
            🎉 Fantástico! Não tens nenhuns riscos com este estado.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {riscosFiltrados.map((risco, index) => {
              const cores = getCorRisco(risco.nivel);
              
              return (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  borderLeft: `6px solid ${risco.estado === 'Pendente' ? cores.border : '#10b981'}`, 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
                  marginBottom: '5px'
                }}>
                  
                  {/* CABEÇALHO DO CARTÃO (BADGES E CONTEXTO) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: risco.estado === 'Pendente' ? cores.bg : '#d1fae5', color: risco.estado === 'Pendente' ? cores.text : '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {risco.estado === 'Pendente' ? cores.label : '✅ Resolvido'}
                      </span>
                      <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e5e7eb' }}>
                        {risco.iso}
                      </span>
                      <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                        {risco.categoria}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{risco.empresa} • {risco.n_doc}</span>
                  </div>

                  {/* PERGUNTA / DESCRIÇÃO DO RISCO */}
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#111827', lineHeight: '1.4' }}>
                    {risco.pergunta}
                  </h3>

                  {/* RODAPÉ DO CARTÃO (AÇÕES E RESPONSÁVEL) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Detetado a: {risco.data}</span>
                      {risco.estado === 'Resolvido' && risco.responsavel && (
                        <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 'bold', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                          Tratado por: {risco.responsavel}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => navigate(`/auditoria/${risco.auditoriaId}`)} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Ver Auditoria
                      </button>
                      {risco.estado === 'Pendente' && (
                        <button onClick={() => abrirModal(risco)} style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                          Tratar Risco ➔
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* MODAL DE TRATAMENTO DE RISCO */}
        {modalAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              
              <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Plano de Ação Corretiva</h2>
              <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px', marginBottom: '20px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                {riscoAtivo?.pergunta}
              </p>

              <form onSubmit={submeterPlano}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#374151' }}>Responsável</label>
                    <input type="text" required value={planoAcao.responsavel} onChange={(e) => setPlanoAcao({...planoAcao, responsavel: e.target.value})} placeholder="Ex: IT Manager" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#374151' }}>Prazo de Resolução</label>
                    <input type="date" required value={planoAcao.prazo} onChange={(e) => setPlanoAcao({...planoAcao, prazo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#374151' }}>Descrição da Ação (Evidência)</label>
                  <textarea required value={planoAcao.descricao} onChange={(e) => setPlanoAcao({...planoAcao, descricao: e.target.value})} placeholder="O que vai ser feito ou alterado para mitigar este risco segundo a norma?" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={fecharModal} style={{ padding: '10px 15px', backgroundColor: 'transparent', color: '#6b7280', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>Submeter Ação Corretiva</button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Riscos;