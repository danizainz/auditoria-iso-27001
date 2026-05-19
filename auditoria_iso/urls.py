from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import HttpResponse

from core.views import LoginComEmailView


from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('loaderio-6958db324d58536c7093cb7e50bfe3fb/', lambda request: HttpResponse('loaderio-6958db324d58536c7093cb7e50bfe3fb')),
    path('admin/', admin.site.urls), # ADMIN NORMAL DO DJANGO
    
    # ROTA DE LOGIN 
    path('api/token/', LoginComEmailView.as_view(), name='token_obtain_pair'),
    
    # Rota para renovar o token (refresh)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # rotas das empresas e da app 'core'
    path('api/', include('core.urls')), 
    
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
