from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    logout_view,
    UserProfileView,
    user_info_view,
    CustomTokenObtainPairView
)

urlpatterns = [
    # Authentification
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', logout_view, name='auth_logout'),
    
    # Token management
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profil utilisateur
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('me/', user_info_view, name='user_info'),
]