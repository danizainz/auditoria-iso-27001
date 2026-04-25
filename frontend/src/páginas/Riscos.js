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

  const [modalEvidenciaAberto, setModalEvidenciaAberto] = useState(false);
  const [ficheiroEvidencia, setFicheiroEvidencia] = useState(null);

  useEffect(() => {
    const carregarRiscos = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/riscos-lista/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        let listaRiscos = response.data;

        const getPesoRisco = (nivel) => {
          switch (nivel?.toLowerCase()) {
            case 'crítico': return 4;
            case 'alto': return 3;
            case 'médio': return 2;
            case 'baixo': return 1;
            default: return 0;
          }
        };
        listaRiscos.sort((a, b) => getPesoRisco(b.nivel) - getPesoRisco(a.nivel));

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

  const abrirModalEvidencia = (risco) => {
    setRiscoAtivo(risco);
    setModalEvidenciaAberto(true);
  };

  const fecharModalEvidencia = () => {
    setModalEvidenciaAberto(false);
    setRiscoAtivo(null);
    setFicheiroEvidencia(null);
  };

  const submeterPlano = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/riscos/${riscoAtivo.id}/tratar/`, planoAcao, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const riscosAtualizados = riscos.map(r => 
        r.id === riscoAtivo.id ? { ...r, estado: 'Em curso', responsavel: planoAcao.responsavel, prazo: planoAcao.prazo, plano_descricao: planoAcao.descricao } : r
      );
      setRiscos(riscosAtualizados);
      fecharModal();
      alert("✅ Plano de Ação guardado!");
    } catch (error) {
      alert("❌ Erro ao comunicar com o servidor.");
    }
  };

  const concluirAcaoComEvidencia = async (e) => {
    e.preventDefault();
    if (!ficheiroEvidencia) {
      alert("⚠️ Por favor, anexa uma evidência.");
      return;
    }

    const formData = new FormData();
    formData.append('evidencia', ficheiroEvidencia);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/riscos/${riscoAtivo.id}/concluir/`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const riscosAtualizados = riscos.map(r => 
        r.id === riscoAtivo.id ? { ...r, estado: 'Resolvido' } : r
      );
      setRiscos(riscosAtualizados);
      fecharModalEvidencia();
      alert("🎉 Risco fechado com sucesso!");
    } catch (error) {
      alert("❌ Erro ao enviar o ficheiro.");
    }
  };

  const getCorRisco = (nivel) => {
    switch(nivel?.toLowerCase()) {
      case 'crítico': return { bg: '#7f1d1d', text: '#fef2f2', border: '#991b1b', label: '🚨 Crítico' };
      case 'alto': return { bg: '#fee2e2', text: '#ef4444', border: '#ef4444', label: '⚠️ Alto' };
      case 'médio': return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b', label: '👀 Médio' };
      case 'baixo': return { bg: '#dcfce7', text: '#166534', border: '#22c55e', label: '✅ Baixo' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af', label: 'Desconhecido' };
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
          <button onClick={() => setFiltroEstado('Pendente')} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: filtroEstado === 'Pendente' ? '#111827' : '#e5e7eb', color: filtroEstado === 'Pendente' ? 'white' : '#6b7280' }}>
            🔥 Pendentes ({riscos.filter(r => r.estado === 'Pendente').length})
          </button>
          <button onClick={() => setFiltroEstado('Em curso')} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: filtroEstado === 'Em curso' ? '#f59e0b' : '#fef3c7', color: filtroEstado === 'Em curso' ? 'white' : '#d97706' }}>
            ⏳ Em Curso ({riscos.filter(r => r.estado === 'Em curso').length})
          </button>
          <button onClick={() => setFiltroEstado('Resolvido')} style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: filtroEstado === 'Resolvido' ? '#10b981' : '#d1fae5', color: filtroEstado === 'Resolvido' ? 'white' : '#10b981' }}>
            ✅ Resolvidas ({riscos.filter(r => r.estado === 'Resolvido').length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>A carregar dados... 🔍</div>
        ) : riscosFiltrados.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '12px', color: '#6b7280', border: '1px dashed #d1d5db' }}>
            Não tens riscos neste estado.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {riscosFiltrados.map((risco, index) => {
              const cores = getCorRisco(risco.nivel);
              return (
                <div key={index} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${risco.estado === 'Resolvido' ? '#10b981' : risco.estado === 'Em curso' ? '#f59e0b' : cores.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '5px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: cores.bg, color: cores.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {cores.label}
                      </span>
                      <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e5e7eb' }}>
                        {risco.iso}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{risco.empresa} • {risco.n_doc}</span>
                  </div>

                  <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#111827', lineHeight: '1.4' }}>
                    {risco.pergunta}
                  </h3>

                  {/* BLOCO DO PLANO DE ACÇÃO */}
                  {risco.plano_descricao && (
                    <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #f3f4f6', marginBottom: '20px' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>PLANO DE ACÇÃO:</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#4b5563', fontStyle: 'italic' }}>"{risco.plano_descricao}"</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Detetado a: {risco.data}</span>
                      {risco.responsavel && (
                        <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 'bold', backgroundColor: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>
                          Responsável: {risco.responsavel}
                        </span>
                      )}
                      {risco.prazo && (
                        <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 'bold', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                          Prazo: {risco.prazo}
                        </span>
                      )}
                      {risco.estado === 'Resolvido' && risco.evidencia_url && (
                        <a href={risco.evidencia_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#047857', fontWeight: 'bold', textDecoration: 'underline', marginLeft: '10px' }}>
                          📎 Ver Evidência
                        </a>
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
                      {risco.estado === 'Em curso' && (
                        <button onClick={() => abrirModalEvidencia(risco)} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                          ✔ Marcar como Feito
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: CRIAR PLANO */}
        {modalAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '550px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#111827', fontWeight: '800' }}>Plano de Ação Corretiva</h2>
                <button onClick={fecharModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✖</button>
              </div>
              <form onSubmit={submeterPlano}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Responsável</label>
                    <input type="text" required value={planoAcao.responsavel} onChange={(e) => setPlanoAcao({...planoAcao, responsavel: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db'}} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Prazo Limite</label>
                    <input type="date" required value={planoAcao.prazo} onChange={(e) => setPlanoAcao({...planoAcao, prazo: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db'}} />
                  </div>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>O que vai ser feito?</label>
                  <textarea required value={planoAcao.descricao} onChange={(e) => setPlanoAcao({...planoAcao, descricao: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '100px'}}></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={fecharModal} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'white'}}>Cancelar</button>
                  <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>Gravar Ação</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EVIDÊNCIA */}
        {modalEvidenciaAberto && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(17, 24, 39, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', color: '#111827', fontWeight: '800' }}>Anexar Evidência</h2>
                <button onClick={fecharModalEvidencia} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✖</button>
              </div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>Anexa uma prova da resolução para fechar este risco.</p>
              <form onSubmit={concluirAcaoComEvidencia}>
                <div style={{ marginBottom: '30px' }}>
                  <input type="file" required onChange={(e) => setFicheiroEvidencia(e.target.files[0])} style={{ width: '100%', padding: '10px', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f9fafb' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={fecharModalEvidencia} style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'white'}}>Cancelar</button>
                  <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>Concluir e Fechar</button>
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