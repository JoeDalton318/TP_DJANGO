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
    path('cuisines/', views.cuisines, name='cuisines'),
    path('hotel-styles/', views.hotel_styles, name='hotel_styles'),
    path('attraction-types/', views.attraction_types, name='attraction_types'),
    
    # Détail d'une attraction (doit être en dernier)
    path('<str:tripadvisor_id>/', views.AttractionDetailView.as_view(), name='detail'),
]