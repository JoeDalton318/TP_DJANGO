from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.conf import settings
from .models import Attraction
from .serializers import (
    AttractionSerializer, 
    AttractionCardSerializer, 
    AttractionSearchSerializer
)

# Import des services
from .services import tripadvisor_service as mock_service
try:
    from .tripadvisor_service import tripadvisor_real_service as real_service
except ImportError:
    real_service = None

# Choisir le service à utiliser selon la configuration
def get_tripadvisor_service():
    api_key = getattr(settings, 'TRIPADVISOR_API_KEY', '')
    # Temporairement, forcer l'utilisation du service mock
    # même si on a une clé API, car la clé semble invalide
    # if real_service and api_key and api_key != 'your-tripadvisor-api-key-here':
    #     return real_service
    return mock_service


class AttractionSearchView(APIView):
    """
    API de recherche d'attractions avec filtres avancés (version mockée)
    
    Paramètres de recherche:
    - query: Recherche dans le nom et la description
    - category: Filtre par catégorie (restaurant, hotel, attraction)
    - city: Filtre par ville
    - country: Filtre par pays
    - min_rating, max_rating: Filtres par note
    - min_reviews: Nombre minimum de reviews
    - min_photos: Nombre minimum de photos
    - price_level: Niveau de prix ($, $$, $$$, $$$$)
    - latitude, longitude, radius: Recherche géographique
    - profile: Profil utilisateur (local, tourist, professional)
    - ordering: Tri (-num_likes, rating, -rating, name, -name)
    """
    
    def get(self, request):
        # Récupérer les paramètres de recherche
        serializer = AttractionSearchSerializer(data=request.query_params)
        if serializer.is_valid():
            filters = serializer.validated_data
        else:
            filters = {}
        
        # Utiliser le service approprié pour la recherche
        service = get_tripadvisor_service()
        mock_results = service.search_attractions(filters)
        
        # Pagination manuelle
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_results = mock_results[start:end]
        
        # Sérialiser les résultats
        response_data = []
        for mock_data in paginated_results:
            # Convertir les données mockées au format attendu
            response_data.append({
                'id': mock_data.get('tripadvisor_id'),
                'tripadvisor_id': mock_data.get('tripadvisor_id'),
                'name': mock_data.get('name'),
                'city': mock_data.get('city'),
                'country': mock_data.get('country'),
                'category': mock_data.get('category'),
                'rating': mock_data.get('rating'),
                'num_reviews': mock_data.get('num_reviews'),
                'price_level': mock_data.get('price_level'),
                'main_image': mock_data.get('main_image'),
                'location': [mock_data.get('latitude'), mock_data.get('longitude')] if mock_data.get('latitude') else None
            })
        
        # Format de réponse avec pagination
        return Response({
            'count': len(mock_results),
            'page': page,
            'page_size': page_size,
            'results': response_data
        })


class PopularAttractionsView(APIView):
    """
    API pour récupérer les attractions les plus populaires (version mockée)
    
    Paramètres:
    - country: Filtre par pays
    - profile: Profil utilisateur (local, tourist, professional)
    - limit: Nombre d'attractions à retourner (défaut: 20)
    """
    
    def get(self, request):
        country = request.query_params.get('country')
        profile = request.query_params.get('profile')
        limit = int(request.query_params.get('limit', 20))
        
        # Utiliser le service approprié
        service = get_tripadvisor_service()
        mock_results = service.get_popular_attractions(
            country=country,
            profile=profile,
            limit=limit
        )
        
        # Sérialiser les résultats
        response_data = []
        for mock_data in mock_results:
            response_data.append({
                'id': mock_data.get('tripadvisor_id'),
                'tripadvisor_id': mock_data.get('tripadvisor_id'),
                'name': mock_data.get('name'),
                'city': mock_data.get('city'),
                'country': mock_data.get('country'),
                'category': mock_data.get('category'),
                'rating': mock_data.get('rating'),
                'num_reviews': mock_data.get('num_reviews'),
                'price_level': mock_data.get('price_level'),
                'main_image': mock_data.get('main_image'),
                'location': [mock_data.get('latitude'), mock_data.get('longitude')] if mock_data.get('latitude') else None
            })
        
        return Response(response_data)


class AttractionDetailView(APIView):
    """
    API pour récupérer les détails d'une attraction (version mockée)
    """
    
    def get(self, request, tripadvisor_id):
        # Utiliser le service approprié
        service = get_tripadvisor_service()
        mock_data = service.get_attraction_by_id(tripadvisor_id)
        
        if not mock_data:
            return Response({'detail': 'Attraction not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(mock_data)


@api_view(['GET'])
def search_suggestions(request):
    """
    API pour obtenir des suggestions de recherche
    """
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response([])
    
    # Rechercher dans les noms de villes et attractions
    suggestions = []
    
    # Utiliser les données selon le service disponible
    service = get_tripadvisor_service()
    
    # Si c'est le service mock, utiliser les données mockées
    if hasattr(service, 'mock_attractions'):
        mock_attractions = service.mock_attractions
        
        cities = set()
        attractions = set()
        
        for attraction in mock_attractions:
            if query.lower() in attraction['city'].lower():
                cities.add(attraction['city'])
            if query.lower() in attraction['name'].lower():
                attractions.add(attraction['name'])
        
        # Limiter les suggestions
        suggestions.extend([{'type': 'city', 'name': city} for city in list(cities)[:5]])
        suggestions.extend([{'type': 'attraction', 'name': name} for name in list(attractions)[:10]])
    else:
        # Pour le service réel, faire une recherche TripAdvisor
        try:
            results = service.search_locations(query)
            for result in results[:15]:
                suggestion_type = 'attraction'
                if result.get('address_obj', {}).get('city'):
                    suggestion_type = 'city'
                suggestions.append({
                    'type': suggestion_type,
                    'name': result.get('name', '')
                })
        except Exception:
            pass  # Retourner une liste vide en cas d'erreur
    
    return Response(suggestions[:15])


@api_view(['GET'])
def categories(request):
    """
    API pour obtenir la liste des catégories disponibles avec icônes et descriptions
    """
    categories = [
        {
            'value': 'restaurant', 
            'label': 'Restaurants', 
            'icon': 'restaurant',
            'description': 'Découvrez les meilleurs restaurants',
            'count': 150  # Sera dynamique plus tard
        },
        {
            'value': 'hotel', 
            'label': 'Hôtels', 
            'icon': 'hotel',
            'description': 'Trouvez votre hébergement idéal',
            'count': 85
        },
        {
            'value': 'attraction', 
            'label': 'Attractions touristiques', 
            'icon': 'camera',
            'description': 'Explorez les sites incontournables',
            'count': 265
        },
    ]
    
    return Response(categories)


@api_view(['GET'])
def countries(request):
    """
    API pour obtenir la liste des pays disponibles avec informations enrichies
    """
    service = get_tripadvisor_service()
    
    # Si c'est le service mock, extraire des données mockées
    if hasattr(service, 'mock_attractions'):
        mock_attractions = service.mock_attractions
        countries_data = {}
        
        for attraction in mock_attractions:
            country = attraction['country']
            if country not in countries_data:
                countries_data[country] = {
                    'value': country,
                    'label': country,
                    'count': 0,
                    'cities': set()
                }
            countries_data[country]['count'] += 1
            countries_data[country]['cities'].add(attraction['city'])
        
        # Convertir en liste et ajouter le nombre de villes
        countries_list = []
        for country_data in countries_data.values():
            country_data['cities_count'] = len(country_data['cities'])
            country_data['cities'] = list(country_data['cities'])[:5]  # Top 5 villes
            countries_list.append(country_data)
        
        countries_list.sort(key=lambda x: x['count'], reverse=True)
        return Response(countries_list)
    else:
        # Pour le service réel, retourner une liste prédéfinie enrichie
        common_countries = [
            {'value': 'France', 'label': 'France', 'count': 120, 'cities': ['Paris', 'Lyon', 'Marseille']},
            {'value': 'United States', 'label': 'États-Unis', 'count': 95, 'cities': ['New York', 'Los Angeles', 'Chicago']},
            {'value': 'United Kingdom', 'label': 'Royaume-Uni', 'count': 80, 'cities': ['London', 'Manchester', 'Edinburgh']},
            {'value': 'Italy', 'label': 'Italie', 'count': 75, 'cities': ['Rome', 'Milan', 'Venice']},
            {'value': 'Spain', 'label': 'Espagne', 'count': 65, 'cities': ['Barcelona', 'Madrid', 'Seville']},
        ]
        return Response(common_countries)


@api_view(['GET'])
def cuisines(request):
    """
    API pour obtenir la liste des types de cuisine disponibles
    """
    cuisines = [
        {'value': 'French', 'label': 'Cuisine Française', 'count': 45},
        {'value': 'Italian', 'label': 'Cuisine Italienne', 'count': 38},
        {'value': 'Japanese', 'label': 'Cuisine Japonaise', 'count': 32},
        {'value': 'American', 'label': 'Cuisine Américaine', 'count': 28},
        {'value': 'Thai', 'label': 'Cuisine Thaïlandaise', 'count': 25},
        {'value': 'Chinese', 'label': 'Cuisine Chinoise', 'count': 22},
        {'value': 'Indian', 'label': 'Cuisine Indienne', 'count': 20},
        {'value': 'Spanish', 'label': 'Cuisine Espagnole', 'count': 18},
        {'value': 'German', 'label': 'Cuisine Allemande', 'count': 15},
        {'value': 'Mexican', 'label': 'Cuisine Mexicaine', 'count': 12},
    ]
    
    return Response(cuisines)


@api_view(['GET'])
def hotel_styles(request):
    """
    API pour obtenir la liste des styles d'hôtels disponibles
    """
    styles = [
        {'value': 'Luxury', 'label': 'Hôtels de Luxe', 'count': 25},
        {'value': 'Boutique', 'label': 'Hôtels Boutique', 'count': 20},
        {'value': 'Business', 'label': 'Hôtels d\'Affaires', 'count': 18},
        {'value': 'Resort', 'label': 'Complexes Hôteliers', 'count': 15},
        {'value': 'Budget', 'label': 'Hôtels Économiques', 'count': 12},
        {'value': 'Historic', 'label': 'Hôtels Historiques', 'count': 10},
        {'value': 'Modern', 'label': 'Hôtels Modernes', 'count': 8},
        {'value': 'Family', 'label': 'Hôtels Familiaux', 'count': 7},
        {'value': 'Eco-friendly', 'label': 'Hôtels Écologiques', 'count': 5},
        {'value': 'Design', 'label': 'Hôtels Design', 'count': 4},
    ]
    
    return Response(styles)


@api_view(['GET'])
def attraction_types(request):
    """
    API pour obtenir la liste des types d'attractions disponibles
    """
    types = [
        {'value': 'Museums', 'label': 'Musées', 'count': 45},
        {'value': 'Historical Sites', 'label': 'Sites Historiques', 'count': 40},
        {'value': 'Outdoor Activities', 'label': 'Activités de Plein Air', 'count': 35},
        {'value': 'Entertainment', 'label': 'Divertissement', 'count': 30},
        {'value': 'Cultural', 'label': 'Sites Culturels', 'count': 28},
        {'value': 'Architecture', 'label': 'Architecture', 'count': 25},
        {'value': 'Nature', 'label': 'Nature', 'count': 22},
        {'value': 'Shopping', 'label': 'Shopping', 'count': 20},
    ]
    
    return Response(types)