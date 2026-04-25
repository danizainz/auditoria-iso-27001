import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# COMPLEMENTO DE AUDITORIA: TEMA A.5 (ORGANIZACIONAL) & A.6 (PESSOAS)
# =================================================================
vaga_2_data = {
    # --- A.5 CONTROLOS ORGANIZACIONAIS (O que faltava) ---
    "A.5.2": [("Estão atribuídas e documentadas as funções e responsabilidades de segurança?", "Médio")],
    "A.5.4": [("A gestão de topo participa em reuniões de revisão de segurança (ex: Comité de Segurança)?", "Médio")],
    "A.5.5": [("Existe uma lista de contactos de autoridades (Polícia, CNPD, CERT) para reporte de incidentes?", "Baixo")],
    "A.5.6": [("A organização participa em grupos ou fóruns de partilha de ameaças cibernéticas?", "Baixo")],
    "A.5.7": [("A empresa recebe e analisa inteligência sobre ameaças (Threat Intel) para prevenir ataques?", "Médio")],
    "A.5.8": [("A segurança da informação é integrada na gestão de todos os projetos da empresa?", "Médio")],
    "A.5.11": [("Há um processo formal para a devolução de ativos (PC, telemóvel) quando o funcionário sai?", "Médio")],
    "A.5.12": [("A informação está classificada (ex: Confidencial, Interno, Público) conforme o seu valor?", "Alto")],
    "A.5.13": [("A informação classificada está devidamente rotulada (labels) nos documentos e e-mails?", "Médio")],
    "A.5.16": [("É gerido o ciclo de vida completo das identidades digitais (criação, alteração e remoção)?", "Alto")],
    "A.5.17": [("Os utilizadores assinam um termo de responsabilidade sobre o uso de senhas e autenticação?", "Alto")],
    "A.5.19": [("Existem requisitos de segurança definidos e comunicados para todos os fornecedores?", "Médio")],
    "A.5.21": [("A empresa avalia a segurança dos fornecedores de hardware e software (Supply Chain)?", "Médio")],
    "A.5.22": [("Os serviços prestados por fornecedores críticos são monitorizados e auditados regularmente?", "Médio")],
    "A.5.23": [("Estão definidos controlos de segurança para o uso de serviços Cloud (AWS, Azure, SaaS)?", "Alto")],
    "A.5.25": [("Existe um processo para avaliar se um evento de segurança deve ser classificado como Incidente?", "Médio")],
    "A.5.27": [("São realizadas reuniões de 'Post-Mortem' após incidentes para aprender e melhorar?", "Médio")],
    "A.5.28": [("Existem procedimentos para a recolha e preservação de provas digitais (forense)?", "Alto")],
    "A.5.30": [("A infraestrutura de TI é testada para garantir que aguenta uma interrupção de negócio?", "Crítico")],
    "A.5.32": [("A empresa controla as licenças de software e respeita os direitos de propriedade intelectual?", "Médio")],
    "A.5.33": [("Os registos/documentos estão protegidos contra destruição e têm tempo de retenção definido?", "Médio")],
    "A.5.35": [("A segurança da organização é revista de forma independente (Auditoria Interna/Externa)?", "Médio")],
    "A.5.36": [("Os gestores verificam regularmente se as suas equipas cumprem as regras de segurança?", "Médio")],
    "A.5.37": [("Existem manuais de procedimentos documentados para as operações diárias de TI?", "Médio")],

    # --- A.6 CONTROLOS DE PESSOAS (O que faltava) ---
    "A.6.2": [("As responsabilidades de segurança constam nos contratos de trabalho dos colaboradores?", "Alto")],
    "A.6.4": [("Existe um processo disciplinar formal para violações de segurança da informação?", "Baixo")],
    "A.6.6": [("Todos os colaboradores e prestadores de serviços assinaram acordos de confidencialidade (NDA)?", "Alto")],
    "A.6.8": [("Existe um canal fácil e rápido para os funcionários reportarem eventos suspeitos?", "Alto")],
}

def povoar_vaga_2():
    print("🚀 A iniciar a Vaga 2: Completar A.5 e A.6...")
    total = 0
    for ref, lista in vaga_2_data.items():
        try:
            controlo = Questao.objects.get(referencia_controlo=ref)
            for texto, risco in lista:
                # O get_or_create garante que não duplicamos se correres o script 2 vezes
                obj, created = PerguntaAuditoria.objects.get_or_create(
                    controlo=controlo,
                    texto_pergunta=texto,
                    defaults={'nivel_risco_sugerido': risco}
                )
                if created:
                    total += 1
                    print(f"✅ [{risco}] {ref}: Adicionada.")
        except Questao.DoesNotExist:
            print(f"⚠️ Controlo {ref} não encontrado. Verifica se importaste os 93 primeiro.")

    print(f"\n✨ Vaga 2 concluída! Adicionaste {total} novas perguntas profissionais.")

if __name__ == "__main__":
    povoar_vaga_2()