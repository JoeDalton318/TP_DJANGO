from django.urls import path
from . import views

app_name = 'attractions'

urlpatterns = [
    # API de recherche
    path('search/', views.AttractionSearchView.as_view(), name='search'),
    
    # Attractions populaires
    path('popular/', views.PopularAttractionsView.as_view(), name='popular'),
    
    # Endpoints utilitaires (doivent être avant le pattern générique)
    path('suggestions/', views.search_suggestions, name='suggestions'),
    path('categories/', views.categories, name='categories'),
    path('countries/', views.countries, name='countries'),
    
    # Endpoints de test TripAdvisor
    path('test/tripadvisor/search/', views.test_tripadvisor_search, name='test_search'),
    path('test/tripadvisor/details/', views.test_tripadvisor_details, name='test_details'),
    path('test/tripadvisor/photos/', views.test_tripadvisor_photos, name='test_photos'),
    path('test/full-process/', views.test_full_process, name='test_full_process'),
    
    # Détail d'une attraction (doit être en dernier)
    path('<str:tripadvisor_id>/', views.AttractionDetailView.as_view(), name='detail'),
]