from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, filters, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from attractions.tripadvisor_service import tripadvisor_service
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from .models import UserProfile, Compilation, CompilationItem
from .serializers import (
    UserProfileSerializer, UserProfileCreateSerializer,
    CompilationSerializer, CompilationListSerializer, CompilationCreateSerializer,
    CompilationItemSerializer, CompilationStatsSerializer, UserProfileStatsSerializer
)
import logging
import requests

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class PopularAttractionsView(APIView):
    """
    API pour récupérer les attractions populaires via TripAdvisor API officielle
    Utilise: GET /location/search et GET /location/{id}/details
    """
    permission_classes = [AllowAny]  # Accessible sans authentification
    
    def get(self, request):
        try:
            # Paramètres de la requête
            country = request.query_params.get('country', 'France').strip()
            limit = min(int(request.query_params.get('limit', 10)), 20)
            page = int(request.query_params.get('page', 1))
            
            logger.info(f"🔍 Recherche attractions populaires: {country}, limit={limit}, page={page}")
            
            # Utiliser le service TripAdvisor refactorisé
            attractions = tripadvisor_service.get_popular_attractions(country=country, limit=limit)
            
            # Pagination simple
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_attractions = attractions[start_index:end_index]
            
            total_count = len(attractions)
            total_pages = (total_count + limit - 1) // limit
            
            response_data = {
                'count': len(paginated_attractions),
                'total_count': total_count,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_previous': page > 1,
                'data': paginated_attractions
            }
            
            logger.info(f"✅ Retourné {len(paginated_attractions)} attractions populaires")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"❌ Erreur PopularAttractionsView: {str(e)}")
            return Response({
                'detail': f'Erreur lors de la récupération des attractions populaires: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class AttractionSearchView(APIView):
    """
    API pour rechercher des attractions avec filtres
    Utilise: GET /location/search et GET /location/{id}/details
    """
    permission_classes = [AllowAny]  # Accessible sans authentification
    
    def get(self, request):
        try:
            # Récupérer les paramètres de recherche de base
            query = request.query_params.get('query', '').strip()
            city = request.query_params.get('city', '').strip()
            country = request.query_params.get('country', '').strip()
            category = request.query_params.get('category', '').strip()
            
            # Récupérer les filtres avancés et pagination
            min_rating = request.query_params.get('min_rating')
            max_rating = request.query_params.get('max_rating')
            min_reviews = request.query_params.get('min_reviews')
            min_photos = request.query_params.get('min_photos')
            price_level = request.query_params.get('price_level', '').strip()
            opening_period = request.query_params.get('opening_period', '').strip()
            ordering = request.query_params.get('ordering', '-rating').strip()
            
            # Paramètres de pagination
            page = max(int(request.query_params.get('page', 1)), 1)
            limit = max(min(int(request.query_params.get('limit', 20)), 100), 1)  # Max 100, min 1
            
            logger.info(f"🔍 AttractionSearchView - Paramètres reçus: query='{query}', country='{country}', filtres avancés actifs")
            
            # Construire la requête de recherche
            search_terms = []
            if query:
                search_terms.append(query)
            if city:
                search_terms.append(city)
            if country:
                search_terms.append(country)
            
            search_query = ' '.join(search_terms) if search_terms else 'attractions'
            
            logger.info(f"🔍 Recherche: '{search_query}' avec filtres avancés")
            
            # Préparer TOUS les filtres (sans doublons)
            filters = {}
            if city:
                filters['city'] = city
            if country:
                filters['country'] = country
            if category:
                filters['category'] = category
            if min_rating:
                filters['min_rating'] = min_rating
            if max_rating:
                filters['max_rating'] = max_rating
            if min_reviews:
                filters['min_reviews'] = min_reviews
            if min_photos:
                filters['min_photos'] = min_photos
            if price_level:
                filters['price_level'] = price_level
            if opening_period:
                filters['opening_period'] = opening_period
            if ordering:
                filters['ordering'] = ordering
            
            logger.info(f"📋 Filtres préparés: {filters}")
            
            # Recherche avec le service TripAdvisor
            logger.info(f"📡 Appel search_attractions_by_query avec: '{search_query}'")
            attractions = tripadvisor_service.search_attractions_by_query(search_query, **filters)
            
            logger.info(f"📊 Service retourné {len(attractions)} attractions")
            
            # Pagination
            total_count = len(attractions)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_attractions = attractions[start_index:end_index]
            
            # Calculer les métadonnées de pagination
            total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
            
            response_data = {
                'count': len(paginated_attractions),
                'total_count': total_count,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_previous': page > 1,
                'data': paginated_attractions
            }
            
            logger.info(f"✅ Trouvé {len(paginated_attractions)} attractions (page {page}/{total_pages}) pour '{search_query}'")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"❌ Erreur AttractionSearchView: {str(e)}")
            return Response({
                'detail': f'Erreur lors de la recherche: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class AttractionDetailView(APIView):
    """
    API pour récupérer les détails d'une attraction
    Utilise: GET /location/{location_id}/details et GET /location/{location_id}/photos
    """
    permission_classes = [AllowAny]  # Accessible sans authentification
    
    def get(self, request, tripadvisor_id):
        try:
            logger.info(f"🏛️  Récupération détails pour location_id: {tripadvisor_id}")
            
            # Récupérer l'attraction par ID
            attraction = tripadvisor_service.get_attraction_by_id(tripadvisor_id)
            
            if not attraction:
                logger.warning(f"⚠️  Attraction {tripadvisor_id} non trouvée")
                return Response({
                    'detail': 'Attraction non trouvée'
                }, status=status.HTTP_404_NOT_FOUND)
            
            logger.info(f"✅ Détails récupérés pour: {attraction.get('name')}")
            return Response(attraction)
            
        except Exception as e:
            logger.error(f"❌ Erreur AttractionDetailView: {str(e)}")
            return Response({
                'detail': f'Erreur lors de la récupération des détails: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= APIs UTILITAIRES =============

@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """
    API pour obtenir des suggestions de recherche
    """
    try:
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return JsonResponse({'suggestions': []})
        
        # Recherche de base pour les suggestions
        results = tripadvisor_service.search_locations(query)
        
        # Formater les suggestions
        suggestions = []
        for location in results[:8]:  # Limiter à 8 suggestions
            suggestion = {
                'name': location.get('name', ''),
                'location_id': location.get('location_id'),
                'address': location.get('address_obj', {}).get('address_string', ''),
                'city': location.get('address_obj', {}).get('city', ''),
                'country': location.get('address_obj', {}).get('country', '')
            }
            suggestions.append(suggestion)
        
        return JsonResponse({'suggestions': suggestions})
        
    except Exception as e:
        logger.error(f"Erreur suggestions: {str(e)}")
        return JsonResponse({'suggestions': []})


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    """
    API pour obtenir les catégories d'attractions disponibles
    """
    categories_list = [
        {'id': 'attraction', 'name': 'Attractions', 'name_fr': 'Attractions'},
        {'id': 'restaurant', 'name': 'Restaurants', 'name_fr': 'Restaurants'},
        {'id': 'hotel', 'name': 'Hotels', 'name_fr': 'Hôtels'},
        {'id': 'museum', 'name': 'Museums', 'name_fr': 'Musées'},
        {'id': 'park', 'name': 'Parks', 'name_fr': 'Parcs'},
        {'id': 'monument', 'name': 'Monuments', 'name_fr': 'Monuments'},
        {'id': 'entertainment', 'name': 'Entertainment', 'name_fr': 'Divertissement'},
        {'id': 'shopping', 'name': 'Shopping', 'name_fr': 'Shopping'},
        {'id': 'nightlife', 'name': 'Nightlife', 'name_fr': 'Vie nocturne'},
        {'id': 'outdoor', 'name': 'Outdoor Activities', 'name_fr': 'Activités extérieures'}
    ]
    
    return JsonResponse({'categories': categories_list})


@api_view(['GET'])
@permission_classes([AllowAny])
def countries(request):
    """
    API pour obtenir la liste des pays disponibles
    """
    countries_list = [
        # Pays principaux avec couverture TripAdvisor
        {'code': 'FR', 'name': 'France', 'name_fr': 'France'},
        {'code': 'ES', 'name': 'Spain', 'name_fr': 'Espagne'},
        {'code': 'IT', 'name': 'Italy', 'name_fr': 'Italie'},
        {'code': 'GB', 'name': 'United Kingdom', 'name_fr': 'Royaume-Uni'},
        {'code': 'DE', 'name': 'Germany', 'name_fr': 'Allemagne'},
        {'code': 'US', 'name': 'United States', 'name_fr': 'États-Unis'},
        {'code': 'CA', 'name': 'Canada', 'name_fr': 'Canada'},
        {'code': 'JP', 'name': 'Japan', 'name_fr': 'Japon'},
        {'code': 'AU', 'name': 'Australia', 'name_fr': 'Australie'},
        {'code': 'BR', 'name': 'Brazil', 'name_fr': 'Brésil'},
        {'code': 'CN', 'name': 'China', 'name_fr': 'Chine'},
        {'code': 'IN', 'name': 'India', 'name_fr': 'Inde'},
        {'code': 'TH', 'name': 'Thailand', 'name_fr': 'Thaïlande'},
        {'code': 'MX', 'name': 'Mexico', 'name_fr': 'Mexique'},
        {'code': 'EG', 'name': 'Egypt', 'name_fr': 'Égypte'},
        {'code': 'ZA', 'name': 'South Africa', 'name_fr': 'Afrique du Sud'},
        {'code': 'NL', 'name': 'Netherlands', 'name_fr': 'Pays-Bas'},
        {'code': 'BE', 'name': 'Belgium', 'name_fr': 'Belgique'},
        {'code': 'CH', 'name': 'Switzerland', 'name_fr': 'Suisse'},
        {'code': 'AT', 'name': 'Austria', 'name_fr': 'Autriche'}
    ]
    
    return JsonResponse({'countries': countries_list})


# ============= TESTS D'API =============

@api_view(['GET'])
def test_tripadvisor_search(request):
    """
    Endpoint de test pour vérifier l'API TripAdvisor search
    """
    try:
        query = request.GET.get('q', 'paris')
        
        logger.info(f"🧪 Test TripAdvisor search avec query: {query}")
        
        # Test direct de l'API
        results = tripadvisor_service.search_locations(query)
        
        return JsonResponse({
            'status': 'success',
            'query': query,
            'results_count': len(results),
            'results': results[:3] if results else []  # Premiers résultats pour debug
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur test search: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })


@api_view(['GET'])
def test_tripadvisor_details(request):
    """
    Endpoint de test pour vérifier l'API TripAdvisor details
    """
    try:
        location_id = request.GET.get('location_id', '187147')  # Paris par défaut
        
        logger.info(f"🧪 Test TripAdvisor details avec location_id: {location_id}")
        
        # Test direct de l'API
        details = tripadvisor_service.get_location_details(location_id)
        
        if details:
            return JsonResponse({
                'status': 'success',
                'location_id': location_id,
                'name': details.get('name'),
                'details': details
            })
        else:
            return JsonResponse({
                'status': 'not_found',
                'location_id': location_id,
                'message': 'Location not found'
            })
        
    except Exception as e:
        logger.error(f"❌ Erreur test details: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })


@api_view(['GET'])
def test_tripadvisor_photos(request):
    """
    Endpoint de test pour vérifier l'API TripAdvisor photos
    """
    try:
        location_id = request.GET.get('location_id', '6678144')  # The Peninsula Paris
        
        logger.info(f"🧪 Test TripAdvisor photos avec location_id: {location_id}")
        
        # Test direct de l'API
        photos = tripadvisor_service.get_location_photos(location_id)
        
        return JsonResponse({
            'status': 'success',
            'location_id': location_id,
            'photos_count': len(photos),
            'photos': photos[:2] if photos else []  # Premières photos pour debug
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur test photos: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })


@api_view(['GET'])
def test_full_process(request):
    """
    Endpoint de test pour vérifier tout le processus de recherche et formatage
    """
    try:
        query = request.GET.get('q', 'louvre')
        
        logger.info(f"🧪 Test processus complet avec query: {query}")
        
        # 1. Test recherche de base
        locations = tripadvisor_service.search_locations(query)
        logger.info(f"📋 Étape 1 - Locations trouvées: {len(locations)}")
        
        if not locations:
            return JsonResponse({
                'status': 'no_locations',
                'message': 'Aucune location trouvée'
            })
        
        # 2. Test formatage pour la première location
        first_location = locations[0]
        location_id = first_location.get('location_id')
        
        logger.info(f"🏛️ Étape 2 - Test location: {first_location.get('name')} (ID: {location_id})")
        
        # 3. Récupérer détails et photos
        details = tripadvisor_service.get_location_details(location_id) if location_id else None
        photos = tripadvisor_service.get_location_photos(location_id) if location_id else []
        
        logger.info(f"📋 Étape 3 - Détails: {'✅' if details else '❌'}, Photos: {len(photos)}")
        
        # 4. Test formatage
        formatted = tripadvisor_service._format_attraction(first_location, details, photos)
        
        logger.info(f"🎯 Étape 4 - Formatage: {'✅' if formatted else '❌'}")
        
        return JsonResponse({
            'status': 'success',
            'query': query,
            'step1_locations_count': len(locations),
            'step2_first_location': {
                'name': first_location.get('name'),
                'location_id': location_id
            },
            'step3_details_found': bool(details),
            'step3_photos_count': len(photos),
            'step4_formatted': bool(formatted),
            'formatted_result': formatted if formatted else None
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur test processus: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })


@api_view(['GET'])
def test_tripadvisor_nearby(request):
    """
    Endpoint de test pour vérifier l'API TripAdvisor nearby search
    """
    try:
        # Coordonnées par défaut: Boston (exemple fourni)
        lat_long = request.GET.get('latLong', '42.3455,-71.10767')
        radius = request.GET.get('radius', '5')  # 5 km par défaut
        category = request.GET.get('category', '')
        
        logger.info(f"🧪 Test TripAdvisor nearby avec latLong: {lat_long}")
        
        # Test direct de l'API
        results = tripadvisor_service.nearby_search(lat_long, radius=radius, category=category)
        
        return JsonResponse({
            'status': 'success',
            'lat_long': lat_long,
            'radius': radius,
            'category': category,
            'results_count': len(results),
            'results': results[:3] if results else []  # Premiers résultats pour debug
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur test nearby: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        })


@method_decorator(csrf_exempt, name='dispatch') 
class AttractionNearbyView(APIView):
    """
    API pour rechercher des attractions à proximité avec coordonnées GPS
    Utilise: GET /location/nearby_search
    """
    
    def get(self, request):
        try:
            # Paramètres obligatoires
            latitude = request.query_params.get('latitude')
            longitude = request.query_params.get('longitude')
            
            if not latitude or not longitude:
                return Response({
                    'detail': 'Les paramètres latitude et longitude sont obligatoires'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Paramètres optionnels et pagination
            radius = request.query_params.get('radius', '5')  # 5km par défaut
            category = request.query_params.get('category', '')
            page = max(int(request.query_params.get('page', 1)), 1)
            limit = max(min(int(request.query_params.get('limit', 20)), 100), 1)
            
            # Paramètres de filtres avancés
            min_rating = request.query_params.get('min_rating')
            max_rating = request.query_params.get('max_rating')
            min_reviews = request.query_params.get('min_reviews')
            min_photos = request.query_params.get('min_photos')
            price_level = request.query_params.get('price_level')
            ordering = request.query_params.get('ordering', '-rating')
            
            logger.info(f"🧭 Recherche proximité avec filtres: lat={latitude}, lon={longitude}, radius={radius}")
            
            # Construire latLong pour TripAdvisor API
            lat_long = f"{latitude},{longitude}"
            
            # Préparer les filtres pour nearby search
            filters = {}
            if category:
                filters['category'] = category
            if min_rating:
                filters['min_rating'] = min_rating
            if max_rating:
                filters['max_rating'] = max_rating
            if min_reviews:
                filters['min_reviews'] = min_reviews
            if min_photos:
                filters['min_photos'] = min_photos
            if price_level:
                filters['price_level'] = price_level
            if ordering:
                filters['ordering'] = ordering
            
            # Utiliser le service TripAdvisor nearby search avec filtres
            attractions = tripadvisor_service.nearby_search(lat_long, radius=radius, **filters)
            
            # Pagination
            total_count = len(attractions)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_attractions = attractions[start_index:end_index]
            
            # Calculer les métadonnées de pagination
            total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
            
            response_data = {
                'count': len(paginated_attractions),
                'total_count': total_count,
                'page': page,
                'limit': limit,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_previous': page > 1,
                'latitude': float(latitude),
                'longitude': float(longitude),
                'radius_km': float(radius),
                'data': paginated_attractions
            }
            
            logger.info(f"✅ Trouvé {len(paginated_attractions)} attractions (page {page}/{total_pages}) dans un rayon de {radius}km")
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"❌ Erreur AttractionNearbyView: {str(e)}")
            return Response({
                'detail': f'Erreur lors de la recherche de proximité: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Obtenir les détails depuis TripAdvisor
            location_details = service.get_location_details(tripadvisor_id)
            
            if not location_details:
                return Response({'detail': 'Attraction not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Extraire l'image principale
            main_image = self._extract_main_image(location_details)
            
            # Adresse et localisation
            address_obj = location_details.get('address_obj', {})
            
            # Coordonnées
            latitude = location_details.get('latitude')
            longitude = location_details.get('longitude')
            location_coords = None
            if latitude and longitude:
                try:
                    location_coords = [float(latitude), float(longitude)]
                except (ValueError, TypeError):
                    location_coords = None
            
            # Convertir au format attendu
            response_data = {
                'id': location_details.get('location_id'),
                'tripadvisor_id': location_details.get('location_id'),
                'name': location_details.get('name', ''),
                'city': address_obj.get('city', ''),
                'country': address_obj.get('country', ''),
                'category': self._map_category_from_details(location_details),
                'rating': location_details.get('rating'),
                'num_reviews': location_details.get('num_reviews'),
                'price_level': location_details.get('price_level'),
                'main_image': main_image,
                'location': location_coords,
                'description': location_details.get('description', ''),
                'website': location_details.get('website'),
                'phone': location_details.get('phone'),
                'hours': location_details.get('hours', {}),
                'cuisine': location_details.get('cuisine', []),
                'dietary_restrictions': location_details.get('dietary_restrictions', [])
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des détails: {str(e)}")
            return Response({
                'detail': f'Erreur lors de la récupération des détails: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _extract_main_image(self, location_details):
        """Extraire l'image principale depuis les détails de localisation"""
        # Méthode 1: Depuis les photos de l'objet
        if 'photos' in location_details and location_details['photos']:
            image_url = self._extract_image_from_photos(location_details['photos'])
            if image_url:
                return image_url
        
        # Méthode 2: Depuis l'objet photo principal
        if 'photo' in location_details and isinstance(location_details['photo'], dict):
            photo = location_details['photo']
            
            # Structure avec images multiples
            if 'images' in photo and isinstance(photo['images'], dict):
                images = photo['images']
                # Préférer l'image 'large' ou 'original'
                for size in ['large', 'original', 'medium', 'small']:
                    if size in images and isinstance(images[size], dict) and 'url' in images[size]:
                        image_url = images[size]['url']
                        if image_url and isinstance(image_url, str):
                            return image_url
            
            # URL directe dans la photo
            if 'url' in photo and isinstance(photo['url'], str):
                return photo['url']
        
        return None
    
    def _extract_image_from_photos(self, photos):
        """Extraire l'image principale depuis l'endpoint photos"""
        if not photos or not isinstance(photos, list) or len(photos) == 0:
            return None
            
        for photo in photos[:3]:  # Essayer les 3 premières photos
            if not isinstance(photo, dict):
                continue
                
            # Structure avec images multiples
            if 'images' in photo and isinstance(photo['images'], dict):
                images = photo['images']
                # Préférer l'image 'large' ou 'original'
                for size in ['large', 'original', 'medium', 'small']:
                    if size in images and isinstance(images[size], dict) and 'url' in images[size]:
                        image_url = images[size]['url']
                        if image_url and isinstance(image_url, str):
                            return image_url
            
            # URL directe dans la photo
            if 'url' in photo and isinstance(photo['url'], str):
                return photo['url']
        
        return None
    
    def _map_category_from_details(self, location_details):
        """Mapper la catégorie depuis les détails TripAdvisor"""
        if 'category' in location_details:
            category_name = location_details['category'].get('name', '').lower()
            if 'restaurant' in category_name:
                return 'restaurant'
            elif 'hotel' in category_name:
                return 'hotel'
        return 'attraction'


# ============= FONCTIONS UTILITAIRES =============

@api_view(['GET'])
@permission_classes([AllowAny])
def search_suggestions(request):
    """
    API pour obtenir des suggestions de recherche via TripAdvisor API
    """
    try:
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return JsonResponse({'suggestions': []})
        
        # Utiliser le service TripAdvisor
        results = tripadvisor_service.search_locations(query)
        
        if not results:
            return JsonResponse({'suggestions': []})
        
        # Formater les suggestions
        suggestions = []
        for location in results[:10]:  # Limiter à 10 suggestions
            suggestion = {
                'name': location.get('name', ''),
                'location_id': location.get('location_id'),
                'address': location.get('address_obj', {}).get('address_string', ''),
                'category': location.get('category', {}).get('name', 'attraction')
            }
            suggestions.append(suggestion)
        
        return JsonResponse({'suggestions': suggestions})
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des suggestions: {str(e)}")
        return JsonResponse({'suggestions': []})


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    """
    API pour obtenir les catégories d'attractions disponibles
    """
    categories_list = [
        {'id': 'attraction', 'name': 'Attractions', 'name_fr': 'Attractions'},
        {'id': 'restaurant', 'name': 'Restaurants', 'name_fr': 'Restaurants'},
        {'id': 'hotel', 'name': 'Hotels', 'name_fr': 'Hôtels'},
        {'id': 'museum', 'name': 'Museums', 'name_fr': 'Musées'},
        {'id': 'park', 'name': 'Parks', 'name_fr': 'Parcs'},
        {'id': 'beach', 'name': 'Beaches', 'name_fr': 'Plages'},
        {'id': 'monument', 'name': 'Monuments', 'name_fr': 'Monuments'},
        {'id': 'church', 'name': 'Churches', 'name_fr': 'Églises'},
        {'id': 'theater', 'name': 'Theaters', 'name_fr': 'Théâtres'},
        {'id': 'zoo', 'name': 'Zoos', 'name_fr': 'Zoos'},
        {'id': 'aquarium', 'name': 'Aquariums', 'name_fr': 'Aquariums'},
        {'id': 'gallery', 'name': 'Art Galleries', 'name_fr': 'Galeries d\'art'},
        {'id': 'garden', 'name': 'Gardens', 'name_fr': 'Jardins'},
        {'id': 'castle', 'name': 'Castles', 'name_fr': 'Châteaux'},
        {'id': 'bridge', 'name': 'Bridges', 'name_fr': 'Ponts'},
        {'id': 'market', 'name': 'Markets', 'name_fr': 'Marchés'},
        {'id': 'shopping', 'name': 'Shopping', 'name_fr': 'Shopping'},
        {'id': 'spa', 'name': 'Spas', 'name_fr': 'Spas'},
        {'id': 'adventure', 'name': 'Adventure Tours', 'name_fr': 'Aventure'},
        {'id': 'nightlife', 'name': 'Nightlife', 'name_fr': 'Vie nocturne'}
    ]
    
    return JsonResponse({'categories': categories_list})


@api_view(['GET'])
@permission_classes([AllowAny])
def countries(request):
    """
    API pour obtenir la liste des pays disponibles avec couverture mondiale
    """
    countries_list = [
        # Europe
        {'code': 'FR', 'name': 'France', 'name_fr': 'France', 'continent': 'Europe'},
        {'code': 'ES', 'name': 'Spain', 'name_fr': 'Espagne', 'continent': 'Europe'},
        {'code': 'IT', 'name': 'Italy', 'name_fr': 'Italie', 'continent': 'Europe'},
        {'code': 'GB', 'name': 'United Kingdom', 'name_fr': 'Royaume-Uni', 'continent': 'Europe'},
        {'code': 'DE', 'name': 'Germany', 'name_fr': 'Allemagne', 'continent': 'Europe'},
        {'code': 'NL', 'name': 'Netherlands', 'name_fr': 'Pays-Bas', 'continent': 'Europe'},
        {'code': 'BE', 'name': 'Belgium', 'name_fr': 'Belgique', 'continent': 'Europe'},
        {'code': 'CH', 'name': 'Switzerland', 'name_fr': 'Suisse', 'continent': 'Europe'},
        {'code': 'AT', 'name': 'Austria', 'name_fr': 'Autriche', 'continent': 'Europe'},
        {'code': 'PT', 'name': 'Portugal', 'name_fr': 'Portugal', 'continent': 'Europe'},
        
        # Amérique du Nord
        {'code': 'US', 'name': 'United States', 'name_fr': 'États-Unis', 'continent': 'North America'},
        {'code': 'CA', 'name': 'Canada', 'name_fr': 'Canada', 'continent': 'North America'},
        {'code': 'MX', 'name': 'Mexico', 'name_fr': 'Mexique', 'continent': 'North America'},
        
        # Amérique du Sud
        {'code': 'BR', 'name': 'Brazil', 'name_fr': 'Brésil', 'continent': 'South America'},
        {'code': 'AR', 'name': 'Argentina', 'name_fr': 'Argentine', 'continent': 'South America'},
        {'code': 'CL', 'name': 'Chile', 'name_fr': 'Chili', 'continent': 'South America'},
        {'code': 'PE', 'name': 'Peru', 'name_fr': 'Pérou', 'continent': 'South America'},
        {'code': 'CO', 'name': 'Colombia', 'name_fr': 'Colombie', 'continent': 'South America'},
        
        # Asie
        {'code': 'JP', 'name': 'Japan', 'name_fr': 'Japon', 'continent': 'Asia'},
        {'code': 'CN', 'name': 'China', 'name_fr': 'Chine', 'continent': 'Asia'},
        {'code': 'IN', 'name': 'India', 'name_fr': 'Inde', 'continent': 'Asia'},
        {'code': 'TH', 'name': 'Thailand', 'name_fr': 'Thaïlande', 'continent': 'Asia'},
        {'code': 'KR', 'name': 'South Korea', 'name_fr': 'Corée du Sud', 'continent': 'Asia'},
        {'code': 'SG', 'name': 'Singapore', 'name_fr': 'Singapour', 'continent': 'Asia'},
        {'code': 'MY', 'name': 'Malaysia', 'name_fr': 'Malaisie', 'continent': 'Asia'},
        {'code': 'ID', 'name': 'Indonesia', 'name_fr': 'Indonésie', 'continent': 'Asia'},
        {'code': 'PH', 'name': 'Philippines', 'name_fr': 'Philippines', 'continent': 'Asia'},
        {'code': 'VN', 'name': 'Vietnam', 'name_fr': 'Vietnam', 'continent': 'Asia'},
        
        # Afrique
        {'code': 'ZA', 'name': 'South Africa', 'name_fr': 'Afrique du Sud', 'continent': 'Africa'},
        {'code': 'EG', 'name': 'Egypt', 'name_fr': 'Égypte', 'continent': 'Africa'},
        {'code': 'MA', 'name': 'Morocco', 'name_fr': 'Maroc', 'continent': 'Africa'},
        {'code': 'TN', 'name': 'Tunisia', 'name_fr': 'Tunisie', 'continent': 'Africa'},
        {'code': 'KE', 'name': 'Kenya', 'name_fr': 'Kenya', 'continent': 'Africa'},
        {'code': 'TZ', 'name': 'Tanzania', 'name_fr': 'Tanzanie', 'continent': 'Africa'},
        
        # Océanie
        {'code': 'AU', 'name': 'Australia', 'name_fr': 'Australie', 'continent': 'Oceania'},
        {'code': 'NZ', 'name': 'New Zealand', 'name_fr': 'Nouvelle-Zélande', 'continent': 'Oceania'},
        {'code': 'FJ', 'name': 'Fiji', 'name_fr': 'Fidji', 'continent': 'Oceania'}
    ]
    
    return JsonResponse({'countries': countries_list})


@api_view(['GET'])
@permission_classes([AllowAny])
def cuisines(request):
    """
    API pour obtenir la liste des cuisines disponibles
    """
    cuisines_list = [
        {'id': 'italian', 'name': 'Italian', 'name_fr': 'Italienne'},
        {'id': 'french', 'name': 'French', 'name_fr': 'Française'},
        {'id': 'american', 'name': 'American', 'name_fr': 'Américaine'},
        {'id': 'chinese', 'name': 'Chinese', 'name_fr': 'Chinoise'},
        {'id': 'japanese', 'name': 'Japanese', 'name_fr': 'Japonaise'},
        {'id': 'indian', 'name': 'Indian', 'name_fr': 'Indienne'},
        {'id': 'mexican', 'name': 'Mexican', 'name_fr': 'Mexicaine'},
        {'id': 'thai', 'name': 'Thai', 'name_fr': 'Thaïlandaise'},
        {'id': 'mediterranean', 'name': 'Mediterranean', 'name_fr': 'Méditerranéenne'},
        {'id': 'seafood', 'name': 'Seafood', 'name_fr': 'Fruits de mer'},
        {'id': 'vegetarian', 'name': 'Vegetarian', 'name_fr': 'Végétarienne'},
        {'id': 'vegan', 'name': 'Vegan', 'name_fr': 'Végétalienne'},
        {'id': 'steakhouse', 'name': 'Steakhouse', 'name_fr': 'Steakhouse'},
        {'id': 'fast_food', 'name': 'Fast Food', 'name_fr': 'Fast Food'},
        {'id': 'cafe', 'name': 'Cafe', 'name_fr': 'Café'},
        {'id': 'bar', 'name': 'Bar', 'name_fr': 'Bar'},
        {'id': 'pizza', 'name': 'Pizza', 'name_fr': 'Pizza'},
        {'id': 'sushi', 'name': 'Sushi', 'name_fr': 'Sushi'},
        {'id': 'barbecue', 'name': 'Barbecue', 'name_fr': 'Barbecue'},
        {'id': 'latin', 'name': 'Latin American', 'name_fr': 'Latino-américaine'}
    ]
    
    return JsonResponse({'cuisines': cuisines_list})


@api_view(['GET'])
@permission_classes([AllowAny])
def hotel_styles(request):
    """
    API pour obtenir la liste des styles d'hôtels disponibles
    """
    styles_list = [
        {'id': 'luxury', 'name': 'Luxury', 'name_fr': 'Luxe'},
        {'id': 'boutique', 'name': 'Boutique', 'name_fr': 'Boutique'},
        {'id': 'business', 'name': 'Business', 'name_fr': 'Affaires'},
        {'id': 'family', 'name': 'Family-Friendly', 'name_fr': 'Familial'},
        {'id': 'romantic', 'name': 'Romantic', 'name_fr': 'Romantique'},
        {'id': 'spa', 'name': 'Spa & Wellness', 'name_fr': 'Spa et Bien-être'},
        {'id': 'beach', 'name': 'Beach Resort', 'name_fr': 'Station balnéaire'},
        {'id': 'city', 'name': 'City Center', 'name_fr': 'Centre-ville'},
        {'id': 'airport', 'name': 'Airport', 'name_fr': 'Aéroport'},
        {'id': 'budget', 'name': 'Budget', 'name_fr': 'Économique'},
        {'id': 'historic', 'name': 'Historic', 'name_fr': 'Historique'},
        {'id': 'modern', 'name': 'Modern', 'name_fr': 'Moderne'},
        {'id': 'casino', 'name': 'Casino', 'name_fr': 'Casino'},
        {'id': 'golf', 'name': 'Golf Resort', 'name_fr': 'Resort de golf'},
        {'id': 'ski', 'name': 'Ski Resort', 'name_fr': 'Station de ski'}
    ]
    
    return JsonResponse({'hotel_styles': styles_list})


@api_view(['GET'])
@permission_classes([AllowAny])
def attraction_types(request):
    """
    API pour obtenir la liste des types d'attractions disponibles
    """
    types_list = [
        {'id': 'museum', 'name': 'Museums', 'name_fr': 'Musées'},
        {'id': 'park', 'name': 'Parks & Nature', 'name_fr': 'Parcs et Nature'},
        {'id': 'monument', 'name': 'Monuments & Landmarks', 'name_fr': 'Monuments et Sites'},
        {'id': 'church', 'name': 'Churches & Religious Sites', 'name_fr': 'Églises et Sites religieux'},
        {'id': 'entertainment', 'name': 'Entertainment & Shows', 'name_fr': 'Divertissement et Spectacles'},
        {'id': 'zoo', 'name': 'Zoos & Aquariums', 'name_fr': 'Zoos et Aquariums'},
        {'id': 'beach', 'name': 'Beaches', 'name_fr': 'Plages'},
        {'id': 'shopping', 'name': 'Shopping', 'name_fr': 'Shopping'},
        {'id': 'nightlife', 'name': 'Nightlife', 'name_fr': 'Vie nocturne'},
        {'id': 'tours', 'name': 'Tours & Activities', 'name_fr': 'Visites et Activités'},
        {'id': 'adventure', 'name': 'Adventure & Sports', 'name_fr': 'Aventure et Sports'},
        {'id': 'cultural', 'name': 'Cultural Sites', 'name_fr': 'Sites culturels'},
        {'id': 'historic', 'name': 'Historic Sites', 'name_fr': 'Sites historiques'},
        {'id': 'art', 'name': 'Art Galleries', 'name_fr': 'Galeries d\'art'},
        {'id': 'theme_park', 'name': 'Theme Parks', 'name_fr': 'Parcs à thème'}
    ]
    
    return JsonResponse({'attraction_types': types_list})


@api_view(['GET'])
def proxy_image(request):
    """
    Proxy pour servir les images TripAdvisor avec headers CORS appropriés
    """
    try:
        image_url = request.GET.get('url')
        
        if not image_url:
            return HttpResponse('URL manquante', status=400)
        
        # Vérifier que l'URL est bien de TripAdvisor
        if 'tripadvisor.com' not in image_url:
            return HttpResponse('URL non autorisée', status=403)
        
        # Headers pour éviter les erreurs CORS et mimétiser un navigateur
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Referer': 'https://www.tripadvisor.com/'
        }
        
        # Récupérer l'image
        response = requests.get(image_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Créer la réponse avec l'image
            http_response = HttpResponse(response.content, content_type=response.headers.get('content-type', 'image/jpeg'))
            
            # Ajouter les headers CORS
            http_response['Access-Control-Allow-Origin'] = '*'
            http_response['Access-Control-Allow-Methods'] = 'GET'
            http_response['Access-Control-Allow-Headers'] = 'Content-Type'
            
            # Headers de cache
            http_response['Cache-Control'] = 'public, max-age=3600'
            
            return http_response
        else:
            return HttpResponse(f'Erreur lors de la récupération de l\'image: {response.status_code}', status=response.status_code)
    
    except Exception as e:
        logger.error(f"Erreur proxy image: {str(e)}")
        return HttpResponse(f'Erreur serveur: {str(e)}', status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AttractionPhotosView(APIView):
    """
    API pour récupérer les photos d'une attraction via TripAdvisor API
    """
    
    def get(self, request, location_id):
        try:
            logger.info(f"🔍 Récupération photos pour attraction: {location_id}")
            
            # Récupérer les photos via TripAdvisor
            photos = tripadvisor_service.get_location_photos(location_id, language="fr")
            
            if not photos:
                return Response({
                    'error': 'Aucune photo trouvée',
                    'location_id': location_id,
                    'photos': []
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Formater les photos pour le frontend
            formatted_photos = []
            for photo in photos:
                images = photo.get('images', {})
                formatted_photo = {
                    'id': photo.get('id'),
                    'caption': photo.get('caption', ''),
                    'published_date': photo.get('published_date'),
                    'urls': {
                        'thumbnail': images.get('thumbnail', {}).get('url', ''),
                        'small': images.get('small', {}).get('url', ''),
                        'medium': images.get('medium', {}).get('url', ''),
                        'large': images.get('large', {}).get('url', ''),
                        'original': images.get('original', {}).get('url', '')
                    },
                    'user': {
                        'username': photo.get('user', {}).get('username', ''),
                        'location': photo.get('user', {}).get('location', '')
                    }
                }
                formatted_photos.append(formatted_photo)
            
            logger.info(f"✅ {len(formatted_photos)} photos récupérées pour {location_id}")
            
            return Response({
                'location_id': location_id,
                'total_photos': len(formatted_photos),
                'photos': formatted_photos
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"❌ Erreur récupération photos {location_id}: {str(e)}")
            return Response({
                'error': f'Erreur lors de la récupération des photos: {str(e)}',
                'location_id': location_id,
                'photos': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== VIEWSETS POUR PERSONNE 1 & 3 =====

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les profils utilisateur (Personne 1)
    
    Endpoints:
    - GET /api/profiles/ : Liste des profils de l'utilisateur connecté
    - POST /api/profiles/ : Créer un profil pour l'utilisateur connecté
    - GET /api/profiles/{id}/ : Détail d'un profil
    - PUT/PATCH /api/profiles/{id}/ : Modifier un profil
    - DELETE /api/profiles/{id}/ : Supprimer un profil
    - GET /api/profiles/stats/ : Statistiques des profils
    """
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['profile_type', 'budget_range', 'age']
    search_fields = ['name']
    ordering_fields = ['name', 'age', 'created_at']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrer les profils par utilisateur connecté"""
        if not self.request.user.is_authenticated:
            return UserProfile.objects.none()
            
        return UserProfile.objects.filter(
            is_active=True,
            user=self.request.user
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        return UserProfileSerializer
    
    def perform_create(self, serializer):
        """Associer automatiquement le profil à l'utilisateur connecté"""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Créer un profil et retourner les données complètes"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Retourner les données complètes avec l'ID
        instance = serializer.instance
        output_serializer = UserProfileSerializer(instance)
        headers = self.get_success_headers(serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des profils utilisateur"""
        queryset = self.get_queryset()
        
        stats = {
            'total_profiles': queryset.count(),
            'profile_types_distribution': dict(
                queryset.values('profile_type').annotate(count=Count('id')).values_list('profile_type', 'count')
            ),
            'budget_ranges_distribution': dict(
                queryset.values('budget_range').annotate(count=Count('id')).values_list('budget_range', 'count')
            ),
            'average_age': queryset.aggregate(avg_age=Avg('age'))['avg_age'] or 0
        }
        
        serializer = UserProfileStatsSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def compilations(self, request, pk=None):
        """Récupérer les compilations d'un profil"""
        profile = self.get_object()
        compilations = profile.compilations.filter(is_active=True)
        serializer = CompilationListSerializer(compilations, many=True)
        return Response(serializer.data)


class CompilationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les compilations d'attractions (Personne 3)
    
    Endpoints:
    - GET /api/compilations/ : Liste des compilations
    - POST /api/compilations/ : Créer une compilation
    - GET /api/compilations/{id}/ : Détail d'une compilation
    - PUT/PATCH /api/compilations/{id}/ : Modifier une compilation
    - DELETE /api/compilations/{id}/ : Supprimer une compilation
    - POST /api/compilations/{id}/add_attraction/ : Ajouter une attraction
    - DELETE /api/compilations/{id}/remove_attraction/ : Retirer une attraction
    - GET /api/compilations/stats/ : Statistiques des compilations
    """
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['user_profile__profile_type']
    search_fields = ['name', 'description', 'user_profile__name']
    ordering_fields = ['name', 'created_at', 'updated_at', 'estimated_budget']
    ordering = ['-updated_at']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filtrer les compilations par utilisateur connecté ou retourner queryset vide si non connecté"""
        if not self.request.user.is_authenticated:
            return Compilation.objects.none()
            
        return Compilation.objects.filter(
            is_active=True,
            user_profile__user=self.request.user
        ).select_related('user_profile').prefetch_related('items__attraction')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CompilationListSerializer
        elif self.action == 'create':
            return CompilationCreateSerializer
        return CompilationSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_attraction(self, request, pk=None):
        """Ajouter une attraction à la compilation"""
        compilation = self.get_object()
        
        # Vérifier que l'utilisateur est propriétaire de la compilation
        if compilation.user_profile.user != request.user:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette compilation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        attraction_id = request.data.get('attraction_id')
        
        if not attraction_id:
            return Response(
                {'error': 'attraction_id est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si l'attraction existe déjà
        if compilation.items.filter(attraction_id=attraction_id, is_active=True).exists():
            return Response(
                {'error': 'Cette attraction est déjà dans la compilation'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer l'item
        item_data = {
            'attraction_id': attraction_id,
            'priority': request.data.get('priority', 1),
            'personal_note': request.data.get('personal_note', ''),
            'estimated_cost': request.data.get('estimated_cost')
        }
        
        serializer = CompilationItemSerializer(data=item_data)
        if serializer.is_valid():
            serializer.save(compilation=compilation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_attraction(self, request, pk=None):
        """Retirer une attraction de la compilation"""
        compilation = self.get_object()
        
        # Vérifier que l'utilisateur est propriétaire de la compilation
        if compilation.user_profile.user != request.user:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette compilation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        attraction_id = request.data.get('attraction_id')
        
        if not attraction_id:
            return Response(
                {'error': 'attraction_id est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = compilation.items.get(attraction_id=attraction_id, is_active=True)
            item.is_active = False
            item.save()
            return Response({'message': 'Attraction retirée avec succès'})
        except CompilationItem.DoesNotExist:
            return Response(
                {'error': 'Attraction non trouvée dans cette compilation'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des compilations"""
        queryset = self.get_queryset()
        
        # Calculs de base
        total_compilations = queryset.count()
        total_items = sum(compilation.total_items for compilation in queryset)
        
        # Budget moyen (nécessite itération Python)
        budgets = [compilation.estimated_budget for compilation in queryset if compilation.total_items > 0]
        average_budget = sum(budgets) / len(budgets) if budgets else 0
        
        # Catégorie la plus populaire
        category_counts = {}
        for compilation in queryset:
            for category, count in compilation.categories_breakdown.items():
                category_counts[category] = category_counts.get(category, 0) + count
        
        most_popular_category = max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else 'N/A'
        
        stats = {
            'total_compilations': total_compilations,
            'total_items': total_items,
            'average_budget': round(average_budget, 2),
            'most_popular_category': most_popular_category,
            'categories_distribution': category_counts
        }
        
        serializer = CompilationStatsSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class CompilationItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les items de compilation individuellement
    
    Endpoints:
    - GET /api/compilation-items/ : Liste des items
    - GET /api/compilation-items/{id}/ : Détail d'un item
    - PUT/PATCH /api/compilation-items/{id}/ : Modifier un item
    - DELETE /api/compilation-items/{id}/ : Supprimer un item
    """
    
    queryset = CompilationItem.objects.filter(is_active=True).select_related('compilation', 'attraction')
    serializer_class = CompilationItemSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['compilation', 'priority', 'is_visited']
    ordering_fields = ['priority', 'added_at', 'effective_cost']
    ordering = ['priority', '-added_at']
    permission_classes = [AllowAny]
    ordering_fields = ['priority', 'added_at', 'effective_cost']
    ordering = ['priority', '-added_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrer par compilation
        compilation_id = self.request.query_params.get('compilation')
        if compilation_id:
            queryset = queryset.filter(compilation_id=compilation_id)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_visited(self, request, pk=None):
        """Marquer un item comme visité"""
        item = self.get_object()
        
        # Vérifier que l'utilisateur est propriétaire de la compilation
        if item.compilation.user_profile.user != request.user:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cet item'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        item.is_visited = True
        item.visited_at = timezone.now()
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)