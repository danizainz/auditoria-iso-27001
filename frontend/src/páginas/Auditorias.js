import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import Layout from './Layout'; 
import './AuditoriasList.css'; 

function Auditorias() {
  const navigate = useNavigate();
  const [tabAtivo, setTabAtivo] = useState('Auditorias');
  
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // 1. CARREGAR DADOS DO DJANGO
  useEffect(() => {
    const carregarAuditorias = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auditorias-tabela/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAuditorias(response.data); 
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar auditorias:", error);
        setLoading(false);
      }
    };
    carregarAuditorias();
  }, []);
  // FUNÇÃO PARA ELIMINAR AUDITORIA
  const eliminarAuditoria = async (id) => {
    const confirmacao = window.confirm("🚨 Tens a certeza absoluta? Esta ação vai apagar a auditoria, as respostas e o relatório em PDF de forma irreversível!");
    
    if (!confirmacao) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      
      await axios.delete(`https://auditoria-iso-27001.onrender.com/api/auditorias/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Atualiza o ecrã instantaneamente, removendo a linha apagada
      setAuditorias(auditorias.filter(auditoria => auditoria.id !== id));
      
      alert("✅ Auditoria eliminada com sucesso!");

    } catch (error) {
      console.error("Erro ao eliminar:", error);
      alert("❌ Erro ao eliminar a auditoria. O servidor recusou o pedido.");
    }
  };



// =========================================================
// Vai ao Django buscar a IA e o Gráfico, e depois chama o desenhador do PDF
// =========================================================

const tratarCliqueGerarPDF = async (auditoria) => {
  setGerandoPDF(true);
  try {
    console.log("A pedir dados à IA... aguarda uns 10 segundos!");
    
    const token = localStorage.getItem('token');
    console.log("🎫 O meu token é:", token);
    
    const response = await axios.get(`http://127.0.0.1:8000/api/auditoria/${auditoria.id}/pdf-dados/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    await gerarRelatorioPDFInteligente(auditoria, response.data);

    // fôlego de 500ms para o browser respirar e fechar o loading
    setTimeout(() => {
      setGerandoPDF(false);
    }, 500);

  

  } catch (error) {
    console.error("Erro a gerar:", error);
    alert("Erro ao comunicar com a IA. Verifica se o servidor está a correr.");
  }
};

// =========================================================
// 2. O DESENHADOR (FUSÃO: O teu layout + Dados IA)
// =========================================================

const gerarRelatorioPDFInteligente = (auditoria, dadosIA) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth(); 
  const margin = 14;

  // --- CABEÇALHO ---
  const headerHeight = 25;
  const headerColor = [244, 245, 247]; 
  
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39); 
  doc.text("Relatório de Conformidade ISO 27001", margin, headerHeight / 2 + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (auditoria.score < 100) {
    doc.setTextColor(239, 68, 68); 
    doc.text("Auditoria Incompleta", pageWidth - margin - 35, 8); 
  } else {
    doc.setTextColor(16, 185, 129); 
    doc.text("Auditoria Concluída", pageWidth - margin - 35, 8);
  }
  

  // --- O DONUT DO DJANGO E SCORE ---
  let currentY = headerHeight + 10;
  // ==========================================
  // 3. O GRÁFICO GIGANTE E OS 2 SCORES!
  // ==========================================
  if (dadosIA.grafico_donut_b64) {
    doc.addImage(dadosIA.grafico_donut_b64, 'PNG', margin, currentY, 60, 60); 
    
    // TÍTULO E SCORE 1: GLOBAL ABSOLUTO
    doc.setFontSize(14); 
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text("Resultado Global", margin + 80, currentY + 25); 
    
    let colorScore = [239, 68, 68]; 
    if (dadosIA.score >= 80) colorScore = [16, 185, 129]; 
    else if (dadosIA.score >= 50) colorScore = [245, 158, 11]; 

    doc.setFontSize(36); 
    doc.setTextColor(colorScore[0], colorScore[1], colorScore[2]);
    doc.text(`${dadosIA.score}%`, margin + 80, currentY + 40);

    // ====================================================
    // O SCORE DAS RESPONDIDAS
    // ====================================================
    doc.setFontSize(11); 
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text("Resultado nas perguntas já avaliadas:", margin + 80, currentY + 55); 
    
    let colorResp = [239, 68, 68]; 
    const valorRespondidas = dadosIA.score_respondidas || 0; // Prevenção de erro
    
    if (valorRespondidas >= 80) colorResp = [16, 185, 129]; 
    else if (valorRespondidas >= 50) colorResp = [245, 158, 11];

    doc.setFontSize(14); 
    doc.setTextColor(colorResp[0], colorResp[1], colorResp[2]);
    doc.text(`${valorRespondidas}% de Conformidade`, margin + 80, currentY + 62);
  }

  currentY += 80; // Dá o desconto da altura do gráfico para as barras não ficarem em cima

  if (dadosIA.dominios && dadosIA.dominios.length > 0) {
    let barY = currentY + 5; 
    const barXOffset = 110; // Posição horizontal onde as barras começam
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text("Progresso por Domínio:", barXOffset, barY);
    barY += 8;

    dadosIA.dominios.forEach(dom => {
      // 1. Nome do Domínio (ex: A.5 Controlos Organizacionais)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(dom.nome, barXOffset, barY);

      // 2. Fundo Cinza da Barra
      doc.setFillColor(229, 231, 235);
      doc.rect(barXOffset, barY + 2, 60, 4, 'F'); // Largura total: 60

      // 3. Preenchimento Verde da Barra
      const verdeISO = [77, 124, 15];
      doc.setFillColor(verdeISO[0], verdeISO[1], verdeISO[2]);
      const preenchimento = (60 * dom.score) / 100;
      if (preenchimento > 0) {
        doc.rect(barXOffset, barY + 2, preenchimento, 4, 'F');
      }

      // 4. Texto da Percentagem
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(verdeISO[0], verdeISO[1], verdeISO[2]);
      doc.text(`${dom.score}%`, barXOffset + 63, barY + 5.5);

      barY += 9; // Espaçamento para a próxima linha
    });
  }

  // Avançar o Y para a secção da Análise de Risco não ficar em cima do gráfico
  currentY += 55; 

  

  // --- RESUMO EXECUTIVO (IA) ---
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);

// Divide o texto e descobre quantas linhas a IA gerou
const resumoLinhas = doc.splitTextToSize(dadosIA.resumo_executivo_ia, pageWidth - (margin * 2) - 10);

// Calcula a altura real que o texto precisa 
// (ex: cada linha ocupa aprox 4.5 pontos) + 15 pontos para dar espaço em cima e em baixo
const alturaTexto = resumoLinhas.length * 4.5;
const alturaCaixa = alturaTexto + 15; 

// 3. Desenha o fundo cinzento com a ALTURA DINÂMICA
doc.setFillColor(249, 250, 251);
doc.rect(margin, currentY, pageWidth - (margin * 2), alturaCaixa, 'F');

// 4. Desenha o Título
doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.setTextColor(17, 24, 39);
doc.text("Análise de Risco:", margin + 5, currentY + 7);

// 5. Desenha o Texto da IA
doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text(resumoLinhas, margin + 5, currentY + 14);

// 6. Atualiza o Y somando a altura da caixa inteira + 10 de margem de respiro
currentY += alturaCaixa + 10;

  // --- TABELA DE INFORMAÇÕES ---
  const infoBody = [
    ['Empresa Auditada', { content: auditoria.nome_empresa, styles: { fontStyle: 'bold' } }],
    ['Número do Documento', auditoria.n_doc],
    ['Conduzido por', `${auditoria.auditor_nome} ${auditoria.auditor_email ? `(${auditoria.auditor_email})` : ''}`],
    ['Conduzido em', auditoria.data_inicio],
    ['Concluído em', auditoria.data_fim],
    ['Norma de Referência', 'ISO/IEC 27001:2022'],
    ['Estado da Auditoria', auditoria.estado],
    ['Resultado Global', `${dadosIA.score}%`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [], 
    body: infoBody,
    theme: 'plain', 
    styles: { fontSize: 9, cellPadding: 2, textColor: [75, 85, 99] },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [17, 24, 39] }, 
      1: { cellWidth: 'auto', textColor: [0, 0, 0] }, 
    },
    margin: { left: margin, right: margin },
  });

  
  // --- TABELA PLANO DE AÇÃO (IA) ---
  let finalYInfo = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text("Plano de Ação Corretiva", margin, finalYInfo);

  if (dadosIA.plano_acao_ia && dadosIA.plano_acao_ia.length > 0) {
    const planoBody = dadosIA.plano_acao_ia.map(item => [
      item.controlo,
      item.problema,
      item.acao_corretiva
    ]);

    autoTable(doc, {
      startY: finalYInfo + 5,
      head: [['ISO', 'Falha Detetada', 'Solução Recomendada']],
      body: planoBody,
      headStyles: { fillColor: [153, 27, 27] }, 
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Nenhuma falha crítica detetada para gerar plano de ação.", margin, finalYInfo + 10);
  }

  // --- NOVA PÁGINA ---
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text("Detalhes Completos da Avaliação", margin, 20);

  if (auditoria.detalhes && auditoria.detalhes.length > 0) {
    const detalhesBody = auditoria.detalhes.map(d => [
      d.texto_pergunta, 
      d.evidencia_url ? 'Ver Anexo' : '-', 
      d.resposta.toUpperCase() 
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Controlo Avaliado', 'Evidência', 'Resultado']],
      body: detalhesBody,
      theme: 'grid', 
      styles: { fontSize: 9, cellPadding: 4, valign: 'middle', lineColor: [229, 231, 235], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 'auto', textColor: [17, 24, 39], fontStyle: 'bold' }, 
        1: { cellWidth: 25, halign: 'center', textColor: [37, 99, 235] }, 
        2: { cellWidth: 25, halign: 'right' } 
      },
      didDrawCell: function (data) {
        if (data.column.index === 1 && data.cell.section === 'body') {
          const detalhe = auditoria.detalhes[data.row.index];
          if (detalhe && detalhe.evidencia_url) {
            doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: detalhe.evidencia_url });
          }
        }
      },
      didParseCell: function (data) {
        if (data.column.index === 2 && data.cell.section === 'body') { 
          const resp = data.cell.raw;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [255, 255, 255]; 
          data.cell.styles.halign = 'center';
          
          if (resp === 'SIM') data.cell.styles.fillColor = [16, 185, 129]; 
          else if (resp === 'NÃO' || resp === 'NAO') data.cell.styles.fillColor = [239, 68, 68]; 
          else data.cell.styles.fillColor = [156, 163, 175]; 
        }
      }
    });
  }

  // --- ASSINATURA ---
  const posYAssinatura = doc.lastAutoTable.finalY + 15; 
  if (auditoria.assinatura_base64) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text("Validação e Assinatura do Auditor:", margin, posYAssinatura);
    doc.addImage(auditoria.assinatura_base64, 'PNG', margin, posYAssinatura + 5, 50, 15);
  }

  // --- RODAPÉ ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(156, 163, 175); 
    doc.text(`Relatório Auditoria ISO 27001 | Página ${i} de ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
  }

  doc.save(`Relatorio_IA_${auditoria.n_doc}_${auditoria.nome_empresa}.pdf`);
};

  return (
    <Layout>
      <div style={{ margin: '-40px', backgroundColor: '#f4f5f7', minHeight: '100vh' }}>

        <div className="list-topbar">
          <div className="tabs-container">
            <button className={`tab-btn ${tabAtivo === 'Auditorias' ? 'active' : ''}`} onClick={() => setTabAtivo('Auditorias')}>Ativas</button>
            <button className={`tab-btn ${tabAtivo === 'Arquivo' ? 'active' : ''}`} onClick={() => setTabAtivo('Arquivo')}>Arquivo Histórico</button>
          </div>
          <button className="feedback-btn">💬 Suporte SGSI</button>
        </div>

        <div className="list-main-content" style={{ padding: '40px' }}>
          <div className="list-header-row">
            <h2>Gestão de Auditorias</h2>
            <button className="btn-start-inspection" onClick={() => navigate('/auditorias/nova')}>
              + Nova Auditoria
            </button>
          </div>

          <div className="list-filters">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Pesquisar por empresa ou Nº..." />
            </div>
            <button className="btn-add-filter">+ Adicionar filtro</button>
            <span className="result-count">{auditorias.length} resultados encontrados</span>
          </div>

          <div className="table-container">
            <table className="sc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}><input type="checkbox" /></th>
                  <th>Empresa / Organização</th>
                  <th>Estado</th>
                  <th>Nº Doc</th>
                  <th>Conformidade</th>
                  <th>Data de Início ↓</th>
                  <th>Data de Conclusão</th>
                  <th style={{ width: '180px' }}></th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row-group">
                  <td colSpan="8" className="row-group-title">
                    <input type="checkbox" /> AUDITORIAS RECENTES
                  </td>
                </tr>

                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                      A carregar dados do sistema... 🔄
                    </td>
                  </tr>
                ) : auditorias.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      Nenhuma auditoria encontrada na base de dados.
                    </td>
                  </tr>
                ) : (
                  auditorias.map(aud => (
                    <tr key={aud.id} className="data-row">
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="inspection-title-cell">
                          <span className="icon-document">📄</span>
                          <div>
                            <strong>{aud.nome_empresa}</strong>
                            <span className="subtitle">Auditoria de Conformidade</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${aud.estado.toLowerCase().replace(" ", "-")}`}>
                          {aud.estado}
                        </span>
                      </td>
                      <td>{aud.n_doc}</td>
                      <td style={{ fontWeight: 'bold', color: aud.score >= 70 ? '#10b981' : '#ef4444' }}>
                        {aud.score}%
                      </td>
                      <td>{aud.data_inicio}</td>
                      <td>{aud.data_fim}</td>

                      <td className="actions-cell" style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="btn-view-report" onClick={() => tratarCliqueGerarPDF(aud)} style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}>
                          Relatório
                        </button>

                        <button
                          onClick={() => navigate(`/auditoria/${aud.id}`)}
                          style={{
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)',
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>✏️</span> Continuar
                        </button>

                        <button
                          className="btn-more"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                          onClick={() => eliminarAuditoria(aud.id)}
                          title="Eliminar Auditoria"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {gerandoPDF && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 9999,
            color: 'white'
          }}>
            <div style={{
              width: '60px', height: '60px',
              border: '6px solid #f3f3f3',
              borderTop: '6px solid #991b1b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              A gerar Relatório Inteligente...
            </h2>
            <p style={{ fontSize: '16px', color: '#d1d5db' }}>
              A IA está a analisar as tuas respostas. Isto pode demorar uns segundos.
            </p>

            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Auditorias;