from django.urls import path
from .views import AttractionDetailView

urlpatterns = [
    path('attractions/<int:pk>/', AttractionDetailView.as_view(), name='attraction-detail'),
]
