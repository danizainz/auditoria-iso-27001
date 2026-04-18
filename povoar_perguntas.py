import os
import django

# Aponta para as tuas configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =====================================================================
# O MEGA-GUIÃO DE AUDITORIA ISO 27001:2022 (NÍVEL PROFISSIONAL)
# Aplicando a regra: 1. Existe Política? 2. É praticado? 3. Há provas?
# =====================================================================

perguntas_data = {
    # 🏢 TEMA A.5: CONTROLOS ORGANIZACIONAIS
    "A.5.1": [
        "Existe um documento formal e global de Política de Segurança da Informação?",
        "A política foi aprovada formalmente pela Gestão de Topo?",
        "A política foi comunicada e está acessível a todos os colaboradores e fornecedores relevantes?",
        "Existem evidências de que a política é revista regularmente (ex: anualmente) ou quando ocorrem mudanças significativas na empresa?"
    ],
    "A.5.9": [
        "Existe um inventário documentado de todos os ativos de informação (servidores, portáteis, software, bases de dados)?",
        "Cada ativo de informação tem um 'proprietário' (Owner) claramente identificado e responsável por ele?",
        "O inventário é revisto e atualizado periodicamente (ex: quando entram novos equipamentos)?"
    ],
    "A.5.15": [
        "Existe um procedimento documentado para a criação, alteração e remoção de acessos lógicos (sistemas) e físicos?",
        "A atribuição de acessos segue estritamente o princípio do 'menor privilégio' e da 'necessidade de saber'?",
        "Existem registos/evidências de que os acessos de ex-colaboradores são revogados imediatamente (no próprio dia) após a saída?",
        "É feita uma revisão periódica (ex: semestral) de todos os direitos de acesso dos utilizadores aos sistemas críticos?"
    ],
    "A.5.20": [
        "Existe um processo para avaliar os riscos de segurança da informação dos fornecedores antes da contratação?",
        "Os contratos com fornecedores incluem cláusulas de segurança (SLAs, RGPD, direito a auditar)?",
        "A organização monitoriza regularmente se os fornecedores estão a cumprir as regras de segurança acordadas?"
    ],
    "A.5.24": [
        "Existe um Plano de Resposta a Incidentes de Segurança da Informação formalmente documentado?",
        "Os colaboradores sabem exatamente a quem e como reportar um incidente (ex: email específico, linha telefónica)?",
        "Existem registos (logs/tickets) de incidentes passados e das lições aprendidas (post-mortem) para evitar recorrência?"
    ],

    # 👥 TEMA A.6: CONTROLOS DE PESSOAS
    "A.6.1": [
        "Existe uma política de verificação de antecedentes (background checks) para novas contratações?",
        "As verificações são proporcionais ao risco da função (ex: acesso a dados financeiros exige verificação mais rigorosa)?",
        "Há evidências de que as verificações são feitas ANTES do colaborador ter acesso aos sistemas da empresa?"
    ],
    "A.6.3": [
        "Existe um programa anual e documentado de consciencialização em segurança (Security Awareness)?",
        "O programa inclui temas práticos e atuais como Phishing, Engenharia Social e Gestão de Passwords?",
        "A organização mantém registos/certificados que provam que TODOS os colaboradores concluíram a formação?"
    ],
    "A.6.5": [
        "Os termos de confidencialidade (NDA) mantêm-se válidos legalmente mesmo após o colaborador sair da empresa?",
        "Existe uma checklist de saída (Offboarding) que inclua a devolução de equipamentos e lembrete das obrigações de sigilo?"
    ],

    # 🏢 TEMA A.7: CONTROLOS FÍSICOS
    "A.7.1": [
        "As instalações físicas (escritórios) possuem perímetros de segurança claramente definidos (ex: portas trancadas, receção)?",
        "O acesso às instalações obriga ao uso de cartões de identificação (badges) visíveis para todos os colaboradores?",
        "Existe um registo obrigatório (logbook ou sistema eletrónico) para a entrada e saída de visitantes?"
    ],
    "A.7.4": [
        "A sala de servidores/bastidores está protegida com controlo de acesso reforçado (ex: biometria ou cartão único)?",
        "Existe um registo automático de quem entra e sai das áreas de processamento seguro?",
        "As áreas seguras estão livres de sinalização externa que indique o que está lá dentro (para não atrair atenções)?"
    ],
    "A.7.7": [
        "Existe uma política formal de 'Secretária Limpa' e 'Ecrã Limpo' comunicada aos colaboradores?",
        "Os ecrãs de todos os computadores bloqueiam automaticamente (sem intervenção humana) após um máximo de 5 a 10 minutos de inatividade?",
        "Durante as auditorias físicas, há evidências de que não ficam documentos confidenciais (papel) ou passwords em post-its nas secretárias?"
    ],

    # 💻 TEMA A.8: CONTROLOS TECNOLÓGICOS
    "A.8.1": [
        "Existe uma política documentada para o uso de equipamentos de utilizador final (BYOD ou frota da empresa)?",
        "Os discos de TODOS os computadores portáteis estão protegidos por encriptação forte (ex: BitLocker, FileVault)?",
        "Os dispositivos móveis (smartphones/tablets) da empresa são geridos por um sistema centralizado (MDM)?",
        "A equipa de TI tem capacidade de fazer a limpeza remota (Remote Wipe) de um dispositivo em caso de roubo ou perda?"
    ],
    "A.8.2": [
        "A utilização de contas de Administrador (Privileged Accounts) é restrita a pessoal estritamente necessário?",
        "Os administradores usam contas normais para o dia-a-dia e só usam as contas 'Admin' quando estritamente necessário?",
        "Existe um registo (log) inalterável de todas as ações tomadas pelas contas com privilégios de sistema?"
    ],
    "A.8.5": [
        "A Autenticação Multi-Fator (MFA) é OBRIGATÓRIA para todas as contas de e-mail da organização?",
        "A MFA está implementada para todos os acessos remotos à rede da empresa (ex: VPN)?",
        "A MFA está exigida para acesso a plataformas Cloud críticas (ex: AWS, Azure, ERP, CRM)?"
    ],
    "A.8.7": [
        "Existe um software Endpoint Detection and Response (EDR) ou Antivírus de nova geração instalado em todas as máquinas?",
        "O software de proteção é atualizado de forma centralizada, automática e não pode ser desativado pelo utilizador normal?",
        "O sistema gera alertas imediatos para a equipa de TI caso detete malware ou ficheiros suspeitos?"
    ],
    "A.8.8": [
        "Existe um processo formal (Patch Management) para aplicar atualizações de segurança nos sistemas operativos e software?",
        "As atualizações críticas de segurança (Critical Patches) são instaladas num prazo máximo de 14 a 30 dias após lançamento?",
        "Existem relatórios ou scans de vulnerabilidades que comprovem que os sistemas estão atualizados?"
    ],
    "A.8.13": [
        "Existe uma política de cópias de segurança (Backups) que defina a frequência e a retenção dos dados?",
        "Os backups são guardados num local fisicamente ou logicamente separado da rede principal (Offline/Imutáveis para evitar Ransomware)?",
        "A organização realiza e documenta testes de restauro (Restore Tests) pelo menos anualmente para garantir que funcionam?"
    ]
}

print("⏳ A preparar o MEGA-GUIÃO de Auditoria. A gravar as perguntas de nível SaaS...")

perguntas_criadas = 0

for ref_controlo, lista_perguntas in perguntas_data.items():
    try:
        controlo_obj = Questao.objects.get(referencia_controlo=ref_controlo)
        
        for texto in lista_perguntas:
            pergunta, created = PerguntaAuditoria.objects.get_or_create(
                controlo=controlo_obj,
                texto_pergunta=texto
            )
            if created:
                perguntas_criadas += 1
                print(f"✅ Sub-pergunta de Auditoria gerada para o {ref_controlo}")

    except Questao.DoesNotExist:
        print(f"⚠️ AVISO: Controlo {ref_controlo} não encontrado na base de dados.")

print(f"\n🎉 SUCESSO ABSOLUTO! Foram injetadas {perguntas_criadas} novas perguntas de escrutínio.")
print("A tua plataforma acabou de ganhar um 'Cérebro' de Auditor Certificado! 🧠💻")