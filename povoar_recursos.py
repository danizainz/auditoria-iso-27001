import os
import django

# Aponta para as tuas configurações
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import RecursoEducativo

# lista VIP de recursos educativos reais
recursos = [
    # VÍDEOS (Vão funcionar imediatamente com os links reais)
    {
        "titulo": "O que é um SGSI? (Fundamentos ISO 27001)",
        "tipo": "Vídeo",
        "desc": "Vídeo curto a explicar os 6 pilares de um Sistema de Gestão de Segurança da Informação.",
        "icone": "-",
        "link": "https://www.youtube.com/watch?v=384lQn9Xqs0"
    },
    {
        "titulo": "Treino de Phishing: Como não ser enganado",
        "tipo": "Vídeo",
        "desc": "Formação essencial de consciencialização para todos os colaboradores da empresa.",
        "icone": "-",
        "link": "https://www.youtube.com/watch?v=Y7zNlEMDmI4" # Link educativo genérico de phishing
    },
    {
        "titulo": "Segurança no Teletrabalho e Redes Wi-Fi",
        "tipo": "Vídeo",
        "desc": "Boas práticas para proteger a informação da empresa quando trabalhas a partir de casa ou cafés.",
        "icone": "-",
        "link": "https://www.youtube.com/watch?v=8OEE_BwQc-M"
    },

    # DOCUMENTOS PRINCIPAIS (Políticas)
    {
        "titulo": "Política de Segurança da Informação",
        "tipo": "Documento",
        "desc": "O documento central ('Pai') que dita as regras e objetivos de segurança de toda a organização.",
        "icone": "-",
        "link": ""
    },
    {
        "titulo": "Política de Controlo de Acessos",
        "tipo": "Documento",
        "desc": "Regras obrigatórias para a criação de senhas fortes, MFA e gestão de privilégios de utilizadores.",
        "icone": "-",
        "link": ""
    },
    {
        "titulo": "Política de Secretária Limpa e Ecrã Bloqueado",
        "tipo": "Documento",
        "desc": "Normas físicas para evitar exposição de documentos confidenciais no escritório.",
        "icone": "-",
        "link": ""
    },

    # TEMPLATES (Folhas de Excel / Ferramentas)
    {
        "titulo": "Declaração de Aplicabilidade (SoA)",
        "tipo": "Template",
        "desc": "Folha de cálculo com os 93 controlos do Anexo A para definir o que se aplica à tua empresa.",
        "icone": "-",
        "link": ""
    },
    {
        "titulo": "Inventário de Ativos de Informação",
        "tipo": "Template",
        "desc": "Modelo para registar todos os servidores, portáteis, software e dados sensíveis da organização.",
        "icone": "-",
        "link": ""
    },
    {
        "titulo": "Registo de Incidentes de Segurança",
        "tipo": "Template",
        "desc": "Formulário padrão para reportar quebras de segurança, perda de equipamentos ou ataques cibernéticos.",
        "icone": "-",
        "link": ""
    }
]

print("⏳ A preparar a estante da Biblioteca...")

for r in recursos:
    obj, created = RecursoEducativo.objects.get_or_create(
        titulo=r["titulo"],
        defaults={
            'tipo': r["tipo"],
            'descricao': r["desc"],
            'icone': r["icone"],
            'link_video': r["link"]
        }
    )
    if created:
        print(f"✅ Adicionado: {r['icone']} {r['titulo']}")
    else:
        print(f"⚠️ Já existia: {r['titulo']}")

print("📚 Biblioteca recheada com sucesso! Podes verificar na API.")