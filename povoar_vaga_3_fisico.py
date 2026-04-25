import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auditoria_iso.settings')
django.setup()

from core.models import Questao, PerguntaAuditoria

# =================================================================
# COMPLEMENTO DE AUDITORIA: TEMA A.7 (CONTROLOS FÍSICOS)
# =================================================================
vaga_3_data = {
    "A.7.1": [
        ("Os perímetros de segurança (paredes, portões, receção) são adequados para proteger áreas com informação sensível?", "Médio"),
        ("As áreas de carga e descarga são controladas e isoladas do acesso interno aos escritórios?", "Baixo")
    ],
    "A.7.2": [
        ("O acesso às instalações é controlado por sistemas eletrónicos (cartões) ou humanos (segurança/receção)?", "Médio"),
        ("Existe um registo de entradas/saídas de visitantes e estes são acompanhados por um funcionário?", "Baixo")
    ],
    "A.7.3": [
        ("As salas e escritórios onde se processa informação crítica permanecem trancados fora do horário de expediente?", "Médio")
    ],
    "A.7.4": [
        ("Existe um sistema de monitorização (CCTV ou Alarmes) ativo 24/7 nas áreas críticas?", "Médio"),
        ("Consegues provar que os registos de acesso físico são revistos periodicamente?", "Médio")
    ],
    "A.7.5": [
        ("As áreas onde estão os servidores possuem sistemas de deteção e extinção de incêndio (ex: Gás FM200)?", "Crítico"),
        ("Existem proteções contra inundações ou fugas de água perto de equipamentos críticos?", "Crítico")
    ],
    "A.7.6": [
        ("Existem regras que proíbem o uso de câmaras ou telemóveis dentro de áreas de processamento seguro?", "Baixo")
    ],
    "A.7.7": [
        ("Existe evidência de que os ecrãs bloqueiam automaticamente após inatividade?", "Médio"),
        ("Foi realizada uma ronda física e não se encontraram documentos sensíveis ou passwords em post-its expostos?", "Baixo")
    ],
    "A.7.8": [
        ("Os ecrãs de trabalho e terminais estão posicionados de forma a evitar que pessoas não autorizadas os visualizem?", "Baixo")
    ],
    "A.7.9": [
        ("Existem regras e encriptação para equipamentos que saem das instalações (ex: portáteis em casa)?", "Alto")
    ],
    "A.7.10": [
        ("Os suportes de armazenamento (Pens, Discos Externos) estão guardados em armários trancados e têm inventário?", "Alto"),
        ("Consegues provar que os suportes de dados que saem para transporte estão encriptados?", "Alto")
    ],
    "A.7.11": [
        ("A sala de servidores possui sistemas de energia ininterrupta (UPS) e estes são testados anualmente?", "Alto")
    ],
    "A.7.12": [
        ("As cablagens de rede e energia estão protegidas contra danos físicos ou interceção (ex: calhas fechadas)?", "Médio")
    ],
    "A.7.13": [
        ("Existe um registo de manutenção dos equipamentos de segurança (UPS, AC, Extintores)?", "Médio")
    ],
    "A.7.14": [
        ("Existe um procedimento de destruição física ou limpeza lógica certificada para discos e equipamentos obsoletos?", "Alto"),
        ("Consegues mostrar um certificado de destruição de dados de um descarte recente?", "Médio")
    ]
}

def povoar_vaga_3():
    print("🚀 A iniciar a Vaga 3: Domínio A.7 (Físico)...")
    total = 0
    for ref, lista in vaga_3_data.items():
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

    print(f"\n✨ Vaga 3 concluída! Adicionaste {total} perguntas de segurança física.")

if __name__ == "__main__":
    povoar_vaga_3()