import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from './Layout';
import { baseDeCursos } from './cursosData';
import './CursoPlayer.css';

function CursoPlayer() {
  const navigate = useNavigate();
  // O React apanha o ID do Curso diretamente da barra de endereço do browser (ex: "/curso/curso_phishing" → id = "curso_phishing")
  const { id } = useParams(); 
  
  const cursoData = baseDeCursos[id];

  const [slideAtual, setSlideAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [moduloConcluido, setModuloConcluido] = useState(false);
  const [errosCometidos, setErrosCometidos] = useState([]);

  useEffect(() => {
    if (!cursoData) navigate('/biblioteca');
  }, [cursoData, navigate]);

  const slide = cursoData?.slides[slideAtual];

  useEffect(() => {
    if (!slide) return;
    const espaçosVazios = {};
    const regex = /\[Espaço \d+\]/g;
    let match;
    while ((match = regex.exec(slide.texto)) !== null) {
      espaçosVazios[match[0]] = ""; 
    }
    setRespostas(espaçosVazios);
    setFeedback(null);
    setErrosCometidos([]); 
  }, [slideAtual, slide?.texto]);

  if (!cursoData) {
    return (
      <Layout>
        <div style={{ minHeight: '100vh', margin: '-40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ color: '#ef4444' }}>Curso Não Encontrado</h2>
            <button onClick={() => navigate('/biblioteca')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Voltar à Biblioteca</button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAdicionarPalavra = (palavra) => {
    if (feedback) return; 
    const primeiroEspacoVazio = Object.keys(respostas).find(k => respostas[k] === "");
    if (primeiroEspacoVazio) setRespostas({ ...respostas, [primeiroEspacoVazio]: palavra });
  };

  const handleRemoverPalavra = (espaco) => {
    if (feedback) return;
    setRespostas({ ...respostas, [espaco]: "" });
  };

  const verificarResposta = () => {
    let todasCertas = true;
    let palavrasErradas = []; 

    Object.keys(slide.respostasCertas).forEach(espaco => {
      const respostaDada = respostas[espaco];
      if (respostaDada !== slide.respostasCertas[espaco]) {
        todasCertas = false;
        if (respostaDada && respostaDada !== "") {
          palavrasErradas.push(respostaDada);
        }
      }
    });

    setErrosCometidos(palavrasErradas);
    setFeedback(todasCertas ? 'correto' : 'errado');
  };

  
  const avancarSlide = async () => {
    if (slideAtual < cursoData.slides.length - 1) {
      setSlideAtual(slideAtual + 1); // Avança para o slide seguinte
    } else {
      // CHEGOU AO FIM DO ÚLTIMO SLIDE! 
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access');
        
        
        // O ID que o React usa para escolher o curso (ex: "curso_phishing") é o mesmo que o Django espera para gravar na BD!
        await axios.post('https://auditoria-iso-27001.onrender.com/api/atualizar-progresso/', 
          { 
            recurso_id: cursoData.id_bd, 
            status: 'Concluído' 
          }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log(`Sucesso: ${id} gravado como Concluído no MySQL!`);
      } catch (error) {
        console.error("Erro ao gravar conclusão na Base de Dados:", error);
      }
      
      // Exibe a tela de conclusão
      setModuloConcluido(true); 
    }
  };

  if (moduloConcluido) {
    return (
      <Layout>
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: '-40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h1 style={{ color: '#10b981', fontSize: '28px', margin: '0 0 15px 0' }}>Formação Concluída</h1>
            <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '40px' }}>O <strong>{cursoData.titulo}</strong> foi registado no teu histórico.</p>
            <button onClick={() => navigate('/cursos-concluidos')} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Ver Histórico de Formação ➔
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const partesDoTexto = slide.texto.split(/(\[Espaço \d+\])/);
  const palavrasUsadas = Object.values(respostas);
  const palavrasDisponiveis = slide.opcoes.filter(opcao => !palavrasUsadas.includes(opcao));
  const progresso = ((slideAtual + 1) / cursoData.slides.length) * 100;

  return (
    <Layout>
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', margin: '-40px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/biblioteca')} style={{ background: 'none', color: '#6b7280', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
            ← Voltar à Biblioteca
          </button>
          {cursoData.videoUrl && (
            <a href={cursoData.videoUrl} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}>
              ▶ Assistir Videoaula
            </a>
          )}
        </div>

        <div className="player-container">
          <div className="player-header">
            <div>
              <span className="player-badge">AULA INTERATIVA</span>
              <h2>{cursoData.titulo}</h2>
            </div>
          </div>
          <div className="player-progress-bg"><div className="player-progress-fill" style={{ width: `${progresso}%` }}></div></div>

          <div className="player-body">
            <h3 className="slide-title">Exercício de Fixação {slideAtual + 1}</h3>
            <div className="slide-texto-container">
              {partesDoTexto.map((parte, index) => {
                if (parte.startsWith("[Espaço")) {
                  const palavraPreenchida = respostas[parte];
                  return (
                    <span key={index} className={`blank-slot ${palavraPreenchida ? 'filled' : ''} ${feedback === 'errado' && palavraPreenchida !== slide.respostasCertas[parte] ? 'error-slot' : ''} ${feedback === 'correto' ? 'success-slot' : ''}`} onClick={() => handleRemoverPalavra(parte)}>
                      {palavraPreenchida || "???"}
                    </span>
                  );
                }
                return <span key={index}>{parte}</span>;
              })}
            </div>
            <div className="opcoes-container">
              {palavrasDisponiveis.map((opcao, index) => (
                <button key={index} className="btn-opcao" onClick={() => handleAdicionarPalavra(opcao)} disabled={feedback !== null}>{opcao}</button>
              ))}
            </div>

            {feedback && (
              <div className={`feedback-box ${feedback}`}>
                <h4>{feedback === 'correto' ? '✓ Resposta Correta' : '✗ Resposta Incorreta'}</h4>
                <p>{slide.explicacao}</p>
                
                {feedback === 'errado' && errosCometidos.map((erro, i) => {
                  const explicacaoDesteErro = slide.explicacoesErro && slide.explicacoesErro[erro];
                  if (explicacaoDesteErro) {
                    return (
                      <span key={i} className="erro-justificacao">
                        <strong>Sobre "{erro}":</strong> {explicacaoDesteErro}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="player-footer">
            <span className="slide-counter">Página {slideAtual + 1} de {cursoData.slides.length}</span>
            {!feedback ? (
              <button className="btn-validar" onClick={verificarResposta} disabled={Object.values(respostas).includes("")}>Validar Conhecimento</button>
            ) : (
              <button className={`btn-avancar ${feedback}`} onClick={feedback === 'correto' ? avancarSlide : () => setFeedback(null)}>
                {feedback === 'errado' ? 'Tentar Novamente' : 'Próximo Desafio ➔'}
              </button>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default CursoPlayer;