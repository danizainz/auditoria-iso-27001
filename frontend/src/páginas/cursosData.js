export const baseDeCursos = {
  
  // 🏠 MÓDULO: SEGURANÇA NO TELETRABALHO (ID 3 no MySQL)
  "curso_teletrabalho": {
    id_bd: 3, 
    id: "curso_teletrabalho",
    titulo: "Segurança no Teletrabalho",
    descricao: "Boas práticas para proteger a empresa em trabalho remoto.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    slides: [
      {
        id: 1,
        pergunta: "Ligações Seguras em Público",
        texto: "Quando trabalhas num café com Wi-Fi público, o tráfego pode ser intercetado. Deves sempre ligar a [Espaço 1] da empresa para criar um túnel encriptado, e garantir que os sites usam [Espaço 2].",
        opcoes: ["Firewall", "VPN", "HTTP", "HTTPS", "Bluetooth"],
        respostasCertas: { "[Espaço 1]": "VPN", "[Espaço 2]": "HTTPS" },
        explicacao: "A VPN (Virtual Private Network) cria um túnel seguro e o HTTPS garante que os dados entre o teu PC e o site estão cifrados.",
        explicacoesErro: {
          "Firewall": "A Firewall bloqueia acessos não autorizados ao teu PC, mas não protege os dados enquanto eles viajam pelo Wi-Fi público.",
          "HTTP": "O protocolo HTTP envia dados em texto limpo. Qualquer pessoa na rede pode ler a tua password ou documentos.",
          "Bluetooth": "O Bluetooth serve para ligar periféricos (ratos/fones) e não tem qualquer função na proteção da rede de internet."
        }
      },
      {
        id: 2,
        pergunta: "Proteção de Ecrã e Espaço Físico",
        texto: "Para evitar o 'Shoulder Surfing' (olhares indiscretos), deves utilizar um [Espaço 1] no teu monitor. Além disso, ao abandonar o posto, deves sempre efetuar o [Espaço 2] (Win + L).",
        opcoes: ["Antivírus", "Filtro de Privacidade", "Bloqueio de Ecrã", "Post-it"],
        respostasCertas: { "[Espaço 1]": "Filtro de Privacidade", "[Espaço 2]": "Bloqueio de Ecrã" },
        explicacao: "Manter o perímetro físico seguro é tão importante como a segurança digital. O bloqueio impede que estranhos mexam no teu PC.",
        explicacoesErro: {
          "Antivírus": "O Antivírus protege contra software malicioso, mas não impede que alguém leia o que está escrito no teu monitor físico.",
          "Post-it": "Deixar post-its com passwords ou informações na mesa é uma das maiores falhas de segurança física num escritório."
        }
      }
    ]
  },

  // 🎣 MÓDULO: TREINO DE PHISHING (ID 2 no MySQL)
  "curso_phishing": {
    id_bd: 2, 
    id: "curso_phishing",
    titulo: "Treino de Phishing",
    descricao: "Identificação de ataques de engenharia social por email e SMS.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
    slides: [
      {
        id: 1,
        pergunta: "Anatomia de um Ataque",
        texto: "O Phishing é um ataque de [Espaço 1] que utiliza o sentido de [Espaço 2] para forçar o utilizador a clicar em links ou descarregar ficheiros.",
        opcoes: ["Criptografia", "Engenharia Social", "Urgência", "Segurança", "Backup"],
        respostasCertas: { "[Espaço 1]": "Engenharia Social", "[Espaço 2]": "Urgência" },
        explicacao: "Os atacantes manipulam psicologicamente as vítimas através da Engenharia Social, criando pânico ou pressa.",
        explicacoesErro: {
          "Criptografia": "A Criptografia serve para proteger dados, enquanto o Phishing serve para os roubar enganando pessoas.",
          "Segurança": "Um email de phishing tenta parecer seguro, mas o objetivo do ataque é precisamente quebrar a tua proteção.",
          "Backup": "O Backup é uma cópia de segurança. Embora ajude na recuperação, não é o método usado num ataque de phishing."
        }
      },
      {
        id: 2,
        pergunta: "Verificação de Remetentes",
        texto: "Antes de clicar num link, deves passar o rato por cima para ver o [Espaço 1] real. Se o email pedir para confirmares a tua [Espaço 2], desconfia imediatamente.",
        opcoes: ["URL", "Anexo", "Password", "Assinatura"],
        respostasCertas: { "[Espaço 1]": "URL", "[Espaço 2]": "Password" },
        explicacao: "As empresas legítimas nunca pedem passwords por email. Verificar o link (URL) revela para onde o site te quer levar na realidade.",
        explicacoesErro: {
          "Anexo": "Passar o rato por cima de um anexo pode não revelar nada; o perigo real está no URL do link de download.",
          "Assinatura": "Muitos atacantes copiam assinaturas perfeitas de empresas reais para parecerem credíveis."
        }
      }
    ]
  },

  // 📖 MÓDULO: FUNDAMENTOS DO SGSI (ISO 27001) (ID 1 no MySQL)
  "curso_sgsi": {
    id_bd: 1, 
    id: "curso_sgsi",
    titulo: "Fundamentos do SGSI",
    descricao: "O Sistema de Gestão de Segurança da Informação segundo a ISO 27001.",
    videoUrl: "https://www.youtube.com/watch?v=i6vP_x53EAg",
    slides: [
      {
        id: 1,
        pergunta: "A Tríade CIA",
        texto: "A ISO 27001 foca-se na Tríade CIA. Garantir que os dados não são alterados sem autorização refere-se à [Espaço 1]. Já garantir que os dados estão acessíveis quando necessários refere-se à [Espaço 2].",
        opcoes: ["Confidencialidade", "Integridade", "Disponibilidade", "Eficiência"],
        respostasCertas: { "[Espaço 1]": "Integridade", "[Espaço 2]": "Disponibilidade" },
        explicacao: "A Integridade protege contra modificações e a Disponibilidade garante que o sistema não está 'em baixo'.",
        explicacoesErro: {
          "Confidencialidade": "A Confidencialidade garante que estranhos não veem os dados, mas o conceito de 'não alteração' é da Integridade.",
          "Eficiência": "A Eficiência é boa para o negócio, mas não é um dos três pilares fundamentais da segurança da informação (Tríade CIA)."
        }
      },
      {
        id: 2,
        pergunta: "Implementação de Controlos",
        texto: "A segurança da informação não é apenas técnica. Um SGSI baseia-se em [Espaço 1], processos e [Espaço 2].",
        opcoes: ["Pessoas", "Software", "Políticas", "Hardware"],
        respostasCertas: { "[Espaço 1]": "Políticas", "[Espaço 2]": "Pessoas" },
        explicacao: "Sem regras claras (Políticas) e pessoas formadas, a tecnologia sozinha não consegue proteger a organização.",
        explicacoesErro: {
          "Software": "O software é apenas uma ferramenta. Um SGSI foca-se na gestão e na estratégia organizacional acima de tudo.",
          "Hardware": "Comprar servidores caros (Hardware) não serve de nada se os processos de gestão forem fracos."
        }
      }
    ]
  }
};