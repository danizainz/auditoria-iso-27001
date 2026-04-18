from django.db import models
from django.contrib.auth.models import User

class TipoUtilizador(models.Model):
    descricao = models.CharField(max_length=50)

    class Meta:
        verbose_name = "Tipo de Utilizador"
        verbose_name_plural = "Tipos de Utilizador"

    def __str__(self):
        return self.descricao

class Organizacao(models.Model):
    nome = models.CharField(max_length=150)
    setor = models.CharField(max_length=100)
    data_criacao = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Organização"
        verbose_name_plural = "Organizações"

    def __str__(self):
        return self.nome

class AuditoriaEstado(models.Model):
    descricao = models.CharField(max_length=50)

    class Meta:
        verbose_name = "Estado da Auditoria"
        verbose_name_plural = "Estados da Auditoria"

    def __str__(self):
        return self.descricao

# --- CLASSE AJUSTADA PARA ISO 27001:2022 --- #
class Questao(models.Model):
    TEMAS_ISO = [
        ('Organizacional', 'A.5 Controlos Organizacionais'),
        ('Pessoas', 'A.6 Controlos de Pessoas'),
        ('Físico', 'A.7 Controlos Físicos'),
        ('Tecnológico', 'A.8 Controlos Tecnológicos'),
    ]

    descricao = models.TextField()
    dominio_iso = models.CharField(
        max_length=50, 
        choices=TEMAS_ISO, 
        verbose_name="Tema/Domínio ISO"
    )
    referencia_controlo = models.CharField(
        max_length=50, 
        help_text="Exemplo: A.5.1, A.8.10"
    )

    class Meta:
        verbose_name = "Questão / Controlo"
        verbose_name_plural = "Questões / Controlos"
        ordering = ['referencia_controlo'] 

    def __str__(self):
        return f"{self.referencia_controlo} - {self.descricao[:50]}..."

# TABELA DAS SUB-PERGUNTAS PRÁTICAS
class PerguntaAuditoria(models.Model):
    controlo = models.ForeignKey(Questao, related_name='perguntas_praticas', on_delete=models.CASCADE)
    texto_pergunta = models.CharField(max_length=255, help_text="A pergunta de Sim/Não. Ex: O disco está encriptado?")

    class Meta:
        verbose_name = "Pergunta Prática"
        verbose_name_plural = "Perguntas Práticas"

    def __str__(self):
        return f"{self.controlo.referencia_controlo} -> {self.texto_pergunta}"

class Auditoria(models.Model):
    data_inicio = models.DateField()
    data_fim = models.DateField(null=True, blank=True)
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE)
    organizacao = models.ForeignKey(Organizacao, on_delete=models.CASCADE)
    estado = models.ForeignKey(AuditoriaEstado, on_delete=models.PROTECT)
    assinatura_base64 = models.TextField(blank=True, null=True)
    score = models.IntegerField(default=0, help_text="Nota final de conformidade (0-100)") 

    class Meta:
        verbose_name = "Auditoria"
        verbose_name_plural = "Auditorias"

    def __str__(self):
        return f"Auditoria {self.id} - {self.organizacao.nome}"

# TABELA RESPOSTA (com null=True, blank=True)
class Resposta(models.Model):
    auditoria = models.ForeignKey(Auditoria, on_delete=models.CASCADE)
    pergunta = models.ForeignKey(PerguntaAuditoria, on_delete=models.CASCADE, null=True, blank=True) 
    resposta = models.CharField(max_length=50) 
    observacoes = models.TextField(blank=True, null=True)
    evidencia = models.FileField(upload_to='evidencias_auditoria/', blank=True, null=True)

    class Meta:
        verbose_name = "Resposta"
        verbose_name_plural = "Respostas"

class Relatorio(models.Model):
    auditoria = models.ForeignKey(Auditoria, on_delete=models.CASCADE)
    data_geracao = models.DateTimeField(auto_now_add=True)
    resumo = models.TextField()

    class Meta:
        verbose_name = "Relatório"
        verbose_name_plural = "Relatórios"

    def __str__(self):
        return f"Relatório Auditoria {self.auditoria.id}"

class RecursoEducativo(models.Model):
    TIPOS_RECURSO = [
        ('Documento', 'Documento (PDF, Word)'),
        ('Vídeo', 'Vídeo (YouTube, Vimeo)'),
        ('Template', 'Template (Excel, Word)'),
    ]

    titulo = models.CharField(max_length=150, verbose_name="Título do Recurso")
    tipo = models.CharField(max_length=50, choices=TIPOS_RECURSO, default='Documento')
    descricao = models.TextField(verbose_name="Descrição curta")
    icone = models.CharField(max_length=10, default="📄", help_text="Emoji para o cartão")
    capa = models.ImageField(upload_to='capas_recursos/', blank=True, null=True, help_text="Imagem de capa estilo SafetyCulture")
    ficheiro = models.FileField(upload_to='biblioteca_recursos/', blank=True, null=True)
    link_video = models.URLField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Recurso Educativo"
        verbose_name_plural = "Recursos Educativos"
        ordering = ['-data_criacao']

    def __str__(self):
        return f"{self.icone} {self.titulo} ({self.tipo})"

    #  Perfil do Utilizador (Para OTP e Onboarding)
class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    codigo_otp = models.CharField(max_length=6, blank=True, null=True)
    objetivo = models.CharField(max_length=50, blank=True, null=True) # "Auditar" ou "Aprender"
    empresa_default = models.CharField(max_length=150, blank=True, null=True)
    telemovel = models.CharField(max_length=20, blank=True, null=True)
    dois_fatores_ativo = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.user.username}"

class ControloISO(models.Model):
    # Esta tabela terá os 93 controlos fixos da norma
    codigo = models.CharField(max_length=10, unique=True) # ex: A.5.1
    nome = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Controlo ISO"
        verbose_name_plural = "Controlos ISO"
        ordering = ['codigo'] # Para aparecerem sempre ordenados de A.5.1 até A.8.34

    def __str__(self):
        return f"{self.codigo} - {self.nome}"

class RespostaClienteSoA(models.Model):
    # Aqui guardamos o que o cliente importou do Excel
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    controlo = models.ForeignKey(ControloISO, on_delete=models.CASCADE)
    aplicavel = models.BooleanField(default=True)
    estado = models.CharField(max_length=50) # Implementado, Em Curso, Não Iniciado
    justificacao = models.TextField(blank=True, null=True)
    evidencia = models.CharField(max_length=255, blank=True, null=True)
    ultima_atualizacao = models.DateTimeField(auto_now=True) # Atualiza a data sozinho sempre que o cliente faz novo upload!

    class Meta:
        verbose_name = "Resposta SoA do Cliente"
        verbose_name_plural = "Respostas SoA dos Clientes"

    def __str__(self):
        return f"{self.user.username} | {self.controlo.codigo} - {self.estado}"




class ProgressoRecurso(models.Model):
    ESTADOS = [
        ('Pendente', 'Pendente'),
        ('Em andamento', 'Em andamento'),
        ('Concluído', 'Concluído'),
    ]
    utilizador = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meus_progressos')
    recurso = models.ForeignKey(RecursoEducativo, on_delete=models.CASCADE) # 👈 USA O TEU MODELO!
    status = models.CharField(max_length=20, choices=ESTADOS, default='Pendente')
    data_interacao = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Progresso de Recurso"
        verbose_name_plural = "Progressos de Recursos"
        unique_together = ('utilizador', 'recurso') 

    def __str__(self):
        return f"{self.utilizador.username} - {self.recurso.titulo} ({self.status})"

class Risco(models.Model):
    NIVEIS = [('Alto', 'Alto'), ('Médio', 'Médio'), ('Baixo', 'Baixo')]
    
    titulo = models.CharField(max_length=200)
    nivel = models.CharField(max_length=10, choices=NIVEIS)
    organizacao = models.ForeignKey(Organizacao, on_delete=models.CASCADE) # No dashboard usei 'empresa', mas aqui liga à tua 'Organizacao'
    controlo_associado = models.ForeignKey(ControloISO, on_delete=models.SET_NULL, null=True)
    data_detecao = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Risco"
        verbose_name_plural = "Riscos"

    def __str__(self):
        return f"[{self.nivel}] {self.titulo}"


class AcaoCorretiva(models.Model):
    ESTADOS = [('Pendente', 'Pendente'), ('Em curso', 'Em curso'), ('Concluída', 'Concluída')]
    
    descricao = models.TextField()
    risco = models.ForeignKey(Risco, on_delete=models.CASCADE, related_name='acoes')
    status = models.CharField(max_length=20, choices=ESTADOS, default='Pendente')
    data_limite = models.DateField()

    class Meta:
        verbose_name = "Ação Corretiva"
        verbose_name_plural = "Ações Corretivas"