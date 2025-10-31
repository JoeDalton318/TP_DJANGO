import requests
import logging
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class TripAdvisorService:
    """
    Service réel pour l'API TripAdvisor basé sur la documentation officielle
    """
    
    def __init__(self):
        # Clé API fournie par l'utilisateur
        self.api_key = "EB3C18394FB747BCA1801E5AAB48A962"
        self.base_url = "https://api.content.tripadvisor.com/api/v1"
        self.headers = {
            'accept': 'application/json'
        }
        logger.info("TripAdvisor Service initialized with API key")
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """
        Faire une requête à l'API TripAdvisor avec gestion d'erreurs
        """
        url = f"{self.base_url}/{endpoint}"
        
        # Ajouter la clé API aux paramètres
        if params is None:
            params = {}
        params['key'] = self.api_key
        
        try:
            logger.info(f"TripAdvisor API Request: {url} with params: {params}")
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"TripAdvisor API Response: {len(data.get('data', []))} items received")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"TripAdvisor API error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
            return None
    
    def search_locations(self, search_query: str, language: str = "fr") -> List[Dict[str, Any]]:
        """
        Rechercher des lieux selon la documentation officielle
        Format: GET /location/search?searchQuery=paris&language=en&key=API_KEY
        """
        cache_key = f"tripadvisor_search_{search_query}_{language}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached search result for: {search_query}")
            return cached_result
        
        params = {
            'searchQuery': search_query,
            'language': language
        }
        
        data = self._make_request('location/search', params)
        
        if data and 'data' in data:
            result = data['data']
            # Cache pour 1 heure
            cache.set(cache_key, result, 3600)
            logger.info(f"Found {len(result)} locations for query: {search_query}")
            return result
        
        logger.warning(f"No results found for query: {search_query}")
        return []
    
    def get_location_details(self, location_id: str, language: str = "fr", currency: str = "EUR") -> Optional[Dict[str, Any]]:
        """
        Récupérer les détails d'un lieu selon la documentation officielle
        Format: GET /location/{location_id}/details?language=fr&currency=USD&key=API_KEY
        """
        cache_key = f"tripadvisor_details_{location_id}_{language}_{currency}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached details for location: {location_id}")
            return cached_result
        
        params = {
            'language': language,
            'currency': currency
        }
        
        data = self._make_request(f'location/{location_id}/details', params)
        
        if data:
            # Cache pour 6 heures
            cache.set(cache_key, data, 21600)
            logger.info(f"Retrieved details for location: {location_id}")
            return data
        
        logger.warning(f"No details found for location: {location_id}")
        return None
    
    def get_location_photos(self, location_id: str, language: str = "en") -> List[Dict[str, Any]]:
        """
        Récupérer les photos d'un lieu selon la documentation officielle
        Format: GET /location/{location_id}/photos?language=en&key=API_KEY
        """
        cache_key = f"tripadvisor_photos_{location_id}_{language}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        params = {
            'language': language
        }
        
        data = self._make_request(f'location/{location_id}/photos', params)
        
        if data and 'data' in data:
            result = data['data']
            # Cache pour 12 heures
            cache.set(cache_key, result, 43200)
            return result
        
        return []
    
    def search_attractions_by_query(self, query: str, **filters) -> List[Dict[str, Any]]:
        """
        Recherche d'attractions avec enrichissement des données
        """
        logger.info(f"🔍 search_attractions_by_query appelé avec query='{query}', filters={filters}")
        
        # 1. Recherche initiale
        locations = self.search_locations(query, language="fr")
        logger.info(f"📋 search_locations retourné {len(locations)} résultats")
        
        if not locations:
            logger.warning(f"⚠️ Aucun résultat pour query='{query}'")
            return []
        
        # 2. Enrichir chaque location avec ses détails et photos
        enriched_attractions = []
        for i, location in enumerate(locations[:20]):  # Limiter pour éviter trop d'appels API
            logger.info(f"🏛️ Traitement attraction {i+1}/{min(len(locations), 20)}: {location.get('name')}")
            
            location_id = location.get('location_id')
            if not location_id:
                logger.warning(f"   ⚠️ Pas de location_id pour {location.get('name')}")
                continue
                
            # Récupérer les détails complets
            details = self.get_location_details(location_id, language="fr")
            photos = self.get_location_photos(location_id)
            
            logger.info(f"   📋 Détails: {'✅' if details else '❌'}, Photos: {len(photos) if photos else 0}")
            
            # Formater l'attraction
            attraction = self._format_attraction(location, details, photos)
            if attraction:
                enriched_attractions.append(attraction)
                logger.info(f"   ✅ Attraction formatée: {attraction.get('name')}")
            else:
                logger.warning(f"   ❌ Échec formatage pour {location.get('name')}")
        
        logger.info(f"🎯 {len(enriched_attractions)} attractions enrichies avant filtrage")
        
        # 3. Appliquer les filtres
        filtered_attractions = self._apply_filters(enriched_attractions, filters)
        
        logger.info(f"✅ {len(filtered_attractions)} attractions après filtrage")
        return filtered_attractions
    
    def get_popular_attractions(self, country: str = "France", limit: int = 20) -> List[Dict[str, Any]]:
        """
        Récupérer les attractions populaires d'un pays
        """
        # Rechercher les attractions populaires du pays
        query = f"top attractions {country}"
        return self.search_attractions_by_query(query)[:limit]
    
    def get_attraction_by_id(self, location_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupérer une attraction complète par son ID
        """
        # Récupérer les détails
        details = self.get_location_details(location_id, language="fr")
        if not details:
            return None
            
        # Récupérer les photos
        photos = self.get_location_photos(location_id)
        
        # Formater l'attraction
        return self._format_attraction(details, details, photos)
    
    def _format_attraction(self, basic_info: Dict, details: Dict = None, photos: List[Dict] = None) -> Optional[Dict]:
        """
        Formater une attraction selon les données de l'API TripAdvisor
        """
        try:
            logger.info(f"🔧 _format_attraction appelé avec: basic_info={bool(basic_info)}, details={bool(details)}, photos={len(photos) if photos else 0}")
            
            # Utiliser les détails si disponibles, sinon les infos de base
            data = details if details else basic_info
            
            if not data:
                logger.error("❌ Aucune donnée fournie pour le formatage")
                return None
                
            logger.info(f"📋 Formatage avec data.keys(): {list(data.keys())[:10]}")  # Premiers 10 champs
            
            # Extraire l'adresse (format de l'API officielle)
            address_obj = data.get('address_obj', {})
            
            # Extraire la première photo si disponible
            main_image = ""
            if photos and len(photos) > 0:
                first_photo = photos[0]
                images = first_photo.get('images', {})
                if 'large' in images:
                    main_image = images['large']['url']
                elif 'medium' in images:
                    main_image = images['medium']['url']
                elif 'small' in images:
                    main_image = images['small']['url']
            
            # Formater selon le modèle Django attendu
            attraction = {
                'id': data.get('location_id'),
                'tripadvisor_id': data.get('location_id'),
                'name': data.get('name', ''),
                'description': data.get('description', ''),
                'address': address_obj.get('address_string', ''),
                'city': address_obj.get('city', ''),
                'country': address_obj.get('country', ''),
                'latitude': self._safe_float(data.get('latitude')),
                'longitude': self._safe_float(data.get('longitude')),
                'category': self._map_category(data.get('category', {})),
                'subcategory': self._extract_subcategory(data.get('subcategory', [])),
                'rating': self._safe_float(data.get('rating')),
                'num_reviews': self._safe_int(data.get('num_reviews')),
                'ranking': self._extract_ranking(data.get('ranking_data', {})),
                'price_level': data.get('price_level', ''),
                'phone': data.get('phone', ''),
                'website': data.get('web_url', ''),
                'timezone': data.get('timezone', ''),
                'main_image': main_image,
                'num_photos': self._safe_int(data.get('photo_count', len(photos) if photos else 0)),
                'amenities': self._safe_list(data.get('amenities')),
                'awards': self._safe_list(data.get('awards')),
                'styles': self._safe_list(data.get('styles')),
                'trip_types': self._safe_list(data.get('trip_types')),
                'subratings': self._safe_dict(data.get('subratings')),
                'is_active': True,
                'created_at': None,
                'updated_at': None
            }
            
            logger.info(f"✅ Attraction formatée: {attraction.get('name')} (ID: {attraction.get('id')})")
            return attraction
            
        except Exception as e:
            logger.error(f"❌ Erreur formatage attraction: {e}")
            import traceback
            logger.error(f"📋 Stack trace: {traceback.format_exc()}")
            return None
    
    def _map_category(self, category_obj: Dict) -> str:
        """
        Mapper les catégories TripAdvisor
        """
        if not category_obj:
            return 'attraction'
            
        category_name = category_obj.get('name', '').lower()
        
        # Mapping basé sur la documentation TripAdvisor
        if 'hotel' in category_name:
            return 'hotel'
        elif 'restaurant' in category_name:
            return 'restaurant'
        else:
            return 'attraction'
    
    def _extract_subcategory(self, subcategory_list: List[Dict]) -> str:
        """
        Extraire la sous-catégorie principale
        """
        if subcategory_list and len(subcategory_list) > 0:
            return subcategory_list[0].get('localized_name', '')
        return ''
    
    def _extract_ranking(self, ranking_data: Dict) -> int:
        """
        Extraire le classement
        """
        try:
            return int(ranking_data.get('ranking', 0))
        except (ValueError, TypeError):
            return 0
    
    def _format_awards(self, awards_list: List[Dict]) -> List[str]:
        """
        Formater les récompenses
        """
        return [award.get('display_name', '') for award in awards_list if award.get('display_name')]
    
    def _format_trip_types(self, trip_types_list: List[Dict]) -> List[str]:
        """
        Formater les types de voyage
        """
        return [trip.get('localized_name', '') for trip in trip_types_list if trip.get('localized_name')]
    
    def _format_subratings(self, subratings_dict: Dict) -> Dict[str, float]:
        """
        Formater les sous-notes
        """
        formatted = {}
        for key, rating_data in subratings_dict.items():
            if isinstance(rating_data, dict) and 'value' in rating_data:
                try:
                    formatted[rating_data.get('localized_name', key)] = float(rating_data['value'])
                except (ValueError, TypeError):
                    pass
        return formatted
    
    def _safe_float(self, value) -> Optional[float]:
        """
        Conversion sécurisée vers float
        """
        if value is None or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _safe_int(self, value) -> int:
        """
        Conversion sécurisée vers int
        """
        if value is None or value == '':
            return 0
        try:
            return int(value)
        except (ValueError, TypeError):
            return 0
    
    def _safe_list(self, value) -> List:
        """
        Conversion sécurisée vers liste
        """
        if isinstance(value, list):
            return value
        return []
    
    def _safe_dict(self, value) -> Dict:
        """
        Conversion sécurisée vers dictionnaire
        """
        if isinstance(value, dict):
            return value
        return {}
    
    def _apply_filters(self, attractions: List[Dict], filters: Dict) -> List[Dict]:
        """
        Appliquer les filtres aux attractions
        """
        filtered = attractions[:]
        
        # Filtre par ville
        if filters.get('city'):
            filtered = [a for a in filtered if filters['city'].lower() in a['city'].lower()]
        
        # Filtre par pays
        if filters.get('country'):
            filtered = [a for a in filtered if filters['country'].lower() in a['country'].lower()]
        
        # Filtre par catégorie
        if filters.get('category'):
            filtered = [a for a in filtered if a['category'] == filters['category']]
        
        # Filtre par note minimum
        if filters.get('min_rating'):
            try:
                min_rating = float(filters['min_rating'])
                filtered = [a for a in filtered if a['rating'] and a['rating'] >= min_rating]
            except (ValueError, TypeError):
                pass
        
        # Filtre par note maximum
        if filters.get('max_rating'):
            try:
                max_rating = float(filters['max_rating'])
                filtered = [a for a in filtered if a['rating'] and a['rating'] <= max_rating]
            except (ValueError, TypeError):
                pass
        
        # Filtre par nombre minimum d'avis
        if filters.get('min_reviews'):
            try:
                min_reviews = int(filters['min_reviews'])
                filtered = [a for a in filtered if a['num_reviews'] >= min_reviews]
            except (ValueError, TypeError):
                pass
        
        # Filtre par niveau de prix
        if filters.get('price_level'):
            filtered = [a for a in filtered if a['price_level'] == filters['price_level']]
        
        # Tri des résultats
        ordering = filters.get('ordering', '-num_reviews')
        reverse = ordering.startswith('-')
        field = ordering.lstrip('-')
        
        # Mapping des champs de tri
        sort_field_mapping = {
            'rating': 'rating',
            'num_reviews': 'num_reviews',
            'ranking': 'ranking',
            'name': 'name'
        }
        
        if field in sort_field_mapping:
            try:
                filtered.sort(
                    key=lambda x: x.get(sort_field_mapping[field]) or (0 if field != 'name' else ''),
                    reverse=reverse
                )
            except TypeError:
                pass  # Garde l'ordre original si le tri échoue
        
        return filtered


# Instance globale du service
tripadvisor_service = TripAdvisorService()