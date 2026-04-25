from django.contrib import admin
from .models import (
    TipoUtilizador, Organizacao, AuditoriaEstado, 
    Questao, PerguntaAuditoria, Auditoria, Resposta, 
    Relatorio, RecursoEducativo, Risco, AcaoCorretiva
)

# Personalização do Título do Portal
admin.site.site_header = "Portal de Auditoria ISO 27001"
admin.site.site_title = "Painel de Controlo"
admin.site.index_title = "Gestão de Auditorias"

# --- INLINES PARA PERGUNTAS DENTRO DE QUESTÕES ---
class PerguntaInline(admin.TabularInline):
    model = PerguntaAuditoria
    extra = 1  # Deixa uma linha em branco para novas perguntas
    fields = ('texto_pergunta', 'nivel_risco_sugerido')

# --- CUSTOMIZAÇÃO DOS MODELOS NO ADMIN ---

@admin.register(Questao)
class QuestaoAdmin(admin.ModelAdmin):
    list_display = ('referencia_controlo', 'dominio_iso', 'descricao_curta')
    list_filter = ('dominio_iso',)
    search_fields = ('referencia_controlo', 'descricao')
    inlines = [PerguntaInline] # 👈 Aqui as perguntas aparecem dentro da Questão

    def descricao_curta(self, obj):
        return obj.descricao[:70] + "..."

@admin.register(PerguntaAuditoria)
class PerguntaAuditoriaAdmin(admin.ModelAdmin):
    list_display = ('texto_pergunta', 'controlo', 'nivel_risco_sugerido')
    list_filter = ('nivel_risco_sugerido', 'controlo__dominio_iso')
    search_fields = ('texto_pergunta',)

@admin.register(Risco)
class RiscoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'nivel', 'organizacao', 'data_detecao')
    list_filter = ('nivel', 'organizacao')

# --- REGISTO DOS RESTANTES MODELOS ---
admin.site.register(TipoUtilizador)
admin.site.register(Organizacao)
admin.site.register(AuditoriaEstado)
admin.site.register(Auditoria)
admin.site.register(Resposta)
admin.site.register(Relatorio)
admin.site.register(RecursoEducativo)
admin.site.register(AcaoCorretiva)