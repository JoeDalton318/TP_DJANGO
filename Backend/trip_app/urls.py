from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from compilation.views import AttractionsViewSet, CompilationViewSet

router = DefaultRouter()
router.register(r'attractions', AttractionsViewSet, basename='attractions')
router.register(r'compilation', CompilationViewSet, basename='compilation')

from django.urls import path,include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/attractions/', include('attractions.urls')),
    path('api/', include('attractions.urls')), 
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),]
