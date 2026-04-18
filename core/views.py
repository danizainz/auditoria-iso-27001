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
                        "evidencia_url": link_foto
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

        # 🕵️‍♂️ O DETETOR DE MENTIRAS: Vai imprimir isto no teu terminal!
        print(f"🕵️‍♂️ A VERIFICAR: O React enviou '{codigo_recebido}' | A BD tem '{codigo_real}'")

        if codigo_real == codigo_recebido:
            user.is_active = True # Conta Ativada!
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
    
    # Se ele indicou uma empresa, vamos já criá-la na BD para o Dropdown dele!
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
    reset_url = f"http://localhost:3000/redefinir-password?token={reset_password_token.key}"
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
# ==========================================

from django.db.models import Avg, Count
from .models import Auditoria, Risco, AcaoCorretiva, Organizacao, ProgressoRecurso

from django.db.models import Avg, Count
from .models import Auditoria, Risco, AcaoCorretiva, Organizacao, ProgressoRecurso

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_real(request):
    try:
        user = request.user
        
        # --- 1. O FILTRO MÁGICO: APENAS AS TUAS AUDITORIAS E EMPRESAS ---
        minhas_auditorias = Auditoria.objects.filter(utilizador=user)
        # Vai buscar apenas as organizações onde tu fizeste auditoria
        minhas_empresas = Organizacao.objects.filter(auditoria__utilizador=user).distinct()

        # 2. KPIs REAIS (Agora só com os teus dados)
        total_empresas = minhas_empresas.count()
        auditorias_ativas = minhas_auditorias.filter(estado__descricao='Em curso').count() 
        conf_media = minhas_auditorias.aggregate(Avg('score'))['score__avg'] or 0

        # Riscos e Ações (Se der erro aqui no futuro, é porque precisas de associar os riscos ao utilizador)
        total_riscos = Risco.objects.count() or 1
        r_alto = (Risco.objects.filter(nivel='Alto').count() / total_riscos) * 100
        r_medio = (Risco.objects.filter(nivel='Médio').count() / total_riscos) * 100
        r_baixo = (Risco.objects.filter(nivel='Baixo').count() / total_riscos) * 100
        riscos_criticos = Risco.objects.filter(nivel='Alto').count()

        total_acoes = AcaoCorretiva.objects.count() or 1
        concluidas = (AcaoCorretiva.objects.filter(status='Concluída').count() / total_acoes) * 100

        # 3. LISTA DE EMPRESAS (Top 5 das TUAS empresas)
        lista_empresas = []
        for emp in minhas_empresas[:5]:
            auditorias_empresa = minhas_auditorias.filter(organizacao=emp)
            
            if auditorias_empresa.exists():
                ult_auditoria = auditorias_empresa.latest('data_fim')
                data_formatada = ult_auditoria.data_fim.strftime("%d %b %Y") if ult_auditoria.data_fim else "Em curso"
                score_auditoria = ult_auditoria.score
            else:
                data_formatada = "Sem auditorias"
                score_auditoria = 0

            lista_empresas.append({
                "id": emp.id,
                "nome": emp.nome,
                "ultimaAuditoria": data_formatada,
                "score": score_auditoria
            })

        top_riscos = []
        for r in Risco.objects.filter(nivel='Alto')[:3]:
            nome_emp = "Desconhecida"
            if hasattr(r, 'organizacao') and r.organizacao: nome_emp = r.organizacao.nome
            elif hasattr(r, 'empresa') and r.empresa: nome_emp = r.empresa.nome

            top_riscos.append({
                "area": r.titulo,
                "nivel": r.nivel,
                "empresa": nome_emp
            })

        # 4. FORMAÇÃO (Isto já estava a filtrar bem pelo user!)
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
                "riscosCriticos": riscos_criticos
            },
            "dadosRisco": {"alto": round(r_alto), "medio": round(r_medio), "baixo": round(r_baixo)},
            "correcoes": {"concluidas": round(concluidas), "meta": 80},
            "empresas": lista_empresas,
            "riscosQuentes": top_riscos,
            "meusCursos": meus_cursos
        }, status=200)

    except Exception as e:
        print(f"🔥 ERRO NO DASHBOARD: {e}")
        return Response({"erro": str(e)}, status=500)


import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ControloISO, RespostaClienteSoA

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def importar_soa_excel(request):
    # 1. Verificar se o ficheiro veio no pedido
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
            # Usamos iloc[número_da_coluna] para não dar erro se o cliente mudar o título da coluna
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

            # 4. Garantir que o Controlo Mestre existe (Se não existir, o Django cria logo!)
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
        
        # Aqui, no futuro, podes gravar numa tabela nova tipo 'FormacaoConcluida'
        # FormacaoConcluida.objects.create(utilizador=request.user, curso_id=curso_id)
        
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
        
        # Atualiza os dados com o que veio do React
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

# 1️⃣ GERA O QR CODE E ENVIA PARA O REACT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gerar_qr_code_2fa(request):
    try:
        perfil = request.user.perfil
        
        # Se ele ainda não tem um segredo, criamos um agora!
        if not perfil.totp_secret:
            perfil.totp_secret = pyotp.random_base32()
            perfil.save()

        # Criar o link especial que as Apps de Telemóvel entendem
        totp = pyotp.TOTP(perfil.totp_secret)
        uri = totp.provisioning_uri(name=request.user.email, issuer_name="Auditoria ISO 27001")

        # Desenhar a Imagem do QR Code
        img = qrcode.make(uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        
        # Converter a imagem para Base64 para o React a conseguir ler diretamente!
        qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return Response({"qr_code": f"data:image/png;base64,{qr_base64}"}, status=200)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

# 2️⃣ VERIFICA SE OS 6 DÍGITOS ESTÃO CERTOS E ATIVA O 2FA
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

# --- COLA ISTO APENAS UMA VEZ NO FIM DO VIEWS.PY ---

@api_view(['POST'])
@authentication_classes([]) # Isto desativa o CSRF de forma correta e segura para o Login
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
        # O pyotp usa o segredo que guardámos no perfil para validar
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