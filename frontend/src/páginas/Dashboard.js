import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout'; 

function Dashboard() {
  const navigate = useNavigate();
  
  
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard-real/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDados(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro a carregar dados reais do Dashboard:", error);
        setLoading(false);
      }
    };
    carregarDashboard();
  }, []);

  const getScoreColor = (score) => {
    if (!score) return '#9ca3af'; 
    if (score >= 80) return '#10b981'; 
    if (score >= 60) return '#f59e0b'; 
    return '#ef4444'; 
  };

 
  const aoClicarNoCurso = async (recursoId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      // Avisa o Django que o gajo clicou para começar/continuar
      await axios.post('http://127.0.0.1:8000/api/atualizar-progresso/', 
        { recurso_id: recursoId, status: 'Em andamento' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate(`/curso/${recursoId}`);
    } catch (error) {
      console.error("Erro ao gravar progresso:", error);
      navigate(`/curso/${recursoId}`); // Vai para a página na mesma se der erro
    }
  };
 

  // Ecrã de loading enquanto o Django faz a matemática...
  if (loading || !dados) {
    return (
      <Layout>
        <div style={{ padding: '50px', textAlign: 'center', fontSize: '18px', color: '#6b7280' }}>
          A calcular métricas reais de Segurança... 🔄
        </div>
      </Layout>
    );
  }



  //O `meusCursos = []` é um valor default para evitar erros caso o Django não envie essa parte (ex: se a pessoa não tiver nenhum curso iniciado ou concluído, em vez de dar erro por ser `undefined`, vai ser um array vazio)
  const { kpis, dadosRisco, correcoes, empresas, riscosQuentes, meusCursos = [] } = dados;

  return (
    <Layout>
      <div style={{ padding: '30px', backgroundColor: '#f4f5f7', minHeight: '100vh', margin: '-40px' }}>
        
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Painel de Controlo ISO 27001 🛡️</h1>
            <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Visão analítica de Auditorias, Riscos, Ações Corretivas e Formação.</p>
          </div>
          <button onClick={() => navigate('/auditorias/nova')} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
            + Nova Auditoria
          </button>
        </div>

        
        {/* 1. LINHA DE KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {[
            { cor: '#4f46e5', titulo: 'Conformidade Média', valor: `${kpis.conformidadeMedia}%`, icone: '📈', link: null },
            { cor: '#10b981', titulo: 'Auditorias Ativas', valor: kpis.auditoriasAtivas, icone: '🔍', link: '/auditorias' }, 
            { cor: '#f59e0b', titulo: 'Empresas Registadas', valor: kpis.empresas, icone: '🏢', link: null }, 
            { cor: '#ef4444', titulo: 'Riscos Detetados', valor: kpis.riscosCriticos, icone: '🚨', link: '/riscos' } 
          ].map((k, i) => (
            <div 
              key={i} 
              onClick={() => k.link ? navigate(k.link) : null}
              style={{ 
                backgroundColor: k.cor, color: 'white', padding: '20px', borderRadius: '12px', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                cursor: k.link ? 'pointer' : 'default', 
                transition: 'transform 0.2s' 
              }}
              onMouseEnter={(e) => { if(k.link) e.currentTarget.style.transform = 'translateY(-5px)' }}
              onMouseLeave={(e) => { if(k.link) e.currentTarget.style.transform = 'none' }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '32px' }}>{k.valor}</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>{k.titulo}</p>
              </div>
              <div style={{ fontSize: '35px', opacity: 0.8 }}>{k.icone}</div>
            </div>
          ))}
        </div>

        {/* 2. ZONA DE GRÁFICOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          {/* GRÁFICO 1: Donut Chart de Risco */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#374151' }}>Distribuição de Risco Global</h3>
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%',
                background: `conic-gradient(#ef4444 0% ${dadosRisco.alto}%, #f59e0b ${dadosRisco.alto}% ${dadosRisco.alto + dadosRisco.medio}%, #10b981 ${dadosRisco.alto + dadosRisco.medio}% 100%)`
              }}></div>
              <div style={{ position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>100%</span>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>Auditado</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontSize: '12px', fontWeight: 'bold' }}>
              <span style={{ color: '#ef4444' }}>● Alto ({dadosRisco.alto}%)</span>
              <span style={{ color: '#f59e0b' }}>● Médio ({dadosRisco.medio}%)</span>
              <span style={{ color: '#10b981' }}>● Baixo ({dadosRisco.baixo}%)</span>
            </div>
          </div>

          {/* GRÁFICO 2: Barra de Ações Corretivas */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '15px', color: '#374151', textAlign: 'center' }}>Progresso de Ações Corretivas</h3>
            <div style={{ position: 'relative', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginTop: '40px' }}>
              <div style={{ width: `${correcoes.concluidas}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px 0 0 4px', display: 'flex', alignItems: 'center', paddingLeft: '10px', color: 'white', fontWeight: 'bold' }}>
                {correcoes.concluidas}% Concluído
              </div>
              <div style={{ position: 'absolute', top: '-15px', left: `${correcoes.meta}%`, height: '70px', width: '2px', backgroundColor: '#ef4444' }}></div>
              <span style={{ position: 'absolute', top: '-35px', left: `calc(${correcoes.meta}% - 20px)`, fontWeight: 'bold', fontSize: '14px' }}>Meta ({correcoes.meta}%)</span>
            </div>
            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#6b7280' }}>*Ações originadas por Não Conformidades.</p>
          </div>

          {/* TABELA TOP RISCOS */}
          <div style={{ backgroundColor: 'white', padding: '0', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#1e3a8a', padding: '15px', color: 'white', textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Top Entradas de Risco (Auditoria)</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Área Avaliada</th>
                  <th style={{ padding: '10px' }}>Rating Risco</th>
                  <th style={{ padding: '10px' }}>Empresa</th>
                </tr>
              </thead>
              <tbody>
                {riscosQuentes.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                      Nenhum risco encontrado! Parabéns 🎉
                    </td>
                  </tr>
                ) : (
                  riscosQuentes.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#374151' }}>{r.area}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ backgroundColor: r.nivel === 'Alto' ? '#ef4444' : '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', width: '100%', display: 'inline-block', textAlign: 'center' }}>
                          {r.nivel}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#6b7280' }}>{r.empresa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. AS EMPRESAS AUDITADAS */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px' }}>Auditorias em Curso</h3>
          {empresas.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Não tens empresas auditadas ainda.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {empresas.map(emp => (
                <div key={emp.id} style={{ backgroundColor: 'white', borderRadius: '8px', borderLeft: `6px solid ${getScoreColor(emp.score)}`, padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#111827' }}>{emp.nome}</h4>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Última: {emp.ultimaAuditoria}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: getScoreColor(emp.score) }}>{emp.score}%</span>
                    <button onClick={() => navigate(`/auditoria/${emp.id}`)} style={{ border: 'none', background: 'none', color: '#4f46e5', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }}>Continuar ➔</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*4. A NOVA SECÇÃO: A MINHA FORMAÇÃO */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>A Minha Formação</h3>
            <button 
              onClick={() => navigate('/perfil')} // Ou o caminho para os cursos completos
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Ver Perfil / Histórico ➔
            </button>
          </div>

          {meusCursos.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px dashed #d1d5db', textAlign: 'center' }}>
              <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>Ainda não tens módulos de formação ativos.</p>
              <button onClick={() => navigate('/biblioteca')} style={{ backgroundColor: '#111827', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Explorar Biblioteca
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {meusCursos.map((curso) => (
                <div key={curso.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111827' }}>{curso.titulo}</h4>
                    <span style={{ 
                      backgroundColor: curso.status === 'Concluído' ? '#ecfdf5' : '#eff6ff', 
                      color: curso.status === 'Concluído' ? '#10b981' : '#3b82f6', 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' 
                    }}>
                      {curso.status === 'Concluído' ? '✅ Concluído' : '▶ Em Andamento'}
                    </span>
                  </div>
                  <div>
                    <button 
                      onClick={() => aoClicarNoCurso(curso.id)}
                      style={{
                        backgroundColor: curso.status === 'Concluído' ? '#f3f4f6' : '#4f46e5',
                             color: curso.status === 'Concluído' ? '#374151' : 'white',
                              border: curso.status === 'Concluído' ? '1px solid #d1d5db' : 'none',
                                padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
  }}
                    >
                      {curso.status === 'Concluído' ? 'Rever' : 'Continuar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;