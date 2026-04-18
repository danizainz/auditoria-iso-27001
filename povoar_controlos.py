import os
import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao

# A LISTA COMPLETA DOS 93 CONTROLOS (ISO 27001:2022)
controlos = [
    # --- A.5 Controlos Organizacionais (37 Controlos) ---
    {"ref": "A.5.1", "tema": "Organizacional", "desc": "Políticas de segurança da informação."},
    {"ref": "A.5.2", "tema": "Organizacional", "desc": "Funções e responsabilidades de segurança da informação."},
    {"ref": "A.5.3", "tema": "Organizacional", "desc": "Separação de funções (Segregation of duties)."},
    {"ref": "A.5.4", "tema": "Organizacional", "desc": "Responsabilidades da gestão (Management responsibilities)."},
    {"ref": "A.5.5", "tema": "Organizacional", "desc": "Contacto com autoridades."},
    {"ref": "A.5.6", "tema": "Organizacional", "desc": "Contacto com grupos de interesse especial."},
    {"ref": "A.5.7", "tema": "Organizacional", "desc": "Inteligência sobre ameaças (Threat intelligence)."},
    {"ref": "A.5.8", "tema": "Organizacional", "desc": "Segurança da informação na gestão de projetos."},
    {"ref": "A.5.9", "tema": "Organizacional", "desc": "Inventário de informações e outros ativos associados."},
    {"ref": "A.5.10", "tema": "Organizacional", "desc": "Uso aceitável de informações e outros ativos."},
    {"ref": "A.5.11", "tema": "Organizacional", "desc": "Devolução de ativos."},
    {"ref": "A.5.12", "tema": "Organizacional", "desc": "Classificação da informação."},
    {"ref": "A.5.13", "tema": "Organizacional", "desc": "Rotulagem da informação."},
    {"ref": "A.5.14", "tema": "Organizacional", "desc": "Transferência de informação."},
    {"ref": "A.5.15", "tema": "Organizacional", "desc": "Controlo de acessos."},
    {"ref": "A.5.16", "tema": "Organizacional", "desc": "Gestão de identidade."},
    {"ref": "A.5.17", "tema": "Organizacional", "desc": "Informação de autenticação."},
    {"ref": "A.5.18", "tema": "Organizacional", "desc": "Direitos de acesso."},
    {"ref": "A.5.19", "tema": "Organizacional", "desc": "Segurança da informação nas relações com fornecedores."},
    {"ref": "A.5.20", "tema": "Organizacional", "desc": "Tratamento da segurança da informação em acordos com fornecedores."},
    {"ref": "A.5.21", "tema": "Organizacional", "desc": "Gestão da segurança da informação na cadeia de fornecimento de TIC."},
    {"ref": "A.5.22", "tema": "Organizacional", "desc": "Monitorização, análise e avaliação de serviços de fornecedores."},
    {"ref": "A.5.23", "tema": "Organizacional", "desc": "Segurança da informação no uso de serviços na cloud."},
    {"ref": "A.5.24", "tema": "Organizacional", "desc": "Planeamento e preparação da gestão de incidentes de segurança."},
    {"ref": "A.5.25", "tema": "Organizacional", "desc": "Avaliação e decisão sobre eventos de segurança da informação."},
    {"ref": "A.5.26", "tema": "Organizacional", "desc": "Resposta a incidentes de segurança da informação."},
    {"ref": "A.5.27", "tema": "Organizacional", "desc": "Aprender com incidentes de segurança da informação."},
    {"ref": "A.5.28", "tema": "Organizacional", "desc": "Recolha de evidências (Provas forenses)."},
    {"ref": "A.5.29", "tema": "Organizacional", "desc": "Segurança da informação durante disrupções (Continuidade de negócio)."},
    {"ref": "A.5.30", "tema": "Organizacional", "desc": "Prontidão das TIC para a continuidade do negócio."},
    {"ref": "A.5.31", "tema": "Organizacional", "desc": "Requisitos legais, estatutários, regulamentares e contratuais."},
    {"ref": "A.5.32", "tema": "Organizacional", "desc": "Direitos de propriedade intelectual (DPI)."},
    {"ref": "A.5.33", "tema": "Organizacional", "desc": "Proteção de registos (Records protection)."},
    {"ref": "A.5.34", "tema": "Organizacional", "desc": "Privacidade e proteção de dados pessoais (PII)."},
    {"ref": "A.5.35", "tema": "Organizacional", "desc": "Revisão independente da segurança da informação."},
    {"ref": "A.5.36", "tema": "Organizacional", "desc": "Conformidade com políticas, regras e normas de segurança."},
    {"ref": "A.5.37", "tema": "Organizacional", "desc": "Procedimentos operacionais documentados."},

    # --- A.6 Controlos de Pessoas (8 Controlos) ---
    {"ref": "A.6.1", "tema": "Pessoas", "desc": "Verificação de antecedentes (Screening)."},
    {"ref": "A.6.2", "tema": "Pessoas", "desc": "Termos e condições de emprego."},
    {"ref": "A.6.3", "tema": "Pessoas", "desc": "Consciencialização, educação e treino em segurança da informação."},
    {"ref": "A.6.4", "tema": "Pessoas", "desc": "Processo disciplinar."},
    {"ref": "A.6.5", "tema": "Pessoas", "desc": "Responsabilidades após rescisão ou alteração de emprego."},
    {"ref": "A.6.6", "tema": "Pessoas", "desc": "Acordos de confidencialidade ou não divulgação (NDA)."},
    {"ref": "A.6.7", "tema": "Pessoas", "desc": "Trabalho remoto (Teletrabalho)."},
    {"ref": "A.6.8", "tema": "Pessoas", "desc": "Notificação de eventos de segurança da informação."},

    # --- A.7 Controlos Físicos (14 Controlos) ---
    {"ref": "A.7.1", "tema": "Físico", "desc": "Perímetros de segurança física."},
    {"ref": "A.7.2", "tema": "Físico", "desc": "Controlos de entrada física."},
    {"ref": "A.7.3", "tema": "Físico", "desc": "Segurança de escritórios, salas e instalações."},
    {"ref": "A.7.4", "tema": "Físico", "desc": "Monitorização de segurança física."},
    {"ref": "A.7.5", "tema": "Físico", "desc": "Proteção contra ameaças físicas e ambientais."},
    {"ref": "A.7.6", "tema": "Físico", "desc": "Trabalho em áreas seguras."},
    {"ref": "A.7.7", "tema": "Físico", "desc": "Secretária limpa e ecrã limpo."},
    {"ref": "A.7.8", "tema": "Físico", "desc": "Localização e proteção de equipamentos."},
    {"ref": "A.7.9", "tema": "Físico", "desc": "Segurança de ativos fora das instalações."},
    {"ref": "A.7.10", "tema": "Físico", "desc": "Meios de armazenamento (Storage media)."},
    {"ref": "A.7.11", "tema": "Físico", "desc": "Utilitários de suporte (energia, climatização)."},
    {"ref": "A.7.12", "tema": "Físico", "desc": "Segurança de cablagem."},
    {"ref": "A.7.13", "tema": "Físico", "desc": "Manutenção de equipamentos."},
    {"ref": "A.7.14", "tema": "Físico", "desc": "Eliminação segura ou reutilização de equipamentos."},

    # --- A.8 Controlos Tecnológicos (34 Controlos) ---
    {"ref": "A.8.1", "tema": "Tecnológico", "desc": "Dispositivos de utilizador final (User endpoint devices)."},
    {"ref": "A.8.2", "tema": "Tecnológico", "desc": "Direitos de acesso privilegiado."},
    {"ref": "A.8.3", "tema": "Tecnológico", "desc": "Restrição de acesso à informação."},
    {"ref": "A.8.4", "tema": "Tecnológico", "desc": "Acesso ao código-fonte."},
    {"ref": "A.8.5", "tema": "Tecnológico", "desc": "Autenticação segura."},
    {"ref": "A.8.6", "tema": "Tecnológico", "desc": "Gestão de capacidade."},
    {"ref": "A.8.7", "tema": "Tecnológico", "desc": "Proteção contra malware."},
    {"ref": "A.8.8", "tema": "Tecnológico", "desc": "Gestão de vulnerabilidades técnicas."},
    {"ref": "A.8.9", "tema": "Tecnológico", "desc": "Gestão de configurações."},
    {"ref": "A.8.10", "tema": "Tecnológico", "desc": "Eliminação de informações."},
    {"ref": "A.8.11", "tema": "Tecnológico", "desc": "Mascaramento de dados (Data masking)."},
    {"ref": "A.8.12", "tema": "Tecnológico", "desc": "Prevenção de vazamento de dados (DLP)."},
    {"ref": "A.8.13", "tema": "Tecnológico", "desc": "Cópias de segurança de informações (Backups)."},
    {"ref": "A.8.14", "tema": "Tecnológico", "desc": "Redundância de instalações de processamento de informação."},
    {"ref": "A.8.15", "tema": "Tecnológico", "desc": "Registo de eventos (Logging)."},
    {"ref": "A.8.16", "tema": "Tecnológico", "desc": "Atividades de monitorização."},
    {"ref": "A.8.17", "tema": "Tecnológico", "desc": "Sincronização de relógios."},
    {"ref": "A.8.18", "tema": "Tecnológico", "desc": "Uso de programas utilitários privilegiados."},
    {"ref": "A.8.19", "tema": "Tecnológico", "desc": "Instalação de software em sistemas operacionais."},
    {"ref": "A.8.20", "tema": "Tecnológico", "desc": "Segurança de redes."},
    {"ref": "A.8.21", "tema": "Tecnológico", "desc": "Segurança dos serviços de rede."},
    {"ref": "A.8.22", "tema": "Tecnológico", "desc": "Separação de redes."},
    {"ref": "A.8.23", "tema": "Tecnológico", "desc": "Filtro web (Web filtering)."},
    {"ref": "A.8.24", "tema": "Tecnológico", "desc": "Uso de criptografia."},
    {"ref": "A.8.25", "tema": "Tecnológico", "desc": "Ciclo de vida de desenvolvimento seguro."},
    {"ref": "A.8.26", "tema": "Tecnológico", "desc": "Requisitos de segurança da aplicação."},
    {"ref": "A.8.27", "tema": "Tecnológico", "desc": "Princípios de arquitetura e engenharia de sistemas seguros."},
    {"ref": "A.8.28", "tema": "Tecnológico", "desc": "Codificação segura (Secure coding)."},
    {"ref": "A.8.29", "tema": "Tecnológico", "desc": "Testes de segurança em desenvolvimento e aceitação."},
    {"ref": "A.8.30", "tema": "Tecnológico", "desc": "Desenvolvimento externalizado (Outsourced development)."},
    {"ref": "A.8.31", "tema": "Tecnológico", "desc": "Separação de ambientes de desenvolvimento, teste e produção."},
    {"ref": "A.8.32", "tema": "Tecnológico", "desc": "Gestão de mudanças (Change management)."},
    {"ref": "A.8.33", "tema": "Tecnológico", "desc": "Informação de teste (Test information)."},
    {"ref": "A.8.34", "tema": "Tecnológico", "desc": "Proteção de sistemas de informação durante testes de auditoria."}
]

print("⏳ A iniciar a importação dos 93 controlos ISO 27001:2022...")

for c in controlos:
    obj, created = Questao.objects.get_or_create(
        referencia_controlo=c["ref"],
        defaults={
            'dominio_iso': c["tema"],
            'descricao': c["desc"]
        }
    )
    if created:
        print(f"✅ Adicionado: {c['ref']} - {c['tema']}")
    else:
        print(f"⚠️ Já existia: {c['ref']}")

print("🎉 Importação dos 93 controlos concluída com sucesso!")