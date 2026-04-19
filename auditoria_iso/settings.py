from pathlib import Path
from datetime import timedelta 

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-81ke!z)-d%pi4lldm@ft-l46ilip@+2u8w#33!%_%(p!b@0h4)'


DEBUG = True

ALLOWED_HOSTS = [
    'api.auditoria-iso-27001.pt',
    'auditoria-iso-27001.onrender.com', 
    'localhost', 
    '127.0.0.1'
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
    'django_rest_passwordreset',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'auditoria_iso.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auditoria_iso.wsgi.application'

# Database - Configuração para MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'db_auditoria_iso',
        'USER': 'root',
        'PASSWORD': 'Snolinhaa123', 
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-pt' 
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Permite que o Frontend (React) aceda à API com segurança
CORS_ALLOWED_ORIGINS = [
    "https://auditoria-iso-27001.pt",
    "https://auditoria-iso-27001.vercel.app",
    "http://localhost:3000",
    "https://www.auditoria-iso-27001.pt",
]

CSRF_TRUSTED_ORIGINS = [
    "https://auditoria-iso-27001.pt",
    "https://auditoria-iso-27001.vercel.app",
    "http://localhost:3000",
    "https://www.auditoria-iso-27001.pt",
]

# Configuração do Sistema de Tokens (JWT)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Configurar o tempo de vida do bilhete
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1), # dura 1 dia inteiro
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7), # O de renovação dura 1 semana
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = 'dani.carvalho2928@gmail.com' 
EMAIL_HOST_PASSWORD = 'kuinocbqvhufrxls'