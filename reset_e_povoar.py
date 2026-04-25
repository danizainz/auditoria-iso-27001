import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# O GUIÃO DE OURO ISO 27001:2022 (Focado em Evidência e Risco)
# =================================================================
guiao_final = {
    # --- A.5 CONTROLOS ORGANIZACIONAIS ---
    "A.5.1": [
        ("Existe uma Política de Segurança da Informação aprovada pela Gerência e comunicada a todos?", "Alto"),
        ("Há evidências de que a política é revista após incidentes graves ou mudanças na infraestrutura?", "Médio")
    ],
    "A.5.9": [
        ("O inventário de ativos identifica claramente a criticidade de cada sistema (ex: Baixo, Médio, Crítico)?", "Médio"),
        ("Consegues mostrar a lista de hardware/software e quem é o responsável (Owner) por cada um?", "Alto")
    ],
    "A.5.15": [
        ("Existe um registo formal de aprovação para a criação de novas contas de utilizador?", "Alto"),
        ("Consegues provar que as contas de utilizadores que saíram da empresa foram desativadas em menos de 24h?", "Crítico")
    ],
    "A.5.24": [
        ("Existe um registo centralizado de todos os incidentes de segurança detetados?", "Alto"),
        ("Há provas de que os incidentes foram analisados para evitar que se repitam (Lições Aprendidas)?", "Médio")
    ],
    "A.5.31": [
        ("A empresa mantém um registo atualizado das obrigações legais (RGPD, Contratos, Leis do Setor)?", "Crítico")
    ],
    "A.5.34": [
        ("Os dados pessoais (PII) são identificados e protegidos de acordo com o RGPD?", "Crítico")
    ],

    # --- A.6 CONTROLOS DE PESSOAS ---
    "A.6.3": [
        ("Consegues mostrar os certificados ou registos de presença da última formação de segurança?", "Alto"),
        ("É realizado algum teste de Phishing simulado para medir a consciencialização?", "Médio")
    ],
    "A.6.7": [
        ("Os equipamentos usados em teletrabalho têm as mesmas proteções que os do escritório?", "Alto")
    ],

    # --- A.7 CONTROLOS FÍSICOS ---
    "A.7.4": [
        ("O acesso às áreas críticas (Data Center/Bastidor) é restrito e gera um log de entradas?", "Crítico")
    ],
    "A.7.7": [
        ("Foi feita uma ronda física e não foram encontradas passwords em post-its ou documentos confidenciais expostos?", "Baixo")
    ],

    # --- A.8 CONTROLOS TECNOLÓGICOS (O Coração da ISO) ---
    "A.8.1": [
        ("A encriptação de disco (BitLocker/FileVault) está ativa em 100% dos portáteis da empresa?", "Crítico"),
        ("Existe prova de que os dispositivos móveis podem ser bloqueados remotamente (MDM)?", "Alto")
    ],
    "A.8.5": [
        ("O MFA (Segundo fator) está ativo em TODAS as contas com acesso a dados de clientes ou e-mail?", "Crítico")
    ],
    "A.8.8": [
        ("Consegues mostrar um relatório de vulnerabilidades ou prova de que os patches de segurança estão em dia?", "Crítico")
    ],
    "A.8.11": [
        ("Os dados de produção (clientes reais) são usados em ambientes de teste sem serem mascarados?", "Alto")
    ],
    "A.8.12": [
        ("Existe um bloqueio técnico que impede a saída de dados sensíveis para clouds pessoais ou USB?", "Alto")
    ],
    "A.8.13": [
        ("Os Backups são imutáveis (não podem ser apagados por ransomware) e estão fora da rede principal?", "Crítico"),
        ("Consegues mostrar o relatório do último teste de restauro de dados com sucesso?", "Crítico")
    ],
    "A.8.15": [
        ("Os logs de auditoria (quem acedeu a quê) estão protegidos contra alteração ou eliminação?", "Alto")
    ],
    "A.8.20": [
        ("Existe segregação de redes (VLANs) para isolar sistemas críticos de áreas de convidados/Wi-Fi?", "Alto")
    ],
    "A.8.31": [
        ("Consegues provar que os programadores não têm permissões de escrita diretamente no ambiente de Produção?", "Alto")
    ]
}

def reset_e_povoar_v3():
    print("🧹 [1/3] A limpar perguntas e respostas antigas...")
    PerguntaAuditoria.objects.all().delete()
    
    print("🚀 [2/3] A injetar o Guião de Elite Hardcoded...")
    criadas = 0
    for ref, lista in guiao_final.items():
        try:
            controlo = Questao.objects.get(referencia_controlo=ref)
            for texto, risco in lista:
                PerguntaAuditoria.objects.create(
                    controlo=controlo,
                    texto_pergunta=texto,
                    nivel_risco_sugerido=risco
                )
                criadas += 1
                print(f"✅ [{risco}] {ref}: {texto[:50]}...")
        except Questao.DoesNotExist:
            print(f"⚠️ Controlo {ref} não existe na BD. Verifica o script de controlos.")

    print(f"\n🎉 [3/3] SUCESSO! Tens {criadas} perguntas de alta precisão prontas.")

if __name__ == "__main__":
    reset_e_povoar_v3()