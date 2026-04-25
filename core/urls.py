from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

from .views import (
    OrganizacaoViewSet, QuestaoViewSet, AuditoriaViewSet,
    RespostaViewSet, TipoUtilizadorViewSet, AuditoriaEstadoViewSet,
    RelatorioViewSet, RecursoEducativoViewSet, registar_utilizador,
    listar_auditorias_dashboard, dashboard_real , verificar_otp, finalizar_perfil,
    importar_soa_excel, estatisticas_soa, concluir_curso, dados_perfil, atualizar_seguranca,
    gerar_qr_code_2fa, confirmar_ativacao_2fa, login_step_1, login_step_2_verify,
    alterar_password_2fa, solicitar_alteracao_email, confirmar_novo_email, atualizar_progresso,
    listar_riscos_pagina, tratar_risco, concluir_risco, gerar_dados_relatorio_pdf,

)
from .views import atualizar_progresso

# O "Router" cria automaticamente todos os links das tabelas
router = DefaultRouter()
router.register(r'organizacoes', OrganizacaoViewSet)
router.register(r'questoes', QuestaoViewSet)
router.register(r'auditorias', AuditoriaViewSet)
router.register(r'respostas', RespostaViewSet)
router.register(r'tipos-utilizador', TipoUtilizadorViewSet)
router.register(r'estados-auditoria', AuditoriaEstadoViewSet)
router.register(r'relatorios', RelatorioViewSet)
router.register(r'recursos-educativos', RecursoEducativoViewSet)

urlpatterns = [
    # 1. Links das tabelas (ViewSets)
    path('', include(router.urls)),
    
    # 2. Links do Registo e Ativação
    path('registar/', registar_utilizador, name='registar'),
    path('verificar-otp/', verificar_otp, name='verificar-otp'),
    path('finalizar-perfil/', finalizar_perfil, name='finalizar-perfil'),
    
    # 3. Link para recuperar a password
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),

    # 4. Rotas de Dashboard e Auditorias
    path('auditorias-tabela/', listar_auditorias_dashboard, name='auditorias-tabela'),
    path('dashboard-real/', dashboard_real, name='dashboard-real'),
    
    # 5. Outras Ferramentas
    path('importar-soa/', importar_soa_excel, name='importar-soa'), 
    path('estatisticas-soa/', estatisticas_soa, name='estatisticas-soa'),
    path('concluir-curso/', concluir_curso, name='concluir-curso'),
    path('user-profile/', dados_perfil, name='user_profile'),
    path('atualizar-seguranca/', atualizar_seguranca, name='atualizar_seguranca'),

    # 6. 🔐 O NOVO LOGIN EM 2 PASSOS
    path('login-step-1/', login_step_1, name='login_step_1'),
    path('login-step-2-verify/', login_step_2_verify, name='login_step_2_verify'),

    # 7. 📱 CONFIGURAÇÃO 2FA
    path('gerar-qr-2fa/', gerar_qr_code_2fa, name='gerar-qr-2fa'),
    path('confirmar-2fa/', confirmar_ativacao_2fa, name='confirmar-2fa'),
    path('alterar-password-2fa/', alterar_password_2fa),

    # 8. 📧 ALTERAÇÃO DE EMAIL
    path('solicitar-alteracao-email/', solicitar_alteracao_email, name='solicitar-email'),
    path('confirmar-novo-email/', confirmar_novo_email, name='confirmar-email'),
    path('alterar-password-2fa/', alterar_password_2fa, name='alterar-pass-2fa'),
    path('atualizar-progresso/', atualizar_progresso, name='atualizar-progresso'),


    path('riscos-lista/', views.listar_riscos_pagina, name='riscos_lista'),
    path('riscos/<int:risco_id>/tratar/', views.tratar_risco, name='tratar_risco'),
    path('riscos/<int:risco_id>/concluir/', views.concluir_risco, name='concluir_risco'),


    # 9. ROTA PARA GERAR O PDF DOS DADOS DA AUDITORIA
    path('auditoria/<int:auditoria_id>/pdf-dados/', views.gerar_dados_relatorio_pdf, name='gerar_dados_pdf'),


]