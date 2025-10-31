from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from compilation.views import AttractionsViewSet, CompilationViewSet

router = DefaultRouter()
router.register(r'attractions', AttractionsViewSet, basename='attractions')
router.register(r'compilation', CompilationViewSet, basename='compilation')

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]