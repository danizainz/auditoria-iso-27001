import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './Biblioteca.css'; 
import Layout from './Layout'; 

function Biblioteca() {
  const navigate = useNavigate(); 
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarRecursos = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/recursos-educativos/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const dadosReais = response.data.results ? response.data.results : response.data;
        setRecursos(dadosReais);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar a biblioteca:", error);
        setLoading(false);
      }
    };
    buscarRecursos();
  }, []);

  // LÓGICA DE FILTROS E PESQUISA
  const recursosFiltrados = recursos.filter(r => {
    // Esconde itens do tipo "Documento" a teu pedido
    if (r.tipo === 'Documento') return false; 

    // Pesquisa por texto
    const tituloValido = r.titulo ? r.titulo.toLowerCase() : "";
    const batePesquisa = tituloValido.includes(busca.toLowerCase());
    
    // Filtro dos Botões 
    let bateCategoria = false;
    if (categoriaAtiva === "Todos") bateCategoria = true;
    if (categoriaAtiva === "Templates" && r.tipo === "Template") bateCategoria = true;
    if (categoriaAtiva === "Cursos" && (r.tipo === "Vídeo" || r.tipo === "Curso")) bateCategoria = true;
    
    return batePesquisa && bateCategoria;
  });

  
  const irParaCurso = async (recurso) => {
    
    // para Django: Gravar como "Em andamento"
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/atualizar-progresso/`, 
        { recurso_id: recurso.id, status: 'Em andamento' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Erro a gravar início na BD:", error);
    }

    
    let idDoJson = "top_vulnerabilidades"; 

    // O React olha para o título que vem do Django e escolhe o ID certo
    if (recurso.titulo.includes("Phishing")) {
      idDoJson = "curso_phishing";
    } else if (recurso.titulo.includes("Teletrabalho")) {
      idDoJson = "curso_teletrabalho";
    } else if (recurso.titulo.includes("SGSI")) {
      idDoJson = "curso_sgsi";
    }

    // Navega para a página dedicada ao curso (ex: /curso/curso_phishing)
    navigate(`/curso/${idDoJson}`); 
  };

  return (
    <Layout> 
      
      {/* */}
      <div className="bib-hero">
        <h1>Tudo o que precisas para dominar a ISO 27001</h1>
        <p>Explora os nossos templates prontos a usar e módulos de formação interativos.</p>
        
        <div className="bib-search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar por phishing, políticas, templates..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* INTRODUÇÃO À ISO 27001 */}
      <div className="bib-intro-section">
        <div className="bib-intro-text">
          <h2>O que é a ISO 27001?</h2>
          <p>
            A <strong>ISO/IEC 27001</strong> é a principal norma internacional para a gestão da segurança da informação. 
            O seu principal objetivo é ajudar as organizações a protegerem os seus dados através da implementação de um <strong>Sistema de Gestão de Segurança da Informação (SGSI)</strong>, baseado em três pilares fundamentais:
          </p>
        </div>
        <div className="bib-cia-grid">
          <div className="bib-cia-card"><span className="cia-icon">🤫</span><h4>Confidencialidade</h4><p>Garantir que a informação só é acedida por pessoas devidamente autorizadas.</p></div>
          <div className="bib-cia-card"><span className="cia-icon">🛡️</span><h4>Integridade</h4><p>Proteger a exatidão e a totalidade da informação contra alterações indevidas.</p></div>
          <div className="bib-cia-card"><span className="cia-icon">⚡</span><h4>Disponibilidade</h4><p>Garantir que a informação está acessível aos utilizadores autorizados sempre que necessário.</p></div>
        </div>
      </div>

      {/* ZONA DE RECURSOS EDUCATIVOS */}
      <div className="bib-recursos-header">
        <h2>Recursos Disponíveis</h2>
        <div className="bib-filtros">
          {["Todos", "Templates", "Cursos"].map(cat => (
            <button 
              key={cat} 
              className={`bib-pill ${categoriaAtiva === cat ? 'active' : ''}`}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bib-loading">A carregar recursos da base de dados... 🔄</div>
      ) : (
        <div className="bib-grid">
          {recursosFiltrados.length > 0 ? (
            recursosFiltrados.map(recurso => {
              
              // Verifica se o item é um curso interativo
              const isCurso = recurso.tipo === 'Vídeo' || recurso.tipo === 'Curso';

              let linkDestino = isCurso ? null : (recurso.ficheiro || recurso.url); 
              if (linkDestino && linkDestino.startsWith('/')) linkDestino = `https://auditoria-iso-27001.onrender.com${linkDestino}`;

              let linkCapa = recurso.capa || recurso.imagem; 
              if (linkCapa && !linkCapa.startsWith('http')) linkCapa = `https://auditoria-iso-27001.onrender.com${linkCapa}`;

              return (
                <div key={recurso.id} className="bib-card">
                  
                  {linkCapa ? (
                    <img src={linkCapa} alt={`Capa de ${recurso.titulo}`} className="bib-cover-image" />
                  ) : (
                    <div className="bib-card-icon">{recurso.icone || '📄'}</div>
                  )}

                  <div className="bib-card-content">
                    {/* Muda a Etiqueta conforme o tipo */}
                    <span className="bib-badge" style={{ backgroundColor: isCurso ? '#ecfeff' : '#eef2ff', color: isCurso ? '#0891b2' : '#4f46e5' }}>
                      {isCurso ? 'CURSO INTERATIVO' : 'TEMPLATE'}
                    </span>
                    
                    <h3>{recurso.titulo}</h3>
                    <p>{recurso.descricao}</p>
                    
                    <div className="bib-btn-wrapper">
                      {/* O BOTÃO QUE CHAMA A FUNÇÃO INTACTA */}
                      {isCurso ? (
                        <button 
                          className="bib-btn-abrir" 
                          style={{ backgroundColor: '#0891b2', color: 'white' }}
                          onClick={() => irParaCurso(recurso)}
                        >
                          Assistir / Treinar
                        </button>
                      ) : linkDestino ? (
                        <a 
                          href={linkDestino} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bib-btn-abrir"
                        >
                          Obter Template
                        </a>
                      ) : (
                        <button className="bib-btn-abrir" disabled>
                          Indisponível
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="bib-empty">Nenhum recurso encontrado com estes filtros.</p>
          )}
        </div>
      )}

    </Layout>
  );
}

export default Biblioteca;