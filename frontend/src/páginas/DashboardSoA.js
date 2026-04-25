import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout'; 
import './DashboardSoA.css';

function DashboardSoA() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importado, setImportado] = useState(false);
  const [erro, setErro] = useState("");
  
  // Começa a zeros, o Django preenche depois
  const [stats, setStats] = useState({
    total_aplicavel: 0, implementados: 0, em_curso: 0, nao_iniciados: 0, progresso: 0
  });

  // Tenta ir buscar os dados mal a página abre
  useEffect(() => {
    carregarDadosReais();
  }, []);

  const carregarDadosReais = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/estatisticas-soa/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Se houver dados reais na BD, atualiza o ecrã
      if (res.data.total_aplicavel > 0) {
        setStats(res.data);
        setImportado(true);
      }
    } catch (e) {
      console.log("Ainda não há dados reais ou erro na API.");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErro("");
  };

  const handleUpload = async () => {
    if (!file) {
      setErro("Por favor, seleciona um ficheiro primeiro!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      
      // 1. Envia para o servidor
      await axios.post(`${process.env.REACT_APP_API_URL}/api/importar-soa/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });

      // 2. Vai buscar a matemática verdadeira após o upload!
      await carregarDadosReais(); 
      setLoading(false);

    } catch (err) {
      setErro("Erro ao importar o ficheiro. Verifica se o servidor está a correr.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="soa-container">
        <div className="soa-header">
          <h1>O Meu SoA (Declaração de Aplicabilidade)</h1>
          <p>Faça a gestão dos controlos da norma ISO 27001 da sua empresa num único local.</p>
        </div>

        {!importado ? (
          <div className="soa-upload-zone">
            <div className="soa-upload-icon">📊</div>
            <h2>Importar Template Excel</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Descarregue o template na Biblioteca, preencha-o e faça upload aqui para atualizar o seu sistema.
            </p>
            
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto 20px auto' }} />
            {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
            
            <button className="soa-btn-upload" onClick={handleUpload} disabled={loading}>
              {loading ? 'A processar dados com IA...' : 'Importar Dados para a Plataforma'}
            </button>
          </div>
        ) : (
          <div className="soa-dashboard">
            <div style={{ backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '8px', marginBottom: '30px', color: '#065f46', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
              ✅ Dados atualizados e sincronizados com a base de dados!
            </div>

            <div className="soa-stats-grid">
              <div className="soa-stat-card">
                <div className="soa-stat-title">Total Aplicável</div>
                <div className="soa-stat-value">{stats.total_aplicavel}</div>
              </div>
              <div className="soa-stat-card verde">
                <div className="soa-stat-title">Implementados</div>
                <div className="soa-stat-value">{stats.implementados}</div>
              </div>
              <div className="soa-stat-card amarelo">
                <div className="soa-stat-title">Em Curso</div>
                <div className="soa-stat-value">{stats.em_curso}</div>
              </div>
              <div className="soa-stat-card vermelho">
                <div className="soa-stat-title">Não Iniciados</div>
                <div className="soa-stat-value">{stats.nao_iniciados}</div>
              </div>
            </div>

            <div className="soa-progress-container">
              <h2>Progresso da Certificação</h2>
              <p style={{ color: '#6b7280' }}>A sua empresa está a <strong>{stats.progresso}%</strong> de estar em conformidade total.</p>
              <div className="soa-progress-bar-bg">
                <div className="soa-progress-fill" style={{ width: `${stats.progresso}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DashboardSoA;