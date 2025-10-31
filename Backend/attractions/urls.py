from django.urls import path
from . import views

app_name = 'attractions'

urlpatterns = [
    # API de recherche
    path('search/', views.AttractionSearchView.as_view(), name='search'),
    
    # Attractions populaires
    path('popular/', views.PopularAttractionsView.as_view(), name='popular'),
    
    # Recherche par proximité GPS
    path('nearby/', views.AttractionNearbyView.as_view(), name='nearby'),
    
    # Endpoints utilitaires (doivent être avant le pattern générique)
    path('suggestions/', views.search_suggestions, name='suggestions'),
    path('categories/', views.categories, name='categories'),
    path('countries/', views.countries, name='countries'),
    
    # Endpoints de test TripAdvisor
    path('test/tripadvisor/search/', views.test_tripadvisor_search, name='test_search'),
    path('test/tripadvisor/details/', views.test_tripadvisor_details, name='test_details'),
    path('test/tripadvisor/photos/', views.test_tripadvisor_photos, name='test_photos'),
    path('test/tripadvisor/nearby/', views.test_tripadvisor_nearby, name='test_nearby'),
    path('test/full-process/', views.test_full_process, name='test_full_process'),
    
    # Photos d'une attraction (avant le pattern générique)
    path('photos/<str:location_id>/', views.AttractionPhotosView.as_view(), name='photos'),
    
    # Détail d'une attraction (doit être en dernier)
    path('<str:tripadvisor_id>/', views.AttractionDetailView.as_view(), name='detail'),
]