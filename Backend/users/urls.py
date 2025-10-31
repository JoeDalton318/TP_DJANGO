# users/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'profile', views.UserProfileViewSet, basename='user-profile')

urlpatterns = [
    # Routes du ViewSet (profile/me/, profile/select_profile/)
    path('users/', include(router.urls)),
    
    # Authentification
    path('users/register/', views.register, name='user-register'),
    path('users/logout/', views.logout, name='user-logout'),
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
