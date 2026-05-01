from dotenv import load_dotenv
load_dotenv()
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import EmailMultiAlternatives
import random

import os
import io
import base64
import json
from google import genai
import openai 
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()




# INICIALIZAÇÃO DAS IAs

CHAVE_GEMINI = os.getenv("GEMINI_API_KEY")


cliente_gemini = genai.Client(api_key=CHAVE_GEMINI) if CHAVE_GEMINI else None


# IMPORTS PARA O LOGIN JWT
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Perfil 

# MODELOS
from .models import (
    TipoUtilizador, Organizacao, AuditoriaEstado, 
    Questao, PerguntaAuditoria, Auditoria, Resposta, Relatorio, RecursoEducativo
)
from .serializers import (
    TipoUtilizadorSerializer, OrganizacaoSerializer, AuditoriaEstadoSerializer,
    QuestaoSerializer, AuditoriaSerializer, RespostaSerializer,
    RelatorioSerializer, RecursoEducativoSerializer,
    LoginComEmailSerializer
)

# ==========================================
# VIEWSETS DO DRF (Criam CRUD automático)
# ==========================================

class OrganizacaoViewSet(viewsets.ModelViewSet):
    queryset = Organizacao.objects.all()
    serializer_class = OrganizacaoSerializer

class QuestaoViewSet(viewsets.ModelViewSet):
    queryset = Questao.objects.all()
    serializer_class = QuestaoSerializer

class AuditoriaViewSet(viewsets.ModelViewSet):
    queryset = Auditoria.objects.all()
    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Auditoria.objects.filter(utilizador=self.request.user)

    def perform_create(self, serializer):
        serializer.save(utilizador=self.request.user)
class RespostaViewSet(viewsets.ModelViewSet):
    queryset = Resposta.objects.all()
    serializer_class = RespostaSerializer

class TipoUtilizadorViewSet(viewsets.ModelViewSet):
    queryset = TipoUtilizador.objects.all()
    serializer_class = TipoUtilizadorSerializer

class AuditoriaEstadoViewSet(viewsets.ModelViewSet):
    queryset = AuditoriaEstado.objects.all()
    serializer_class = AuditoriaEstadoSerializer

class RelatorioViewSet(viewsets.ModelViewSet):
    queryset = Relatorio.objects.all()
    serializer_class = RelatorioSerializer

class RecursoEducativoViewSet(viewsets.ModelViewSet):
    queryset = RecursoEducativo.objects.all()
    serializer_class = RecursoEducativoSerializer

# ==========================================
# 🧠 FUNÇÃO DA TABELA (A MATEMÁTICA DE COMPLIANCE REAL)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_auditorias_dashboard(request):
    try:
        auditorias = Auditoria.objects.filter(utilizador=request.user).order_by('-data_inicio')
        dados_tabela = []
        
        total_perguntas_bd = PerguntaAuditoria.objects.count()
        
        for aud in auditorias:
            respostas_qs = Resposta.objects.filter(auditoria=aud)
            total_respostas_dadas = respostas_qs.count()
            
            if total_respostas_dadas > 0 and aud.estado.id == 1:
                aud.estado_id = 2
                aud.save() 
            
            total_sim = respostas_qs.filter(resposta='Sim').count()
            total_na = respostas_qs.filter(resposta='NA').count()
            total_aplicavel = total_perguntas_bd - total_na

            score_real = 0
            if total_aplicavel > 0:
                score_real = int((total_sim / total_aplicavel) * 100)

            lista_detalhes = []
            for resp in respostas_qs:
                if resp.pergunta: 
                    link_foto = ""
                    if resp.evidencia:
                        link_foto = request.build_absolute_uri(resp.evidencia.url)

                    lista_detalhes.append({
                        "texto_pergunta": resp.pergunta.texto_pergunta,
                        "resposta": resp.resposta,
                        "evidencia_url": link_foto,
                        "referencia_controlo": resp.pergunta.controlo.referencia_controlo if resp.pergunta and resp.pergunta.controlo else "N/A",
                        "dominio_iso": resp.pergunta.controlo.dominio_iso if resp.pergunta and resp.pergunta.controlo else "Geral",
                        "nivel_risco": resp.pergunta.nivel_risco_sugerido if resp.pergunta else "Alto"
                    })

            dados_tabela.append({
                "id": aud.id,
                "nome_empresa": aud.organizacao.nome if aud.organizacao else "Organização Desconhecida",
                "estado": aud.estado.descricao if aud.estado else "Em Análise",
                "score": score_real, 
                "n_doc": f"AUD-{aud.id:04d}",
                "data_inicio": aud.data_inicio.strftime("%d/%m/%Y") if aud.data_inicio else "-",
                "data_fim": aud.data_fim.strftime("%d/%m/%Y") if aud.data_fim else "Pendente",
                "detalhes": lista_detalhes,
                "auditor_nome": aud.utilizador.get_full_name() or aud.utilizador.username if aud.utilizador else "Auditor",
                "auditor_email": aud.utilizador.email if aud.utilizador else "",
                "assinatura_base64": aud.assinatura_base64
            })
            
        return Response(dados_tabela, status=200)
    except Exception as e:
        print(f"Erro a carregar auditorias: {e}")
        return Response({'erro': 'Erro ao carregar os dados.'}, status=500)

# ==========================================
# LÓGICA DE REGISTO E LOGIN
# ==========================================
@api_view(['POST'])
@permission_classes([AllowAny])
def registar_utilizador(request):
    # PASSO 1: Criar Conta Inativa e Enviar Código
    try:
        nome_completo = request.data.get('nome_completo')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({'erro': 'Este e-mail já está registado.'}, status=400)

        user = User.objects.create_user(
            username=email, 
            email=email,
            password=password,
            first_name=nome_completo,
            is_active=False 
        )
        
        # Gerar código de 6 dígitos
        codigo = str(random.randint(100000, 999999))
        Perfil.objects.create(user=user, codigo_otp=codigo)

        # O Django envia o email 
        send_mail(
            '🔐 O teu código de verificação - Auditoria ISO',
            f'Olá {nome_completo},\n\nO teu código de acesso é: {codigo}\n\nBem-vindo à plataforma!',
            'dani.carvalho2928@gmail.com',
            [email],
            fail_silently=False,
        )

        return Response({'mensagem': 'Código enviado com sucesso!'}, status=201)
    except Exception as e:
        print(e)
        return Response({'erro': 'Erro ao criar conta.'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verificar_otp(request):
    # PASSO 2: Validar o Código e dar a Chave (Token)
    email = request.data.get('email')
    
    
    codigo_recebido = str(request.data.get('codigo')).strip()

    try:
        user = User.objects.get(email=email)
        codigo_real = str(user.perfil.codigo_otp).strip()

        # Vai imprimir isto no terminal
        print(f"🕵️‍♂️ A VERIFICAR: O React enviou '{codigo_recebido}' | A BD tem '{codigo_real}'")

        if codigo_real == codigo_recebido:
            user.is_active = True # Conta Ativada
            user.perfil.codigo_otp = None # Limpa o código por segurança
            user.perfil.save()
            user.save()

            # Gera o Token de Login para ele não ter de pôr a pass outra vez
            refresh = RefreshToken.for_user(user)
            return Response({
                'mensagem': 'Email verificado!',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=200)
        else:
            return Response({'erro': 'Código incorreto.'}, status=400)
            
    except User.DoesNotExist:
        return Response({'erro': 'Utilizador não encontrado.'}, status=404)
    except Exception as e:
        print(f"Erro na verificação: {e}")
        return Response({'erro': 'Erro interno do servidor.'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalizar_perfil(request):
    # PASSO 3: O Perfil Profissional
    objetivo = request.data.get('objetivo')
    empresa = request.data.get('empresa')

    request.user.perfil.objetivo = objetivo
    request.user.perfil.empresa_default = empresa
    request.user.perfil.save()
    
    
    if empresa:
        Organizacao.objects.get_or_create(nome=empresa, defaults={'setor': 'Não Definido'})

    return Response({'mensagem': 'Perfil configurado com sucesso!'}, status=200)

class LoginComEmailView(TokenObtainPairView):
    serializer_class = LoginComEmailSerializer

# ==========================================
# LÓGICA DE RECUPERAÇÃO DE PASSWORD (Signal)
# ==========================================

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    reset_url = f"https://www.auditoria-iso-27001.pt/redefinir-password?token={reset_password_token.key}"
    mensagem_texto = f"Olá, utiliza este link para redefinir a tua password: {reset_url}"
    mensagem_html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2>Recuperação de Password - Auditoria ISO</h2>
            <p>Recebemos um pedido para alterar a tua palavra-passe.</p>
            <p>Clica no botão abaixo para escolher uma nova:</p>
            <a href="{reset_url}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Redefinir Password
            </a>
            <p>Se não pediste isto, podes ignorar este e-mail.</p>
        </div>
    """
    msg = EmailMultiAlternatives(
        "Recuperação de Password - Auditoria ISO",
        mensagem_texto,
        "nao-responder@auditoriaiso.com",
        [reset_password_token.user.email]
    )
    msg.attach_alternative(mensagem_html, "text/html")
    msg.send()

# ==========================================
# 📊 FUNÇÃO DO DASHBOARD REAL (NOVA!)
# ==========================================


from django.db.models import Avg, Count
from .models import Auditoria, Risco, AcaoCorretiva, Organizacao, ProgressoRecurso

from django.db.models import Avg, Count
from .models import Auditoria, Risco, AcaoCorretiva, Organizacao, ProgressoRecurso

# ==========================================
# 📊 FUNÇÃO DO DASHBOARD REAL 
# ==========================================
from .models import PerguntaAuditoria 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_real(request):
    try:
        user = request.user
        
        # 1. DADOS BASE DO UTILIZADOR
        minhas_auditorias = Auditoria.objects.filter(utilizador=user)
        minhas_empresas = Organizacao.objects.filter(auditoria__utilizador=user).distinct()
        total_perguntas_bd = PerguntaAuditoria.objects.count()

        # 2. CALCULAR A CONFORMIDADE MÉDIA
        scores_auditorias = []
        for aud in minhas_auditorias:
            respostas_qs = Resposta.objects.filter(auditoria=aud)
            total_sim = respostas_qs.filter(resposta='Sim').count()
            total_na = respostas_qs.filter(resposta='NA').count()
            total_aplicavel = total_perguntas_bd - total_na
            score_real = 0
            if total_aplicavel > 0:
                score_real = int((total_sim / total_aplicavel) * 100)
            scores_auditorias.append(score_real)

        conf_media = sum(scores_auditorias) / len(scores_auditorias) if scores_auditorias else 0
        auditorias_ativas = minhas_auditorias.filter(estado__descricao='Em curso').count()
        total_empresas = minhas_empresas.count()

        # 3. FILTRAR RISCOS E AÇÕES CORRETIVAS DO UTILIZADOR
        meus_riscos = Risco.objects.filter(organizacao__in=minhas_empresas)
        minhas_acoes = AcaoCorretiva.objects.filter(risco__in=meus_riscos)
        
        # TODOS os riscos que ainda não estão concluídos
        riscos_ativos = meus_riscos.exclude(acoes__status='Concluída')
        total_riscos_ativos = riscos_ativos.count() 

        total_riscos = meus_riscos.count() or 1
        r_critico = (meus_riscos.filter(nivel='Crítico').count() / total_riscos) * 100
        r_alto = (meus_riscos.filter(nivel='Alto').count() / total_riscos) * 100
        r_medio = (meus_riscos.filter(nivel='Médio').count() / total_riscos) * 100
        r_baixo = (meus_riscos.filter(nivel='Baixo').count() / total_riscos) * 100

        total_acoes = minhas_acoes.count() or 1
        concluidas = (minhas_acoes.filter(status='Concluída').count() / total_acoes) * 100

        # 4. LISTA DE EMPRESAS NO DASHBOARD (Com a percentagem correta!)
        lista_empresas = []
        for emp in minhas_empresas[:5]:
            # Pega na auditoria mais recente dessa empresa para mostrar a data e o score real atualizado
            auditoria_recente = minhas_auditorias.filter(organizacao=emp).order_by('-data_inicio').first()
            
            if auditoria_recente:
                data_formatada = auditoria_recente.data_fim.strftime("%d %b %Y") if auditoria_recente.data_fim else "Em curso"
                
                # Calcula o score real desta empresa
                resp_qs = Resposta.objects.filter(auditoria=auditoria_recente)
                t_sim = resp_qs.filter(resposta='Sim').count()
                t_na = resp_qs.filter(resposta='NA').count()
                t_aplica = total_perguntas_bd - t_na
                score_aud = int((t_sim / t_aplica) * 100) if t_aplica > 0 else 0
                id_link = auditoria_recente.id
            else:
                data_formatada = "Sem auditorias"
                score_aud = 0
                id_link = emp.id

            lista_empresas.append({
                "id": id_link,
                "nome": emp.nome,
                "ultimaAuditoria": data_formatada,
                "score": score_aud
            })

        # 5. TOP RISCOS DA TABELA
        top_riscos = []
        
        # Filtra APENAS Críticos e Altos dos riscos que ainda estão ativos
        riscos_graves = riscos_ativos.filter(nivel__in=['Crítico', 'Alto'])
        
        # Ordena: Crítico primeiro (peso 4), depois Alto (peso 3)
        def peso_risco(r):
            if r.nivel == 'Crítico': return 4
            if r.nivel == 'Alto': return 3
            return 0

        riscos_ordenados = sorted(list(riscos_graves), key=peso_risco, reverse=True)

        # Mostra os 5 piores na tabela
        for r in riscos_ordenados[:5]:
            nome_emp = r.organizacao.nome if r.organizacao else "Desconhecida"
            top_riscos.append({
                "area": r.titulo,
                "nivel": r.nivel,
                "empresa": nome_emp
            })

        # 6. FORMAÇÃO
        progressos_qs = ProgressoRecurso.objects.filter(utilizador=user).select_related('recurso')
        meus_cursos = []
        for p in progressos_qs:
            url_id = "curso_phishing"
            if "Teletrabalho" in p.recurso.titulo: url_id = "curso_teletrabalho"
            elif "SGSI" in p.recurso.titulo: url_id = "curso_sgsi"
            
            meus_cursos.append({
                "id_bd": p.recurso.id,
                "id_router": url_id,
                "titulo": p.recurso.titulo,
                "status": p.status
            })

        return Response({
            "kpis": {
                "conformidadeMedia": round(conf_media, 1),
                "auditoriasAtivas": auditorias_ativas,
                "empresas": total_empresas,
                "riscosCriticos": total_riscos_ativos
            },
            "dadosRisco": {"critico": round(r_critico),
                            "alto": round(r_alto), 
                            "medio": round(r_medio), 
                            "baixo": round(r_baixo)},
                            
            "correcoes": {"concluidas": round(concluidas), "meta": 80},
            "empresas": lista_empresas,
            "riscosQuentes": top_riscos,
            "meusCursos": meus_cursos
        }, status=200)

    except Exception as e:
        print(f"🔥 ERRO NO DASHBOARD: {e}")
        return Response({"erro": str(e)}, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ControloISO, RespostaClienteSoA

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def importar_soa_excel(request):
    # 1. Verificar se o ficheiro veio no pedido
    import pandas as pd
    if 'file' not in request.FILES:
        return Response({"erro": "Nenhum ficheiro recebido."}, status=400)

    ficheiro = request.FILES['file']

    try:
        # 2. Ler o Excel (header=2 significa que os títulos estão na linha 3 do Excel)
        df = pd.read_excel(ficheiro, header=2)

        # Limpar linhas que não tenham ID de Controlo (linhas vazias no fundo)
        df = df.dropna(subset=[df.columns[0]])

        controlos_importados = 0

        # 3. Percorrer linha a linha
        for index, row in df.iterrows():
            
            codigo_controlo = str(row.iloc[0]).strip()
            nome_controlo = str(row.iloc[1]).strip()
            
            aplicavel_raw = str(row.iloc[2]).strip().lower()
            aplicavel = aplicavel_raw == 'sim' or aplicavel_raw == 'true'
            
            justificacao = str(row.iloc[3]).strip()
            if justificacao == 'nan': justificacao = ''
            
            estado = str(row.iloc[4]).strip()
            if estado == 'nan' or estado == '': estado = 'Não Iniciado'
            
            evidencia = str(row.iloc[5]).strip()
            if evidencia == 'nan': evidencia = ''

            # 4. Garantir que o Controlo Mestre existe
            controlo_bd, created = ControloISO.objects.get_or_create(
                codigo=codigo_controlo,
                defaults={'nome': nome_controlo}
            )

            # 5. Guardar/Atualizar a resposta deste cliente específico
            RespostaClienteSoA.objects.update_or_create(
                user=request.user,
                controlo=controlo_bd,
                defaults={
                    'aplicavel': aplicavel,
                    'justificacao': justificacao,
                    'estado': estado,
                    'evidencia': evidencia
                }
            )
            controlos_importados += 1

        return Response({
            "mensagem": "SoA importado com sucesso!",
            "total_controlos": controlos_importados
        }, status=200)

    except Exception as e:
        return Response({"erro": f"Falha ao processar o Excel: {str(e)}"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estatisticas_soa(request):
    try:
        # Vai buscar apenas os controlos do utilizador que estão marcados como "Aplicável = Sim"
        respostas = RespostaClienteSoA.objects.filter(user=request.user, aplicavel=True)
        
        total = respostas.count()
        implementados = respostas.filter(estado__icontains='Implementado').count()
        em_curso = respostas.filter(estado__icontains='Em Curso').count()
        
        # Os que faltam (Não iniciados ou em branco)
        nao_iniciados = total - (implementados + em_curso)

        # Evitar divisão por zero se o cliente ainda não tiver dados
        progresso = int((implementados / total) * 100) if total > 0 else 0

        return Response({
            'total_aplicavel': total,
            'implementados': implementados,
            'em_curso': em_curso,
            'nao_iniciados': nao_iniciados,
            'progresso': progresso
        }, status=200)

    except Exception as e:
        return Response({'erro': str(e)}, status=500)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def concluir_curso(request):
    try:
        curso_id = request.data.get('curso_id')
        
        
        
        return Response({'mensagem': 'Formação registada com sucesso!'}, status=200)

    except Exception as e:
        return Response({'erro': str(e)}, status=500)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# core/views.py
from .models import ProgressoRecurso, RecursoEducativo

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dados_perfil(request):
    try:
        user = request.user
        perfil = getattr(user, 'perfil', None)
        
        from .models import ProgressoRecurso
        progressos_qs = ProgressoRecurso.objects.filter(utilizador=user).select_related('recurso')
        meus_cursos = []
        for p in progressos_qs:
            meus_cursos.append({
                "id": p.recurso.id,
                "modulo": p.recurso.titulo,
                "data": p.data_interacao.strftime("%d %b %Y"),
                "status": p.status
            })

        nome_completo = user.get_full_name() or user.username
        partes = nome_completo.split()
        iniciais = (partes[0][0] + partes[-1][0]).upper() if len(partes) >= 2 else nome_completo[:2].upper()

        dados = {
            "nome": nome_completo,
            "iniciais": iniciais,
            "email": user.email,
            "empresa": perfil.empresa_default if perfil else "Nenhuma",
            "data_entrada": user.date_joined.strftime("%d/%m/%Y"),
            "id_utilizador": f"USR-{user.id:04d}",
            
            "telemovel": perfil.telemovel if perfil else "",
            "dois_fatores_ativo": perfil.dois_fatores_ativo if perfil else False,
            "idsuporte": perfil.id_suporte if perfil and hasattr(perfil, 'id_suporte') else "SUP-7821",
            "password": "••••••••", 
            
            
            "modulos_concluidos": progressos_qs.filter(status='Concluído').count(),
            "meus_cursos": meus_cursos
        }
        return Response(dados, status=200)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atualizar_seguranca(request):
    try:
        # Pega no perfil da pessoa que está logada
        perfil = request.user.perfil
        
        # Atualiza os dados com o que veio do React (se vier, senão mantém o que já tinha)
        perfil.telemovel = request.data.get('telemovel', perfil.telemovel)
        perfil.dois_fatores_ativo = request.data.get('dois_fatores_ativo', perfil.dois_fatores_ativo)
        perfil.save()
        
        return Response({'mensagem': 'Segurança atualizada com sucesso!'}, status=200)
    except Exception as e:
        return Response({'erro': str(e)}, status=500)

import pyotp
import qrcode
import base64
from io import BytesIO
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# GERA O QR CODE E ENVIA PARA O REACT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gerar_qr_code_2fa(request):
    try:
        perfil = request.user.perfil
        
        # Se ele ainda não tem um segredo, criamos um agora
        if not perfil.totp_secret:
            perfil.totp_secret = pyotp.random_base32()
            perfil.save()

        # O pyotp gera a URI que o Google Authenticator entende, com o email do utilizador e o nome da aplicação
        totp = pyotp.TOTP(perfil.totp_secret)
        uri = totp.provisioning_uri(name=request.user.email, issuer_name="Auditoria ISO 27001")

        # Desenhar a Imagem do QR Code
        img = qrcode.make(uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        
        # Converter a imagem para Base64 para o React a conseguir ler diretamente
        qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return Response({"qr_code": f"data:image/png;base64,{qr_base64}"}, status=200)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

# VERIFICA SE OS 6 DÍGITOS ESTÃO CERTOS E ATIVA O 2FA
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_ativacao_2fa(request):
    try:
        codigo_recebido = request.data.get('codigo')
        perfil = request.user.perfil

        if not perfil.totp_secret:
            return Response({"erro": "Gera um QR Code primeiro."}, status=400)

        # O Django verifica a matemática: "Será que este código é válido neste exato minuto?"
        totp = pyotp.TOTP(perfil.totp_secret)
        
        if totp.verify(codigo_recebido):
            perfil.dois_fatores_ativo = True
            perfil.save()
            return Response({"mensagem": "2FA Ativado com Sucesso!"}, status=200)
        else:
            return Response({"erro": "Código incorreto ou expirado."}, status=400)
            
    except Exception as e:
        return Response({"erro": str(e)}, status=500)



@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def login_step_1(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    
    # 1. Tenta autenticar o utilizador
    user = authenticate(username=email, password=password)
    
    if user is not None:
        # 2. Verifica se tem 2FA ativo
        perfil = getattr(user, 'perfil', None)
        is_2fa_active = perfil.dois_fatores_ativo if perfil else False
        
        if is_2fa_active:
            # BLOQUEIA e pede o código
            return Response({"requer_2fa": True, "email": email}, status=200)
        
        # 3. Sem 2FA? Entrega os tokens e entra direto
        refresh = RefreshToken.for_user(user)
        return Response({
            "requer_2fa": False,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "nome": user.first_name or user.username
        }, status=200)
    
    return Response({"erro": "Email ou password incorretos."}, status=401)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_step_2_verify(request):
    email = request.data.get('email', '').strip()
    codigo = request.data.get('codigo', '').strip()
    
    try:
        user = User.objects.get(email=email)
        # O pyotp usa o segredo no perfil para validar
        totp = pyotp.TOTP(user.perfil.totp_secret)
        
        if totp.verify(codigo):
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "nome": user.first_name or user.username
            }, status=200)
        
        return Response({"erro": "Código incorreto."}, status=400)
    except Exception:
        return Response({"erro": "Erro na verificação."}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def alterar_password_2fa(request):
    user = request.user
    pass_atual = request.data.get('password_atual')
    nova_pass = request.data.get('nova_password')
    codigo_otp = request.data.get('codigo_otp')

    # 1. Verificar se a password atual está certa
    if not user.check_password(pass_atual):
        return Response({"erro": "A password atual está incorreta."}, status=400)

    # 2. Se o 2FA estiver ativo, verificar o código do telemóvel
    if user.perfil.dois_fatores_ativo:
        if not codigo_otp:
            return Response({"erro": "Código 2FA obrigatório."}, status=400)
        
        totp = pyotp.TOTP(user.perfil.totp_secret)
        if not totp.verify(codigo_otp):
            return Response({"erro": "Código 2FA inválido ou expirado."}, status=400)

    # 3. Se passou nos testes, mudar a password
    user.set_password(nova_pass)
    user.save()
    
    return Response({"mensagem": "Password alterada com sucesso!"}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def solicitar_alteracao_email(request):
    user = request.user
    novo_email = request.data.get('novo_email').strip()

    # 1. Verificar se o email já está em uso por outro utilizador
    if User.objects.filter(email=novo_email).exclude(id=user.id).exists():
        return Response({'erro': 'Este e-mail já está em uso.'}, status=400)

    # 2. Gerar código e guardar no perfil
    codigo = str(random.randint(100000, 999999))
    perfil = user.perfil
    perfil.codigo_otp = codigo
    # Se não tiver o campo 'email_pendente', podemos passar o email no corpo da verificação depois
    perfil.save()

    # 3. Enviar o email real de verificação
    send_mail(
        '📧 Confirmação de Novo Email - Auditoria ISO',
        f'Olá {user.first_name},\n\nO teu código para confirmar o novo email é: {codigo}',
        'teu-email@gmail.com',
        [novo_email],
        fail_silently=False,
    )

    return Response({'mensagem': 'Código de verificação enviado!'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_novo_email(request):
    user = request.user
    codigo_recebido = str(request.data.get('codigo')).strip()
    novo_email = request.data.get('novo_email').strip()

    if user.perfil.codigo_otp == codigo_recebido:
        user.email = novo_email
        user.username = novo_email # o email para login
        user.save()
        user.perfil.codigo_otp = None
        user.perfil.save()
        return Response({'mensagem': 'Email atualizado com sucesso!'}, status=200)
    
    return Response({'erro': 'Código incorreto.'}, status=400)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ProgressoRecurso

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def atualizar_progresso(request):
    user = request.user
    recurso_id = request.data.get('recurso_id')
    novo_status = request.data.get('status') # Vai receber 'Em andamento' ou 'Concluído'

    if not recurso_id or not novo_status:
        return Response({'erro': 'Faltam dados'}, status=400)

    #  get_or_create: se não existe, cria. Se existe, vai buscar.
    progresso, created = ProgressoRecurso.objects.get_or_create(
        utilizador=user,
        recurso_id=recurso_id,
        defaults={'status': novo_status}
    )

    # Se já existia, atualizamos o estado
    if not created:
        progresso.status = novo_status
        progresso.save()

    return Response({'mensagem': f'Progresso guardado como {novo_status}!'}, status=200)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models.signals import post_save
from django.dispatch import receiver

# Importa todos os modelos necessários de uma só vez
from .models import (
    Risco, AcaoCorretiva, Organizacao, 
    PerguntaAuditoria, Resposta, ControloISO, Auditoria
)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models.signals import post_save
from django.dispatch import receiver



from .models import (
    Risco, AcaoCorretiva, Organizacao, 
    PerguntaAuditoria, Resposta, ControloISO, Auditoria
)

# ==========================================
# ROTAS DA PÁGINA DE RISCOS
# ==========================================


# ==========================================
# 1. TRATAR RISCO (Pendente -> Em Curso)
# ==========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tratar_risco(request, risco_id):
    try:
        risco = Risco.objects.get(id=risco_id)
        AcaoCorretiva.objects.create(
            risco=risco,
            responsavel=request.data.get('responsavel', 'Não atribuído'),
            data_limite=request.data.get('prazo'), 
            descricao=request.data.get('descricao', ''),
            status='Em curso' 
        )
        return Response({'mensagem': 'Plano registado!'}, status=200)
    except Exception as e:
        return Response({'erro': str(e)}, status=500)

# ==========================================
# 2. CONCLUIR RISCO (Em Curso -> Resolvido)
# ==========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def concluir_risco(request, risco_id):
    try:
        risco = Risco.objects.get(id=risco_id)
        
        # 1. Fecha a ação
        acao = risco.acoes.first()
        if acao:
            acao.status = 'Concluída'
            acao.save()
            
        # 2. Guarda o ficheiro no Risco (como já fazíamos)
        if 'evidencia' in request.FILES:
            risco.evidencia_resolucao = request.FILES['evidencia']
            risco.save()

        # 3. --- A ATUALIZAÇÃO DA AUDITORIA ---
        from .models import Resposta
        resposta_origem = Resposta.objects.filter(
            auditoria=risco.auditoria_origem,
            pergunta__texto_pergunta__startswith=risco.titulo[:100]
        ).first()

        if resposta_origem:
            # Muda para Sim e deixa o rasto
            resposta_origem.resposta = 'Sim'
            resposta_origem.observacoes = f"{resposta_origem.observacoes or ''} | ✅ Risco resolvido via Plano de Ação."
            
            # COPIA A EVIDÊNCIA PARA A AUDITORIA
            if risco.evidencia_resolucao:
                resposta_origem.evidencia = risco.evidencia_resolucao
                
            resposta_origem.save()

        return Response({'mensagem': 'Resolvido e Auditoria atualizada com Evidência!'}, status=200)
    except Exception as e:
        return Response({'erro': str(e)}, status=500)

# ==========================================
# 3. LISTAR RISCOS 
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_riscos_pagina(request):
    try:
        minhas_empresas = Organizacao.objects.filter(auditoria__utilizador=request.user).distinct()
        riscos = Risco.objects.filter(organizacao__in=minhas_empresas).order_by('-id')
        
        lista_riscos = []
        for r in riscos:
            acao = r.acoes.first()
            
            # Estado para o React
            if not acao: estado_react = 'Pendente'
            elif acao.status == 'Em curso': estado_react = 'Em curso'
            else: estado_react = 'Resolvido'

            # ISO (A.x.x) - Vai buscar à ligação oficial, ou faz fallback cruzando o texto
            iso_ref = "ISO 27001"
            if r.controlo_associado:
                iso_ref = r.controlo_associado.codigo
            else:
                p = PerguntaAuditoria.objects.filter(texto_pergunta__startswith=r.titulo[:100]).first()
                if p and p.controlo: 
                    iso_ref = p.controlo.referencia_controlo

            lista_riscos.append({
                "id": r.id, 
                "auditoriaId": r.auditoria_origem.id if r.auditoria_origem else None,
                "n_doc": f"AUD-{r.auditoria_origem.id:04d}" if r.auditoria_origem else "GERAL",
                "empresa": r.organizacao.nome if r.organizacao else "N/A",
                "pergunta": r.titulo,
                "data": r.data_detecao.strftime("%d/%m/%Y") if r.data_detecao else "",
                "estado": estado_react,
                "nivel": r.nivel or 'Médio', # Nível real
                "iso": iso_ref, # Código ISO real
                "responsavel": acao.responsavel if acao else "",
                "prazo": acao.data_limite.strftime("%d/%m/%Y") if acao and acao.data_limite else "",
                "plano_descricao": acao.descricao if acao else "",
                "evidencia_url": request.build_absolute_uri(r.evidencia_resolucao.url) if hasattr(r, 'evidencia_resolucao') and r.evidencia_resolucao else ""
            })
        return Response(lista_riscos, status=200)
    except Exception as e:
        print(f"ERRO: {e}")
        return Response({'erro': str(e)}, status=500)

# ==========================================
# 4. GATILHO (SIGNAL) - COM A PONTE ENTRE AS TABELAS
# ==========================================

@receiver(post_save, sender=Resposta)
def detetar_e_criar_risco(sender, instance, created, **kwargs):
    if instance.resposta.upper() == 'NÃO' and instance.pergunta:
        
        # 1. TRADUZIR O CONTROLO: Pega no "A.5.1" da Questao e encontra o ControloISO correspondente
        controlo_iso_certo = None
        if instance.pergunta.controlo:
            codigo_busca = instance.pergunta.controlo.referencia_controlo
            controlo_iso_certo = ControloISO.objects.filter(codigo=codigo_busca).first()

        try:
            Risco.objects.update_or_create(
                titulo=instance.pergunta.texto_pergunta[:200],
                auditoria_origem=instance.auditoria,
                defaults={
                    'organizacao': instance.auditoria.organizacao,
                    'controlo_associado': controlo_iso_certo, 
                    'nivel': instance.pergunta.nivel_risco_sugerido or 'Médio',
                    'descricao': instance.observacoes or "Detetado em auditoria."
                }
            )
        except Exception as e:
            print(f"Erro no gatilho: {e}")



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gerar_dados_relatorio_pdf(request, auditoria_id):

    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt


    try:
        aud = Auditoria.objects.get(id=auditoria_id, utilizador=request.user)
        respostas_qs = Resposta.objects.filter(auditoria=aud)

        TOTAL_PERGUNTAS_NORMA = 125

        
        dominios_stats = {
            'A.5 Controlos Organizacionais': {'sim': 0, 'na': 0, 'total_base': 41},
            'A.6 Controlos de Pessoas': {'sim': 0, 'na': 0, 'total_base': 9},
            'A.7 Controlos Físicos': {'sim': 0, 'na': 0, 'total_base': 23},
            'A.8 Controlos Tecnológicos': {'sim': 0, 'na': 0, 'total_base': 52},
        }

        total_sim_global = 0
        total_nao_global = 0  
        total_nas = 0
        respostas_falhadas = []

        # ========================================================
        # VARRIMENTO E LÓGICA DE AUDITORIA
        # ========================================================

        for r in respostas_qs:
            resp_texto = r.resposta.strip().upper() if r.resposta else ""

            # 1. IDENTIFICAR O DOMÍNIO
            ref = r.pergunta.controlo.referencia_controlo if r.pergunta.controlo else ""
            if ref.startswith('5') or 'A.5' in ref: key = 'A.5 Controlos Organizacionais'
            elif ref.startswith('6') or 'A.6' in ref: key = 'A.6 Controlos de Pessoas'
            elif ref.startswith('7') or 'A.7' in ref: key = 'A.7 Controlos Físicos'
            elif ref.startswith('8') or 'A.8' in ref: key = 'A.8 Controlos Tecnológicos'
            else: continue 

            # 2. TRATAR OS N/A (Subtrai ao Global E ao Domínio específico)
            if resp_texto in ['NA', 'N/A', 'NÃO APLICÁVEL', 'NAO APLICAVEL']:
                total_nas += 1
                dominios_stats[key]['na'] += 1 # Guarda o N/A neste domínio!
                continue 

            # 3. IGNORAR AS VAZIAS NA CONTAGEM
            if resp_texto == "":
                continue

            # 4. CONTAGEM DOS SIMs e NÃOs
            if resp_texto in ['SIM', 'CONFORME']:
                total_sim_global += 1
                dominios_stats[key]['sim'] += 1 # Soma o SIM a este domínio
            elif resp_texto in ['NÃO', 'NAO']:
                total_nao_global += 1  
                respostas_falhadas.append(r)

        # ========================================================
        # 📊 CÁLCULO DOS RESULTADOS (A Matemática que Pediste)
        # ========================================================
        
        # 1. Dados para as barras de progresso
        lista_dominios = []
        for nome, stats in dominios_stats.items():
            # A tua matemática pura: SIMs / (Total Fixo - NAs do domínio)
            total_valido_dominio = stats['total_base'] - stats['na']
            
            if total_valido_dominio > 0:
                sc = int((stats['sim'] / total_valido_dominio) * 100)
            else:
                sc = 0
                
            lista_dominios.append({"nome": nome, "score": sc})

        # 2. Cálculo do Score Global Absoluto
        total_aplicaveis_norma = TOTAL_PERGUNTAS_NORMA - total_nas
        if total_aplicaveis_norma > 0:
            score_global_absoluto = int((total_sim_global / total_aplicaveis_norma) * 100)
        else:
            score_global_absoluto = 0
            
        # 3. Cálculo do Score de Respondidas
        total_respondidas_validas = total_sim_global + total_nao_global
        if total_respondidas_validas > 0:
            score_respondidas = int((total_sim_global / total_respondidas_validas) * 100)
        else:
            score_respondidas = 0

        # ==========================================
        # GERAÇÃO DO GRÁFICO (DONUT)
        # ==========================================
        fig, ax = plt.subplots(figsize=(7, 7))
        cores = ['#10b981', '#991b1b']
        labels = ['Conforme', 'Não Conforme']
        
        valores_grafico = [total_sim_global, total_aplicaveis_norma - total_sim_global] if total_aplicaveis_norma > 0 else [0, 1]

        wedges, texts, autotexts = ax.pie(
            valores_grafico, 
            labels=labels, 
            autopct='%1.1f%%', 
            startangle=90, 
            colors=cores,
            textprops={'fontsize': 16, 'weight': 'bold'}, 
            wedgeprops={'edgecolor': 'white', 'linewidth': 3}
        )
        
        centre_circle = plt.Circle((0,0), 0.70, fc='white')
        fig.gca().add_artist(centre_circle)
        
        ax.axis('equal')
        plt.tight_layout()

        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', transparent=True, dpi=150)
        buffer.seek(0)
        grafico_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)

        # ==========================================
        # IA 
        # ==========================================
        
        resumo_ia = "Análise automática indisponível no momento."
        plano_acao_ia = []

        if respostas_falhadas:
            texto_falhas = ""
            for r in respostas_falhadas:
                ref = r.pergunta.controlo.referencia_controlo if r.pergunta.controlo else "ISO"
                texto_falhas += f"- [{ref}] {r.pergunta.texto_pergunta}\n"

            prompt = f"""
            Atuas como um Auditor Sénior ISO 27001. Analisa:
            - Score Global (Conformidade sobre a Norma Inteira): {score_global_absoluto}%
            - Score de Conformidade apenas nas Perguntas Respondidas: {score_respondidas}%
            - Total de controlos já avaliados pelo auditor: {total_respondidas_validas}
            - Falhas Críticas Detetadas: {texto_falhas}
            
            O valor de {score_respondidas}% NÃO é a quantidade de perguntas respondidas, 
            mas sim a taxa de sucesso APENAS nas questões que o auditor já avaliou. 
            Não confundas taxa de resposta com taxa de conformidade no teu texto.

            Retorna APENAS um JSON:
            {{
                "resumo_executivo": "Cria um resumo profissional explicando os resultados.",
                "plano_acao": [{{"controlo": "...", "problema": "...", "acao_corretiva": "..."}}]
            }}
            """

            try:
                print("⚡ A tentar Gemini 2.5 Flash...")
                response = cliente_gemini.models.generate_content(
                    model='gemini-2.5-flash', 
                    contents=prompt
                )
                
                raw_text = response.text
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0]
                elif "```" in raw_text:
                    raw_text = raw_text.replace("```", "")
                    
                dados_ia = json.loads(raw_text.strip())
                resumo_ia = dados_ia.get('resumo_executivo', '')
                plano_acao_ia = dados_ia.get('plano_acao', [])
                print("✅ Sucesso: Gemini 2.5 Flash")

            except Exception as e_flash:
                print(f"⚠️ Flash falhou: {e_flash}")
                
                try:
                    print("💎 A tentar Gemini 2.5 Pro...")
                    response = cliente_gemini.models.generate_content(
                        model='gemini-2.5-pro', 
                        contents=prompt
                    )
                    
                    raw_text = response.text
                    if "```json" in raw_text:
                        raw_text = raw_text.split("```json")[1].split("```")[0]
                    elif "```" in raw_text:
                        raw_text = raw_text.replace("```", "")
                        
                    dados_ia = json.loads(raw_text.strip())
                    resumo_ia = dados_ia.get('resumo_executivo', '')
                    plano_acao_ia = dados_ia.get('plano_acao', [])
                    print("✅ Sucesso: Gemini 2.5 Pro")

                except Exception as e_pro:
                    print(f"⚠️ Gemini Pro falhou: {e_pro}")

                    try:
                        print("🚀 A tentar OpenAI Fallback...")
                        if not client_openai:
                            raise ValueError("Cliente OpenAI não inicializado.")
                            
                        response_oa = client_openai.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[{"role": "user", "content": prompt}],
                            response_format={ "type": "json_object" }
                        )
                        dados_ia = json.loads(response_oa.choices[0].message.content)
                        resumo_ia = dados_ia.get('resumo_executivo', '')
                        plano_acao_ia = dados_ia.get('plano_acao', [])
                        print("✅ Sucesso: OpenAI")

                    except Exception as e_openai:
                        print(f"❌ Tudo falhou: {e_openai}")
                        resumo_ia = "Serviços de IA temporariamente indisponíveis."

        # ==========================================
        # RESPOSTA PARA O REACT
        # ==========================================

        return Response({
            "id": aud.id,
            "nome_empresa": aud.organizacao.nome if aud.organizacao else "N/A",
            "score": score_global_absoluto,           
            "score_respondidas": score_respondidas,   
            "dominios": lista_dominios,
            "resumo_executivo_ia": resumo_ia,
            "plano_acao_ia": plano_acao_ia,
            "grafico_donut_b64": f"data:image/png;base64,{grafico_base64}"
        }, status=200)

    except Exception as e:
        print(f"Erro geral no PDF: {e}")
        return Response({"erro": str(e)}, status=500)