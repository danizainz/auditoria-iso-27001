import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import Layout from './Layout'; 
import './Dashboard.css';
import './Auditoria.css';

function Auditoria() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const padRef = useRef({}); 
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [temaAtivo, setTemaAtivo] = useState('Organizacional');
  
  const [modoEdicao, setModoEdicao] = useState(false);
  const [respostasAntigas, setRespostasAntigas] = useState([]);
  
  const [organizacoes, setOrganizacoes] = useState([]);

  const [info, setInfo] = useState({
    numDoc: "AUD-AUTO", 
    nomeOrganizacao: "", 
    dataRealizacao: new Date().toISOString().slice(0, 16),
    assinaturaData: null 
  });

  const [seccoes, setSeccoes] = useState([]);

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const pedidos = [
          axios.get(`${process.env.REACT_APP_API_URL}/api/questoes/`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/organizacoes/`, { headers })
        ];

        if (id) {
          pedidos.push(axios.get(`${process.env.REACT_APP_API_URL}/api/auditorias/${id}/`, { headers }));
          pedidos.push(axios.get(`${process.env.REACT_APP_API_URL}/api/respostas/`, { headers }));
        }

        const resultados = await Promise.all(pedidos);

        const dadosQuestoes = resultados[0].data.results || resultados[0].data;
        const temasFormatados = [
          { titulo: "A.5 Organizacional", id: "Organizacional", controlos: [] },
          { titulo: "A.6 Pessoas", id: "Pessoas", controlos: [] },
          { titulo: "A.7 Físico", id: "Físico", controlos: [] },
          { titulo: "A.8 Tecnológico", id: "Tecnológico", controlos: [] }
        ];

        dadosQuestoes.forEach(questao => {
          const temaCerto = temasFormatados.find(t => t.id === questao.dominio_iso);
          if (temaCerto) {
            temaCerto.controlos.push({
              id_bd: questao.id, 
              titulo: `${questao.referencia_controlo} - ${questao.descricao}`,
              sub_perguntas: questao.perguntas_praticas ? questao.perguntas_praticas.map(p => ({
                id_pergunta: p.id,
                texto: p.texto_pergunta,
                resposta: null, 
                nota: "", // Estado inicial da nota
                evidencia: null,
                evidencia_url: null
              })) : []
            });
          }
        });

        const listaOrgs = resultados[1].data.results || resultados[1].data;
        setOrganizacoes(listaOrgs);

        if (id) {
          setModoEdicao(true);
          const audData = resultados[2].data;
          
          const orgEncontrada = listaOrgs.find(o => o.id === audData.organizacao);

          setInfo(prev => ({
            ...prev,
            numDoc: `AUD-${audData.id.toString().padStart(4, '0')}`,
            nomeOrganizacao: orgEncontrada ? orgEncontrada.nome : "",
            dataRealizacao: audData.data_inicio + "T00:00", 
          }));

          const todasRespostas = resultados[3].data.results || resultados[3].data;
          const respostasDestaAuditoria = todasRespostas.filter(r => r.auditoria === parseInt(id));
          setRespostasAntigas(respostasDestaAuditoria); 

          temasFormatados.forEach(sec => {
            sec.controlos.forEach(ctrl => {
              ctrl.sub_perguntas.forEach(sp => {
                const respostaDada = respostasDestaAuditoria.find(r => r.pergunta === sp.id_pergunta);
                if (respostaDada) {
                  sp.resposta = respostaDada.resposta; 
                  sp.nota = respostaDada.observacoes; //  Carrega a nota antiga da BD
                  sp.evidencia_url = respostaDada.evidencia; 
                }
              });
            });
          });
        }

        setSeccoes(temasFormatados);
        setLoading(false);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      }
    };

    carregarTudo();
  }, [id]);

  const limparAssinatura = () => padRef.current.clear();
  
  const irParaPagina2 = () => {
    if (!info.nomeOrganizacao.trim()) {
        alert("Por favor, escreva ou selecione uma organização antes de avançar.");
        return;
    }
    if (!padRef.current.isEmpty()) {
      setInfo({ ...info, assinaturaData: padRef.current.getCanvas().toDataURL('image/png') });
    }
    setPaginaAtual(2);
  };

  const handleResposta = (temaId, controloId, perguntaId, valor) => {
    const novasSeccoes = seccoes.map(sec => {
      if (sec.id === temaId) {
        return {
          ...sec,
          controlos: sec.controlos.map(ctrl => {
            if (ctrl.id_bd === controloId) {
              return {
                ...ctrl,
                sub_perguntas: ctrl.sub_perguntas.map(sp => 
                  sp.id_pergunta === perguntaId ? { ...sp, resposta: valor } : sp
                )
              };
            }
            return ctrl;
          })
        };
      }
      return sec;
    });
    setSeccoes(novasSeccoes);
  };

  const handleEvidencia = (temaId, controloId, perguntaId, ficheiro) => {
    const novasSeccoes = seccoes.map(sec => {
      if (sec.id === temaId) {
        return {
          ...sec,
          controlos: sec.controlos.map(ctrl => {
            if (ctrl.id_bd === controloId) {
              return {
                ...ctrl,
                sub_perguntas: ctrl.sub_perguntas.map(sp => 
                  sp.id_pergunta === perguntaId ? { ...sp, evidencia: ficheiro } : sp
                )
              };
            }
            return ctrl;
          })
        };
      }
      return sec;
    });
    setSeccoes(novasSeccoes);
  };

  // handle para as notas
  const handleNota = (temaId, controloId, perguntaId, texto) => {
    const novasSeccoes = seccoes.map(sec => {
      if (sec.id === temaId) {
        return {
          ...sec,
          controlos: sec.controlos.map(ctrl => {
            if (ctrl.id_bd === controloId) {
              return {
                ...ctrl,
                sub_perguntas: ctrl.sub_perguntas.map(sp => 
                  sp.id_pergunta === perguntaId ? { ...sp, nota: texto } : sp
                )
              };
            }
            return ctrl;
          })
        };
      }
      return sec;
    });
    setSeccoes(novasSeccoes);
  };

  const finalizarAuditoria = async () => {
    try {
      const token = localStorage.getItem('token');
      const headersJSON = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const headersFicheiros = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };

      let auditoriaId = id; 

      if (!modoEdicao) {
        let orgIdFinal = null;
        const empresaExistente = organizacoes.find(
          org => org.nome.toLowerCase() === info.nomeOrganizacao.trim().toLowerCase()
        );

        if (empresaExistente) {
          orgIdFinal = empresaExistente.id;
        } else {
          const resNovaOrg = await axios.post(`${process.env.REACT_APP_API_URL}/api/organizacoes/`, {
            nome: info.nomeOrganizacao.trim(),
            setor: 'Não Definido'
          }, { headers: headersJSON });
          orgIdFinal = resNovaOrg.data.id;
        }

        const payloadAuditoria = {
          data_inicio: info.dataRealizacao.split('T')[0],
          organizacao: orgIdFinal,
          estado: 1,
          assinatura_base64: info.assinaturaData 
        };
        const responseAuditoria = await axios.post(`${process.env.REACT_APP_API_URL}/api/auditorias/`, payloadAuditoria, { headers: headersJSON });
        auditoriaId = responseAuditoria.data.id; 
      } else {
        // 🚦 APAGAR EM FILA INDIANA (EVITAR ERRO DE LIGAÇÕES)
        for (const r of respostasAntigas) {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/respostas/${r.id}/`, { headers: headersJSON });
        }
      }

      // Prepara todas as respostas que queremos enviar
      const respostasParaEnviar = [];
      seccoes.forEach(sec => {
        sec.controlos.forEach(ctrl => {
          ctrl.sub_perguntas.forEach(sp => {
            if (sp.resposta !== null) { 
              const formData = new FormData();
              formData.append('auditoria', auditoriaId);
              formData.append('pergunta', sp.id_pergunta);
              formData.append('resposta', sp.resposta);
              formData.append('observacoes', sp.nota || ""); 
              if (sp.evidencia) formData.append('evidencia', sp.evidencia);

              respostasParaEnviar.push(formData);
            }
          });
        });
      });

      // 🚦 GRAVAR EM FILA INDIANA (O SEGREDO PARA NÃO REBENTAR A BD)
      // Em vez de Promise.all, usamos um for...of para esperar que um grave antes de mandar o próximo.
      for (const formData of respostasParaEnviar) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/respostas/`, formData, { headers: headersFicheiros });
      }

      alert(`✅ SUCESSO! A Auditoria e as Ações Corretivas (se existirem) foram guardadas!`);
      navigate('/auditorias'); 

    } catch (error) {
      console.error("Erro fatal ao submeter auditoria:", error);
      alert("❌ Ocorreu um erro ao guardar. A Base de Dados pode estar sobrecarregada.");
    }
  };

  return (
    <Layout>
      <div className="dash-content" style={{ padding: '0px' }}>
        <div className="audit-page-header">
          <p>Page {paginaAtual} of 2 {modoEdicao && <strong style={{color: '#f59e0b'}}> (Modo de Edição)</strong>}</p>
          <h2>{paginaAtual === 1 ? 'Informações Iniciais' : 'Anexo A - ISO 27001'}</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>A carregar sistema... 🔄</div>
        ) : (
          <>
            {/* PÁGINA 1 */}
            {paginaAtual === 1 && (
              <div className="audit-form-container">
                <div className="input-card">
                  <label>Nº do Documento</label>
                  <input type="text" value={info.numDoc} disabled />
                </div>

                <div className="input-card">
                  <label>Organização / Empresa a Auditar</label>
                  <input 
                    list="empresas-cadastradas"
                    value={info.nomeOrganizacao} 
                    onChange={e => setInfo({...info, nomeOrganizacao: e.target.value})}
                    disabled={modoEdicao}
                    placeholder="Escreva uma nova ou escolha da lista..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: modoEdicao ? '#f3f4f6' : 'white' }}
                  />
                  <datalist id="empresas-cadastradas">
                    {organizacoes.map(org => (
                      <option key={org.id} value={org.nome} />
                    ))}
                  </datalist>
                </div>

                <div className="input-card">
                  <label>Data da Auditoria</label>
                  <input type="datetime-local" value={info.dataRealizacao} onChange={e => setInfo({...info, dataRealizacao: e.target.value})} />
                </div>

                <div className="input-card">
                  <label>Assinatura Digital do Auditor</label>
                  <div style={{ width: '500px', height: '150px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden' }}>
                      <SignatureCanvas ref={padRef} canvasProps={{width: 500, height: 150, className: 'sigCanvas'}}/>
                  </div>
                  <button className="btn-clear-sig" onClick={limparAssinatura} style={{ marginTop: '10px' }}>Limpar Assinatura</button>
                </div>

                <div className="bottom-actions" style={{ marginTop: '30px' }}>
                  <button className="btn-next-page" onClick={irParaPagina2} style={{ width: '100%', padding: '15px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Avançar para Checklist ➔
                  </button>
                </div>
              </div>
            )}

            {/* O */}
            {paginaAtual === 2 && (
              <div className="audit-form-container">
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {seccoes.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => setTemaAtivo(sec.id)}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: temaAtivo === sec.id ? '#4f46e5' : '#f3f4f6', 
                        color: temaAtivo === sec.id ? 'white' : '#4b5563',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      {sec.titulo}
                    </button>
                  ))}
                </div>
                
                {seccoes.filter(sec => sec.id === temaAtivo).map(sec => (
                  <div key={sec.id} className="audit-section" style={{ marginBottom: '50px' }}>
                    <div className="section-header" style={{ backgroundColor: '#111827', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0 }}>{sec.titulo}</h3>
                    </div>

                    <div className="section-body">
                      {sec.controlos.map(ctrl => (
                        <div key={ctrl.id_bd} className="controlo-card" style={{ marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
                          <div style={{ backgroundColor: '#f9fafb', padding: '12px 20px', borderBottom: '1px solid #e5e7eb', borderRadius: '8px 8px 0 0' }}>
                            <h4 style={{ margin: 0, color: '#4b5563', fontSize: '14px', fontWeight: '600' }}>📖 {ctrl.titulo}</h4>
                          </div>

                          <div style={{ padding: '20px' }}>
                            {ctrl.sub_perguntas.map((sp, index) => (
                              <div key={sp.id_pergunta} style={{ borderBottom: index !== ctrl.sub_perguntas.length - 1 ? '1px solid #f3f4f6' : 'none', paddingBottom: '25px', marginBottom: '25px' }}>
  
  {/* TEXTO DA PERGUNTA */}
  <p style={{ fontWeight: '500', fontSize: '16px', color: '#111827', marginTop: 0 }}>{sp.texto}</p>
  
  {/* BOTÕES DE RESPOSTA (Sim / Não / NA) */}
  <div className="sc-btn-group" style={{ display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '15px' }}>
    <button className={`sc-btn sc-sim ${sp.resposta === 'Sim' ? 'active' : ''}`} onClick={() => handleResposta(sec.id, ctrl.id_bd, sp.id_pergunta, 'Sim')}>Sim</button>
    <button className={`sc-btn sc-nao ${sp.resposta === 'Não' ? 'active' : ''}`} onClick={() => handleResposta(sec.id, ctrl.id_bd, sp.id_pergunta, 'Não')}>Não</button>
    <button className={`sc-btn sc-na ${sp.resposta === 'NA' ? 'active' : ''}`} onClick={() => handleResposta(sec.id, ctrl.id_bd, sp.id_pergunta, 'NA')}>NA</button>
  </div>

  {/* ÁREA DA NOTA*/}
  <div style={{ marginBottom: '10px' }}>
    <textarea 
      placeholder="Adicione uma nota, justificação ou observação de auditoria..."
      value={sp.nota || ''}
      onChange={(e) => handleNota(sec.id, ctrl.id_bd, sp.id_pergunta, e.target.value)}
      style={{ 
        width: '100%', 
        padding: '12px', 
        borderRadius: '6px', 
        border: '1px solid #d1d5db', 
        fontSize: '14px', 
        boxSizing: 'border-box', 
        minHeight: '80px', 
        fontFamily: 'inherit',
        resize: 'vertical',
        backgroundColor: '#ffffff'
      }}
    />
  </div>

  {/* BARRA DE FERRAMENTAS (Anexo à esquerda, Ação à direita) */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: sp.resposta === 'Não' ? '#fef2f2' : '#f9fafb', padding: '12px 15px', borderRadius: '6px', border: `1px dashed ${sp.resposta === 'Não' ? '#fca5a5' : '#d1d5db'}`, transition: 'all 0.3s' }}>
    
    {/* Lado Esquerdo: Ficheiro */}
    <div>
      <label style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
        📎 {sp.evidencia ? <span style={{ color: '#10b981' }}>Ficheiro: {sp.evidencia.name || 'Anexo Guardado'}</span> : 'Anexar Evidência'}
        <input 
          type="file" 
          accept="image/*,.pdf" 
          onChange={(e) => handleEvidencia(sec.id, ctrl.id_bd, sp.id_pergunta, e.target.files[0])} 
          style={{ display: 'none' }}
        />
      </label>
    </div>

    {/* Lado Direito: Botão Ação Corretiva (Só aparece se a resposta for NÃO) */}
    {sp.resposta === 'Não' && (
      <button 
        onClick={() => alert(`Aqui abriremos o Modal para criar o Plano de Ação para: \n"${sp.texto}"`)}
        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}
      >
        🚀 Criar Ação Corretiva
      </button>
    )}
  </div>

</div>
                              
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bottom-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
                  <button className="btn-clear-sig" onClick={() => setPaginaAtual(1)} style={{ padding: '12px 20px' }}>🔙 Voltar</button>
                  <button className="btn-next-page" onClick={finalizarAuditoria} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    ✅ Guardar Auditoria
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Auditoria;