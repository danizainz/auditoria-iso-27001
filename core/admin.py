from django.contrib import admin
from .models import (
    TipoUtilizador, Organizacao, AuditoriaEstado, 
    Questao, Auditoria, Resposta, Relatorio, RecursoEducativo
)

# Personalização do Título do Portal
admin.site.site_header = "Portal de Auditoria ISO 27001"
admin.site.site_title = "Painel de Controlo"
admin.site.index_title = "Gestão de Auditorias"

# Registo dos modelos
admin.site.register(TipoUtilizador)
admin.site.register(Organizacao)
admin.site.register(AuditoriaEstado)
admin.site.register(Questao)
admin.site.register(Auditoria)
admin.site.register(Resposta)
admin.site.register(Relatorio)
admin.site.register(RecursoEducativo)