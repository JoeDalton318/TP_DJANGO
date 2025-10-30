from django.urls import path
from .views import (
    AttractionDetailView,
    TripAdvisorAttractionDetailView,
    TripAdvisorAttractionReviewsView
)

urlpatterns = [
    path('<int:pk>/', AttractionDetailView.as_view(), name='attraction-detail'),
    path('tripadvisor/<str:location_id>/', TripAdvisorAttractionDetailView.as_view(), name='tripadvisor-detail'),
    path('tripadvisor/<str:location_id>/reviews/', TripAdvisorAttractionReviewsView.as_view(), name='tripadvisor-reviews'),
]
