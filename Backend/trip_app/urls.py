from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from compilation.views import AttractionsViewSet, CompilationViewSet

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'attractions', AttractionsViewSet, basename='attractions')
router.register(r'compilation', CompilationViewSet, basename='compilation')

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/', include(router.urls)),  # Inclut attractions et compilation
    path('api/', include('users.urls')),  # Inclut users/register, users/login, etc.
    path('api/', include('attractions.urls')),  # Routes spécifiques attractions si besoin
    
    # API Auth (Django Rest Framework)
    path('api-auth/', include('rest_framework.urls')),
]
