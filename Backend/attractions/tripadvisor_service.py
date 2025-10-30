import requests
import logging
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class TripAdvisorService:
    """
    Service réel pour l'API TripAdvisor
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'TRIPADVISOR_API_KEY', '')
        self.base_url = getattr(settings, 'TRIPADVISOR_BASE_URL', 'https://api.content.tripadvisor.com/api/v1/')
        self.headers = {
            'accept': 'application/json',
            'X-TripAdvisor-API-Key': self.api_key
        }
        
        if not self.api_key or self.api_key == "your-tripadvisor-api-key-here":
            logger.warning("TripAdvisor API key not configured properly")
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """
        Faire une requête à l'API TripAdvisor avec gestion d'erreurs
        """
        if not self.api_key or self.api_key == "your-tripadvisor-api-key-here":
            logger.error("TripAdvisor API key not configured")
            return None
        
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        try:
            logger.info(f"Making request to TripAdvisor: {url}")
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"TripAdvisor API error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
            return None
    
    def search_locations(self, query: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Rechercher des lieux avec l'API TripAdvisor
        """
        cache_key = f"tripadvisor_search_{query}_{hash(str(sorted(kwargs.items())))}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached result for search: {query}")
            return cached_result
        
        params = {
            'searchQuery': query,
            'language': 'en'
        }
        
        # Ajouter les filtres optionnels
        if kwargs.get('category'):
            params['category'] = kwargs['category']
        if kwargs.get('latLong'):
            params['latLong'] = kwargs['latLong']
        if kwargs.get('radius'):
            params['radius'] = kwargs['radius']
        
        data = self._make_request('location/search', params)
        
        if data and 'data' in data:
            result = data['data']
            # Cache pour 1 heure
            cache.set(cache_key, result, 3600)
            logger.info(f"Found {len(result)} locations for query: {query}")
            return result
        
        logger.warning(f"No results found for query: {query}")
        return []
    
    def get_location_details(self, location_id: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Récupérer les détails d'un lieu
        """
        cache_key = f"tripadvisor_details_{location_id}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached details for location: {location_id}")
            return cached_result
        
        params = {
            'language': 'en'
        }
        
        data = self._make_request(f'location/{location_id}/details', params)
        
        if data:
            # Cache pour 6 heures
            cache.set(cache_key, data, 21600)
            logger.info(f"Retrieved details for location: {location_id}")
            return data
        
        logger.warning(f"No details found for location: {location_id}")
        return None
    
    def get_location_photos(self, location_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Récupérer les photos d'un lieu
        """
        cache_key = f"tripadvisor_photos_{location_id}_{limit}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        params = {
            'language': 'en',
            'limit': limit
        }
        
        data = self._make_request(f'location/{location_id}/photos', params)
        
        if data and 'data' in data:
            result = data['data']
            # Cache pour 12 heures
            cache.set(cache_key, result, 43200)
            return result
        
        return []
    
    def get_location_reviews(self, location_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Récupérer les avis d'un lieu
        """
        cache_key = f"tripadvisor_reviews_{location_id}_{limit}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        params = {
            'language': 'en',
            'limit': limit
        }
        
        data = self._make_request(f'location/{location_id}/reviews', params)
        
        if data and 'data' in data:
            result = data['data']
            # Cache pour 2 heures
            cache.set(cache_key, result, 7200)
            return result
        
        return []
    
    def search_attractions(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Recherche d'attractions avec filtres (format compatible avec le mock)
        """
        query = filters.get('query', '')
        city = filters.get('city', '')
        country = filters.get('country', '')
        category = filters.get('category', '')
        
        # Construire la requête de recherche
        search_query = []
        if query:
            search_query.append(query)
        if city:
            search_query.append(city)
        if country:
            search_query.append(country)
            
        search_text = ' '.join(search_query) if search_query else 'attractions'
        
        # Paramètres pour TripAdvisor
        search_params = {}
        if category:
            # Mapper nos catégories vers celles de TripAdvisor
            category_mapping = {
                'restaurant': 'restaurants',
                'hotel': 'hotels', 
                'attraction': 'attractions'
            }
            search_params['category'] = category_mapping.get(category, category)
        
        # Rechercher les lieux
        locations = self.search_locations(search_text, **search_params)
        
        # Convertir au format de réponse attendu
        formatted_results = []
        for location in locations:
            formatted_location = self._format_location_for_response(location)
            if formatted_location:
                formatted_results.append(formatted_location)
        
        # Appliquer les filtres post-recherche
        filtered_results = self._apply_post_search_filters(formatted_results, filters)
        
        return filtered_results
    
    def _format_location_for_response(self, location: Dict) -> Optional[Dict]:
        """
        Convertir une location TripAdvisor au format de réponse attendu
        """
        try:
            # Extraire les coordonnées si disponibles
            latitude = None
            longitude = None
            if 'latitude' in location:
                latitude = float(location['latitude'])
            if 'longitude' in location:
                longitude = float(location['longitude'])
            
            # Extraire l'adresse
            address_obj = location.get('address_obj', {})
            
            return {
                'tripadvisor_id': location.get('location_id'),
                'name': location.get('name', ''),
                'address': address_obj.get('address_string', ''),
                'city': address_obj.get('city', ''),
                'country': address_obj.get('country', ''),
                'latitude': latitude,
                'longitude': longitude,
                'description': location.get('description', ''),
                'category': self._map_tripadvisor_category(location.get('category', {})),
                'subcategory': location.get('subcategory', ''),
                'rating': float(location.get('rating', 0)) if location.get('rating') else None,
                'num_reviews': int(location.get('num_reviews', 0)),
                'ranking': location.get('ranking_position'),
                'num_likes': int(location.get('num_reviews', 0)),  # Approximation
                'price_level': self._map_price_level(location.get('price_level')),
                'phone': location.get('phone', ''),
                'website': location.get('website', ''),
                'email': location.get('email', ''),
                'opening_hours': {},  # À enrichir avec des détails si disponibles
                'main_image': self._get_main_image(location),
                'num_photos': 0,  # À enrichir
                'awards': location.get('awards', []),
                'target_profiles': ['tourist'],  # Par défaut
                'is_active': True
            }
        except Exception as e:
            logger.error(f"Error formatting location: {e}")
            return None
    
    def _map_tripadvisor_category(self, category_obj: Dict) -> str:
        """
        Mapper les catégories TripAdvisor vers nos catégories
        """
        if not category_obj:
            return 'attraction'
            
        category_name = category_obj.get('name', '').lower()
        
        if 'restaurant' in category_name or 'food' in category_name:
            return 'restaurant'
        elif 'hotel' in category_name or 'lodging' in category_name:
            return 'hotel'
        else:
            return 'attraction'
    
    def _map_price_level(self, price_level: str) -> str:
        """
        Mapper les niveaux de prix TripAdvisor
        """
        if not price_level:
            return ''
            
        price_mapping = {
            '$': '$',
            '$$': '$$', 
            '$$$': '$$$',
            '$$$$': '$$$$'
        }
        return price_mapping.get(price_level, '')
    
    def _get_main_image(self, location: Dict) -> str:
        """
        Extraire l'image principale d'une location
        """
        if 'photo' in location and 'images' in location['photo']:
            images = location['photo']['images']
            if 'large' in images:
                return images['large']['url']
            elif 'medium' in images:
                return images['medium']['url']
            elif 'small' in images:
                return images['small']['url']
        return ''
    
    def _apply_post_search_filters(self, results: List[Dict], filters: Dict) -> List[Dict]:
        """
        Appliquer les filtres après la recherche TripAdvisor
        """
        filtered = results[:]
        
        # Filtre par note minimum
        if filters.get('min_rating'):
            filtered = [r for r in filtered if r['rating'] and r['rating'] >= filters['min_rating']]
        
        # Filtre par note maximum
        if filters.get('max_rating'):
            filtered = [r for r in filtered if r['rating'] and r['rating'] <= filters['max_rating']]
        
        # Filtre par nombre minimum de reviews
        if filters.get('min_reviews'):
            filtered = [r for r in filtered if r['num_reviews'] >= filters['min_reviews']]
        
        # Filtre par niveau de prix
        if filters.get('price_level'):
            filtered = [r for r in filtered if r['price_level'] == filters['price_level']]
        
        # Tri des résultats
        ordering = filters.get('ordering', '-num_reviews')
        reverse = ordering.startswith('-')
        field = ordering.lstrip('-')
        
        try:
            filtered.sort(key=lambda x: x.get(field, 0) or 0, reverse=reverse)
        except (TypeError, KeyError):
            pass  # Garde l'ordre original si le tri échoue
        
        return filtered
    
    def get_popular_attractions(self, country: str = None, profile: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Récupérer les attractions populaires
        """
        search_query = 'top attractions'
        if country:
            search_query += f' {country}'
        
        locations = self.search_locations(search_query, category='attractions')
        
        # Convertir au format de réponse
        formatted_results = []
        for location in locations[:limit]:
            formatted_location = self._format_location_for_response(location)
            if formatted_location:
                formatted_results.append(formatted_location)
        
        return formatted_results
    
    def get_attraction_by_id(self, attraction_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupérer une attraction par son ID
        """
        details = self.get_location_details(attraction_id)
        if details:
            return self._format_location_for_response(details)
        return None


# Instance globale du service réel
tripadvisor_real_service = TripAdvisorService()