from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User 

from .models import (
    TipoUtilizador, Organizacao, AuditoriaEstado, 
    Questao, PerguntaAuditoria, Auditoria, Resposta, Relatorio, RecursoEducativo
)

# Tradutor: Tipo de Utilizador
class TipoUtilizadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoUtilizador
        fields = '__all__'

# Tradutor: Organização
class OrganizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizacao
        fields = '__all__'

# Tradutor: Estado da Auditoria
class AuditoriaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaEstado
        fields = '__all__'

# TRADUTOR: Sub-perguntas práticas
class PerguntaAuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerguntaAuditoria
        fields = ['id', 'texto_pergunta'] # Envia só o ID e o texto para o React

# Questão (Controlos ISO)
class QuestaoSerializer(serializers.ModelSerializer):
    
    perguntas_praticas = PerguntaAuditoriaSerializer(many=True, read_only=True)

    class Meta:
        model = Questao
        # Em vez de '__all__', lista-se os campos e inclui-se a nova "gaveta"
        fields = ['id', 'descricao', 'dominio_iso', 'referencia_controlo', 'perguntas_praticas']

# Tradutor: Auditoria
class AuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auditoria
        fields = '__all__'
        read_only_fields = ['utilizador']

# Tradutor: Resposta
class RespostaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = '__all__'

# Tradutor: Relatório
class RelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relatorio
        fields = '__all__'

# Tradutor: Recurso Educativo
class RecursoEducativoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursoEducativo
        fields = '__all__'

class LoginComEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Nenhuma conta encontrada com este e-mail.')

        if not user.check_password(password):
            raise serializers.ValidationError('Palavra-passe incorreta.')

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'nome_completo': user.first_name 
        }