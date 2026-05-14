# 🛡️ Portal de Auditoria ISO 27001

> Uma plataforma web robusta para a gestão automatizada de auditorias de cibersegurança, em conformidade com a norma **ISO/IEC 27001:2022**.

🔗 **Links do Projeto:**
- [📄 Ler o Relatório Técnico (PDF)](./Projeto_2_a22209980.pdf)
- [🎥 Ver Vídeo de Apresentação (YouTube)](https://www.youtube.com/playlist?list=PLINeKvdsJRYsJ7nAsQ6T9NbA8P2iELODE)

Este projeto utiliza uma arquitetura desacoplada (Decoupled Architecture), focada em **Privacy by Design**, conformidade estrita com o **RGPD**, e análise prescritiva suportada por **IA**.

---

## ✨ Funcionalidades Principais

### 🔒 Segurança e Privacidade (RGPD)
- **Autenticação Multi-Fator (2FA):** Camada extra de segurança via *Google Authenticator* (TOTP integrado com PyOTP).
- **Direito ao Esquecimento (Art. 17º RGPD):** Eliminação total e irreversível de dados pessoais e registos em cascata.
- **Direito à Portabilidade (Art. 20º RGPD):** Exportação de dados estruturados em formato `.json` legível por máquina.
- **Princípio do Privilégio Mínimo:** Painel Admin blindado contra a visualização/edição de dados sensíveis de utilizadores.
- **Gestão de Sessão Segura:** Implementação de JSON Web Tokens (JWT) com expiração controlada.
- **Defesa Ativa:** Filtros de segurança no upload de evidências para bloqueio de ficheiros maliciosos (.exe, .sql).

### 🧠 Consultor Virtual (IA Gemini)
- **Análise Prescritiva:** Integração com o modelo **Google Gemini 2.5 Flash** para analisar não-conformidades e sugerir planos de ação corretiva em tempo real.

### 📋 Motor de Auditoria e Relatórios
- **Checklist ISO 27001:2022:** Avaliação completa dos controlos do Anexo A.
- **Assinatura Digital:** Captura de assinatura manuscrita diretamente no ecrã (*React-Signature-Canvas*).
- **Geração de PDF (Client-side):** Relatórios gerados instantaneamente com *jsPDF*, incluindo gráficos dinâmicos e resultados da IA.

### 📚 Centro de Formação e Awareness
- **Módulos de E-Learning:** Cursos interativos sobre cibersegurança com quizzes de validação de conhecimentos.
- **Biblioteca de Templates:** Repositório de documentos de apoio (Políticas, Inventários).

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Hosting |
| :--- | :--- | :--- |
| **Frontend** | React.js | **Vercel** |
| **Backend** | Django & REST Framework | **Render** |
| **Base de Dados** | MySQL 8.0 | **Clever Cloud** |
| **IA** | Google Gemini API | Cloud Service |

---

## 🚀 Como Instalar e Correr Localmente

### 1. Configurar o Backend

    # Entrar na pasta do backend
    cd backend

    # Criar ambiente virtual e instalar dependências
    python -m venv venv
    source venv/bin/activate  # No Windows use: venv\Scripts\activate
    pip install -r requirements.txt

    # Configurar Base de Dados e Iniciar
    python manage.py migrate
    python manage.py runserver

### 2. Configurar o Frontend

    # Entrar na pasta do frontend
    cd frontend

    # Instalar e Iniciar
    npm install
    npm start

### 3. Variáveis de Ambiente (.env)
Cria um ficheiro .env na raiz do backend com as seguintes chaves:
- SECRET_KEY: Chave secreta do Django.
- GEMINI_API_KEY: Chave da API do Google Gemini.
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST: Credenciais do teu MySQL na Clever Cloud.

---

## 👨‍💻 Autor

**Daniel Filipe Ramos de Carvalho (a22209980)**
*Licenciatura em Engenharia Informática*
**Universidade Lusófona - CUP**
*Orientador: Professor Hugo Barbosa*
*Maio de 2026*
