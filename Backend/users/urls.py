from django.urls import path
from .views import SelectProfileView, LogoutProfileView, GetProfileView

urlpatterns = [
    path('profile/select/', SelectProfileView.as_view(), name='select-profile'),
    path('profile/logout/', LogoutProfileView.as_view(), name='logout-profile'),
    path('profile/me/', GetProfileView.as_view(), name='get-profile'),
]
