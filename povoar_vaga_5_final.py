import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# COMPLEMENTO DE AUDITORIA: TEMA A.8 (TECNOLÓGICO - PARTE 2/2)
# =================================================================
vaga_5_data = {
    "A.8.18": [("O uso de programas utilitários que possam contornar controlos de segurança é restrito e monitorizado?", "Alto")],
    "A.8.19": [("Existem regras que impedem os utilizadores comuns de instalar software não autorizado nos computadores?", "Médio")],
    "A.8.20": [("As redes são protegidas por Firewalls e Sistemas de Deteção de Intrusão (IDS/IPS)?", "Crítico")],
    "A.8.21": [("Os níveis de serviço e segurança dos fornecedores de rede (ISP) são revistos anualmente?", "Médio")],
    "A.8.22": [("A rede interna está segregada em domínios de segurança (ex: VLANs separadas para RH, TI e Convidados)?", "Alto")],
    "A.8.23": [("Existe filtragem de acesso à web para bloquear sites maliciosos ou de alto risco?", "Médio")],
    "A.8.24": [("É utilizada criptografia forte para proteger informações confidenciais em trânsito e em repouso?", "Crítico")],
    "A.8.25": [("Existem regras de desenvolvimento seguro (Secure Development Lifecycle) estabelecidas e seguidas?", "Alto")],
    "A.8.26": [("Os requisitos de segurança da informação são definidos antes do início do desenvolvimento de novas aplicações?", "Médio")],
    "A.8.27": [("Os princípios de engenharia de sistemas seguros são documentados e aplicados em todos os novos projetos?", "Médio")],
    "A.8.28": [("Os programadores utilizam técnicas de codificação segura (ex: OWASP) para evitar vulnerabilidades como SQL Injection?", "Alto")],
    "A.8.29": [("São realizados testes de segurança (Vulnerability Assessment/PenTest) antes de qualquer aplicação ir para Produção?", "Alto")],
    "A.8.30": [("O desenvolvimento de software externalizado (outsource) é monitorizado para garantir que cumpre as normas de segurança?", "Médio")],
    "A.8.31": [("Os ambientes de Desenvolvimento, Teste e Produção estão logicamente e fisicamente separados?", "Alto"),
               ("Consegues provar que dados reais de clientes não são usados em ambiente de teste sem máscara?", "Alto")],
    "A.8.32": [("Qualquer alteração em sistemas críticos segue um processo formal de Gestão de Mudanças (Change Management)?", "Alto")],
    "A.8.33": [("A informação utilizada para testes é selecionada, protegida e controlada para evitar fugas de dados?", "Médio")],
    "A.8.34": [("As auditorias aos sistemas vivos são planeadas para minimizar o risco de interrupção dos processos de negócio?", "Médio")]
}

def povoar_vaga_5():
    print("🚀 A iniciar a Vaga 5: O fecho do Domínio A.8 (Redes e Desenvolvimento)...")
    total = 0
    for ref, lista in vaga_5_data.items():
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

    print(f"\n✨ Vaga 5 concluída! Adicionaste {total} perguntas técnicas finais.")
    print("---")
    print("🏆 PARABÉNS! O teu software agora cobre os 93 controlos da ISO 27001:2022.")

if __name__ == "__main__":
    povoar_vaga_5()