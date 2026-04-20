import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Layout from './Layout'; 
import './AuditoriasList.css'; 

function Auditorias() {
  const navigate = useNavigate();
  const [tabAtivo, setTabAtivo] = useState('Auditorias');
  
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARREGAR DADOS DO DJANGO
  useEffect(() => {
    const carregarAuditorias = async () => {
      try {
        const response = await axios.get('https://auditoria-iso-27001.onrender.com/api/auditorias-tabela/', {
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

  // 2. FUNÇÃO QUE GERA O PDF
  
  const gerarRelatorioPDF = (auditoria) => {
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

    // --- SECÇÃO DO RESULTADO ---
    const resultY = headerHeight + 10;
    
    let colorScore = [239, 68, 68]; 
    if (auditoria.score >= 80) colorScore = [16, 185, 129]; 
    else if (auditoria.score >= 50) colorScore = [245, 158, 11]; 

    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(margin, resultY, pageWidth - (margin * 2), 20, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text("Resultado Global", margin + 5, resultY + 12);

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorScore[0], colorScore[1], colorScore[2]);
    doc.text(`${auditoria.score}%`, pageWidth - margin - 25, resultY + 16);

    // --- TABELA DE INFORMAÇÕES (METADADOS) ---
    const tableInfoY = resultY + 28;


    const infoBody = [
      ['Empresa Auditada', { content: auditoria.nome_empresa, styles: { fontStyle: 'bold' } }],
      ['Número do Documento', auditoria.n_doc],
      // NOME E EMAIL ENTRAM JUNTOS NESTA LINHA, COM FORMATAÇÃO DIFERENCIADA:
      ['Conduzido por', `${auditoria.auditor_nome} ${auditoria.auditor_email ? `(${auditoria.auditor_email})` : ''}`],
      ['Conduzido em', auditoria.data_inicio],
      ['Concluído em', auditoria.data_fim || 'Pendente'],
      ['Norma de Referência', 'ISO/IEC 27001:2022'],
      ['Estado da Auditoria', auditoria.estado],
    ];

    autoTable(doc, {
      startY: tableInfoY,
      head: [], 
      body: infoBody,
      theme: 'plain', 
      styles: { fontSize: 10, cellPadding: 3, textColor: [75, 85, 99] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: [17, 24, 39] }, 
        1: { cellWidth: 'auto', textColor: [0, 0, 0] }, 
      },
      margin: { left: margin, right: margin },
    });

    // --- TABELA COLORIDA DE PERGUNTAS E RESPOSTAS ---
    const finalYInfo = doc.lastAutoTable.finalY || tableInfoY + 50; 

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text("Detalhes da Avaliação", margin, finalYInfo + 15);

    if (auditoria.detalhes && auditoria.detalhes.length > 0) {
      const detalhesBody = auditoria.detalhes.map(d => [
        d.texto_pergunta, 
        d.evidencia_url ? 'Ver Anexo' : '-', 
        d.resposta.toUpperCase() 
      ]);

      autoTable(doc, {
        startY: finalYInfo + 20,
        head: [['Controlo Avaliado', 'Evidência', 'Resultado']],
        body: detalhesBody,
        theme: 'grid', 
        styles: {
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle',
          lineColor: [229, 231, 235], 
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 'auto', textColor: [17, 24, 39], fontStyle: 'bold' }, 
          1: { cellWidth: 35, halign: 'center', textColor: [37, 99, 235] }, 
          2: { cellWidth: 35, halign: 'right' } 
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
            
            if (resp === 'SIM') {
              data.cell.styles.fillColor = [16, 185, 129]; 
            } else if (resp === 'NÃO' || resp === 'NAO') {
              data.cell.styles.fillColor = [239, 68, 68]; 
            } else {
              data.cell.styles.fillColor = [156, 163, 175]; 
            }
          }
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(107, 114, 128);
      doc.text("Nenhuma resposta prática foi registada nesta auditoria ainda.", margin, finalYInfo + 25);
    }

    //  ASSINATURA DO AUDITOR - POSICIONADA DINAMICAMENTE APÓS A TABELA DE DETALHES
    const posYAssinatura = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : finalYInfo + 40; 
    
    if (auditoria.assinatura_base64) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text("Validação e Assinatura do Auditor:", margin, posYAssinatura);
      
      // Estampa a imagem da assinatura no PDF (Largura: 50, Altura: 15)
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
      doc.text(`Gerado por Auditoria ISO 27001 Platform | Página ${i} de ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
    }

    doc.save(`Relatorio_${auditoria.n_doc}_${auditoria.nome_empresa}.pdf`);
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
                    <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                      A carregar dados do sistema... 🔄
                    </td>
                  </tr>
                ) : auditorias.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>
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
                      <td style={{fontWeight: 'bold', color: aud.score >= 70 ? '#10b981' : '#ef4444'}}>
                        {aud.score}%
                      </td>
                      <td>{aud.data_inicio}</td>
                      <td>{aud.data_fim}</td>
                      
                      <td className="actions-cell" style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '100%' }}>
                        <button className="btn-view-report" onClick={() => gerarRelatorioPDF(aud)}>
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

                        {/* */}
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
      </div>
    </Layout>
  );
}

export default Auditorias;