import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# Estrutura: "Ref": [("Pergunta", "Nível de Risco")]
data_final = {
    # --- A.5 ORGANIZACIONAL (Faltavam vários) ---
    "A.5.2": [("As responsabilidades de segurança estão definidas nos contratos de trabalho?", "Médio")],
    "A.5.3": [("Existe separação de funções para evitar que uma pessoa sozinha comprometa o sistema (ex: quem cria não aprova)?", "Alto")],
    "A.5.7": [("A empresa recebe e analisa alertas de ameaças externas (Threat Intelligence)?", "Baixo")],
    "A.5.10": [("Existe uma política de uso aceitável assinada pelos utilizadores?", "Médio")],
    "A.5.12": [("A informação está classificada (ex: Confidencial, Público)?", "Alto")],
    "A.5.31": [("A empresa identifica e documenta todos os requisitos legais (ex: RGPD)?", "Crítico")],
    "A.5.37": [("Existem manuais de procedimentos para as tarefas críticas de IT?", "Médio")],

    # --- A.6 PESSOAS (Completar o que falta) ---
    "A.6.2": [("Os contratos incluem cláusulas de confidencialidade (NDA)?", "Alto")],
    "A.6.4": [("Existe um processo disciplinar para quem viola as regras de segurança?", "Baixo")],
    "A.6.7": [("Existem regras de segurança específicas para quem trabalha em casa (VPN, Wi-Fi seguro)?", "Alto")],

    # --- A.7 FÍSICO (Reforçar a segurança local) ---
    "A.7.2": [("As entradas físicas são controladas por registo eletrónico ou humano?", "Médio")],
    "A.7.5": [("Existem sistemas de deteção/extinção de incêndio nas salas críticas?", "Crítico")],
    "A.7.10": [("Discos e pens USB antigos são destruídos fisicamente antes de irem para o lixo?", "Alto")],
    "A.7.14": [("Equipamentos que saem da empresa para reparação têm os dados apagados?", "Alto")],

    # --- A.8 TECNOLÓGICO (Onde o risco costuma ser maior) ---
    "A.8.3": [("O acesso a dados sensíveis é restringido com base no cargo do utilizador?", "Crítico")],
    "A.8.4": [("O acesso ao código-fonte das aplicações é restrito e monitorizado?", "Alto")],
    "A.8.9": [("As configurações de segurança dos servidores são revistas para evitar vulnerabilidades de fábrica?", "Alto")],
    "A.8.11": [("Dados pessoais são mascarados ou anonimizados em ambientes de teste?", "Médio")],
    "A.8.12": [("Existe software (DLP) para evitar que dados saiam da empresa por email ou USB?", "Alto")],
    "A.8.15": [("Os logs de sistema (quem fez o quê) são guardados por pelo menos 6 meses?", "Médio")],
    "A.8.20": [("A rede da empresa está protegida por Firewalls e IPS?", "Crítico")],
    "A.8.22": [("A rede Wi-Fi de convidados é totalmente separada da rede interna?", "Alto")],
    "A.8.24": [("A criptografia é usada para proteger dados em repouso e em trânsito?", "Crítico")],
    "A.8.31": [("Os ambientes de Teste e Produção são totalmente isolados?", "Alto")],
    "A.8.32": [("Qualquer alteração em sistemas críticos passa por um processo de aprovação?", "Médio")],
}

print("🚀 A iniciar o povoamento inteligente com níveis de risco...")

total = 0
for ref, perguntas in data_final.items():
    try:
        controlo_obj = Questao.objects.get(referencia_controlo=ref)
        for texto, nivel in perguntas:
            pergunta, created = PerguntaAuditoria.objects.get_or_create(
                controlo=controlo_obj,
                texto_pergunta=texto,
                defaults={'nivel_risco_sugerido': nivel}
            )
            if created:
                total += 1
                print(f"✅ [{ref}] Adicionada: {texto[:30]}... ({nivel})")
    except Questao.DoesNotExist:
        print(f"⚠️ Controlo {ref} não encontrado. Saltei.")

print(f"\n✨ Feito! Injetaste {total} perguntas inteligentes.")
print("Agora vai ao Dashboard e vê se as cores do gráfico de rosca já mudaram!")