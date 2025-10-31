from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompilationViewSet

router = DefaultRouter()
router.register(r'compilation', CompilationViewSet, basename='compilation')

urlpatterns = [
    path('', include(router.urls)),
]