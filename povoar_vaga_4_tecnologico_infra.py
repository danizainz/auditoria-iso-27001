import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# COMPLEMENTO DE AUDITORIA: TEMA A.8 (TECNOLÓGICO - PARTE 1/2)
# =================================================================
vaga_4_data = {
    "A.8.1": [
        ("Todos os dispositivos finais (portáteis/telemóveis) têm encriptação de disco ativa e MDM instalado?", "Crítico"),
        ("Existe prova de que dispositivos perdidos ou roubados podem ser apagados remotamente?", "Alto")
    ],
    "A.8.2": [
        ("A atribuição de direitos de 'Administrador' é revista trimestralmente e limitada ao estritamente necessário?", "Crítico"),
        ("Os administradores de sistemas utilizam contas dedicadas (não usam a conta pessoal para tarefas de admin)?", "Alto")
    ],
    "A.8.3": [
        ("O acesso a pastas e ficheiros críticos é gerido por grupos de segurança baseados na função (Role-Based Access)?", "Médio")
    ],
    "A.8.4": [
        ("O acesso aos repositórios de código-fonte (Git, SVN) está protegido por MFA e é restrito a programadores ativos?", "Alto")
    ],
    "A.8.5": [
        ("A Autenticação Multi-Fator (MFA) é obrigatória para TODOS os acessos externos e contas administrativas?", "Crítico"),
        ("A política de passwords exige complexidade mínima e bloqueio de conta após tentativas falhadas?", "Alto")
    ],
    "A.8.6": [
        ("A empresa monitoriza a capacidade dos sistemas (disco, CPU, RAM) para evitar interrupções de serviço?", "Baixo")
    ],
    "A.8.7": [
        ("Existe software de proteção contra malware (EDR/Antivírus) instalado e atualizado em 100% dos sistemas?", "Crítico")
    ],
    "A.8.8": [
        ("Existe um relatório de 'Vulnerability Scanning' que comprove a ausência de falhas críticas não corrigidas?", "Crítico"),
        ("As atualizações de segurança de 'Dia Zero' são aplicadas num prazo máximo de 48 horas?", "Alto")
    ],
    "A.8.9": [
        ("Existem 'Hardening Guides' (guias de configuração segura) aplicados aos servidores e firewalls?", "Médio")
    ],
    "A.8.10": [
        ("Existe prova de que a informação é eliminada de forma segura quando o tempo de retenção termina?", "Baixo")
    ],
    "A.8.11": [
        ("Dados sensíveis de clientes são mascarados ou anonimizados em relatórios ou ambientes não produtivos?", "Alto")
    ],
    "A.8.12": [
        ("Existem ferramentas de prevenção de perda de dados (DLP) para bloquear o envio de segredos comerciais?", "Alto")
    ],
    "A.8.13": [
        ("Os backups são testados através de restauros completos pelo menos uma vez por semestre?", "Crítico"),
        ("Consegues provar que os backups estão protegidos contra Ransomware (ex: Air-gap ou imutabilidade)?", "Crítico")
    ],
    "A.8.14": [
        ("Os sistemas críticos possuem redundância (High Availability) para garantir que o serviço não para?", "Alto")
    ],
    "A.8.15": [
        ("Os logs de auditoria registam atividades de privilégio, erros e acessos a dados sensíveis?", "Médio"),
        ("Os logs estão protegidos contra alteração e são armazenados num servidor centralizado?", "Alto")
    ],
    "A.8.16": [
        ("Existe um sistema de monitorização que gera alertas automáticos em caso de comportamento anómalo na rede?", "Médio")
    ],
    "A.8.17": [
        ("Todos os servidores e equipamentos de rede têm o relógio sincronizado via protocolo NTP?", "Baixo")
    ]
}

def povoar_vaga_4():
    print("🚀 A iniciar a Vaga 4: Domínio A.8 (Tecnológico - Infraestrutura)...")
    total = 0
    for ref, lista in vaga_4_data.items():
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
                    print(f"✅ [{risco}] {ref}: Adicionada.")
        except Questao.DoesNotExist:
            print(f"⚠️ Controlo {ref} não encontrado.")

    print(f"\n✨ Vaga 4 concluída! Adicionaste {total} perguntas técnicas de infraestrutura.")

if __name__ == "__main__":
    povoar_vaga_4()