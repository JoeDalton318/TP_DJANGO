# users/urls.py

from django.urls import path
from .views import (
    RegisterUserView,
    LoginUserView,
    SelectProfileView,
    GetProfileView,
    LogoutProfileView
)

urlpatterns = [
    path('auth/register/', RegisterUserView.as_view(), name='user-register'),
    path('auth/login/', LoginUserView.as_view(), name='user-login'),
    path('profile/select/', SelectProfileView.as_view(), name='select-profile'),
    path('profile/me/', GetProfileView.as_view(), name='get-profile'),
    path('profile/logout/', LogoutProfileView.as_view(), name='logout-profile'),
]
