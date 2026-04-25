import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# PATCH DE CORREÇÃO: PREENCHER OS CONTROLOS VAZIOS A.5 e A.6
# =================================================================
correcao_data = {
    # --- A.5 CONTROLOS ORGANIZACIONAIS ---
    "A.5.3": [
        ("Existe segregação de funções em processos críticos (ex: quem desenvolve não passa para produção; quem aprova não executa)?", "Alto")
    ],
    "A.5.10": [
        ("Existe uma Política de Uso Aceitável (AUP) dos equipamentos assinada e compreendida por todos os colaboradores?", "Médio")
    ],
    "A.5.14": [
        ("As transferências de ficheiros confidenciais para o exterior da empresa são feitas através de canais encriptados e aprovados?", "Alto")
    ],
    "A.5.18": [
        ("Os direitos de acesso dos utilizadores a sistemas e dados críticos são revistos periodicamente (ex: semestralmente)?", "Alto")
    ],
    "A.5.20": [
        ("Os contratos com fornecedores críticos de TI incluem cláusulas rigorosas de segurança, SLAs e proteção de dados (RGPD)?", "Alto")
    ],
    "A.5.26": [
        ("Consegues provar que os incidentes passados foram respondidos e documentados conforme o procedimento oficial?", "Alto")
    ],
    "A.5.29": [
        ("Existe um Plano de Continuidade de Negócio (BCP) formalizado para garantir que a empresa sobrevive a um desastre grave?", "Crítico")
    ],

    # --- A.6 CONTROLOS DE PESSOAS ---
    "A.6.1": [
        ("É feita uma verificação de antecedentes (background check, referências) adequada ao nível de risco antes de cada contratação?", "Médio")
    ],
    "A.6.5": [
        ("Os colaboradores que rescindem contrato são lembrados formalmente de que os Acordos de Confidencialidade (NDA) continuam válidos?", "Médio")
    ]
}

def aplicar_patch():
    print("🛠️ A aplicar o Patch de Correção nos controlos vazios...")
    total = 0
    for ref, lista in correcao_data.items():
        try:
            controlo = Questao.objects.get(referencia_controlo=ref)
            for texto, risco in lista:
                obj, created = PerguntaAuditoria.objects.get_or_create(
                    controlo=controlo,
                    texto_pergunta=texto,
                    defaults={'nivel_risco_sugerido': risco}
                )
                if created:
                    total += 1
                    print(f"✅ [{risco}] {ref}: Adicionada com sucesso!")
                else:
                    print(f"ℹ️ {ref}: Já existia, foi ignorada.")
        except Questao.DoesNotExist:
            print(f"⚠️ Controlo {ref} não encontrado na base de dados.")

    print(f"\n✨ Patch aplicado! Foram injetadas {total} perguntas nos controlos em falta.")

if __name__ == "__main__":
    aplicar_patch()