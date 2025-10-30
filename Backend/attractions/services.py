import json
import random
from typing import List, Dict, Any
from django.conf import settings


class TripAdvisorMockService:
    """
    Service mock pour simuler l'API TripAdvisor
    Permet de développer sans dépendances externes
    """
    
    def __init__(self):
        self.base_url = getattr(settings, 'TRIPADVISOR_BASE_URL', '')
        self.api_key = getattr(settings, 'TRIPADVISOR_API_KEY', '')
        
        # Données mockées
        self.mock_attractions = self._generate_mock_attractions()
    
    def _generate_mock_attractions(self) -> List[Dict[str, Any]]:
        """Génère des attractions fictives réalistes"""
        
        # Villes avec beaucoup plus de destinations
        cities = [
            {'name': 'Paris', 'country': 'France', 'lat': 48.8566, 'lng': 2.3522},
            {'name': 'London', 'country': 'United Kingdom', 'lat': 51.5074, 'lng': -0.1278},
            {'name': 'New York', 'country': 'United States', 'lat': 40.7128, 'lng': -74.0060},
            {'name': 'Tokyo', 'country': 'Japan', 'lat': 35.6762, 'lng': 139.6503},
            {'name': 'Rome', 'country': 'Italy', 'lat': 41.9028, 'lng': 12.4964},
            {'name': 'Barcelona', 'country': 'Spain', 'lat': 41.3851, 'lng': 2.1734},
            {'name': 'Amsterdam', 'country': 'Netherlands', 'lat': 52.3676, 'lng': 4.9041},
            {'name': 'Berlin', 'country': 'Germany', 'lat': 52.5200, 'lng': 13.4050},
            {'name': 'Sydney', 'country': 'Australia', 'lat': -33.8688, 'lng': 151.2093},
            {'name': 'Bangkok', 'country': 'Thailand', 'lat': 13.7563, 'lng': 100.5018},
            {'name': 'Dubai', 'country': 'United Arab Emirates', 'lat': 25.2048, 'lng': 55.2708},
            {'name': 'Istanbul', 'country': 'Turkey', 'lat': 41.0082, 'lng': 28.9784},
            {'name': 'Prague', 'country': 'Czech Republic', 'lat': 50.0755, 'lng': 14.4378},
            {'name': 'Vienna', 'country': 'Austria', 'lat': 48.2082, 'lng': 16.3738},
            {'name': 'Lisbon', 'country': 'Portugal', 'lat': 38.7223, 'lng': -9.1393},
            {'name': 'Copenhagen', 'country': 'Denmark', 'lat': 55.6761, 'lng': 12.5683},
            {'name': 'Stockholm', 'country': 'Sweden', 'lat': 59.3293, 'lng': 18.0686},
            {'name': 'Oslo', 'country': 'Norway', 'lat': 59.9139, 'lng': 10.7522},
            {'name': 'Zurich', 'country': 'Switzerland', 'lat': 47.3769, 'lng': 8.5417},
            {'name': 'Brussels', 'country': 'Belgium', 'lat': 50.8503, 'lng': 4.3517},
        ]
        
        # Catégories beaucoup plus détaillées
        categories = {
            'restaurant': {
                'names': [
                    'Le Petit Bistro', 'Sakura Sushi', 'Pizza Corner', 'Burger Palace', 'Thai Garden',
                    'Chez Marie', 'Dragon Wok', 'Bella Vista', 'The Steakhouse', 'Curry House',
                    'La Brasserie', 'Ramen Bar', 'Tapas Lounge', 'BBQ Station', 'Café Central',
                    'The Wine Cellar', 'Seafood Palace', 'Vegetarian Delight', 'Street Food Market', 'Fine Dining'
                ],
                'cuisines': ['French', 'Japanese', 'Italian', 'American', 'Thai', 'Chinese', 'Indian', 'Spanish', 'German', 'Mexican']
            },
            'hotel': {
                'names': [
                    'Grand Hotel Royal', 'Boutique Inn Central', 'City Center Plaza', 'Luxury Resort Spa', 'Budget Lodge Express',
                    'Historic Palace Hotel', 'Modern Business Tower', 'Cozy B&B', 'Airport Hotel', 'Seaside Resort',
                    'Mountain Lodge', 'Urban Hostel', 'Executive Suites', 'Family Resort', 'Design Hotel'
                ],
                'styles': ['Luxury', 'Boutique', 'Business', 'Resort', 'Budget', 'Historic', 'Modern', 'Family', 'Eco-friendly', 'Design']
            },
            'attraction': {
                'names': [
                    'National Art Museum', 'Historic Cathedral', 'Central City Park', 'Ancient Castle', 'Modern Art Gallery',
                    'Science Museum', 'Botanical Gardens', 'Old Town Square', 'Royal Palace', 'Archaeological Site',
                    'Observation Tower', 'Aquarium', 'Zoo', 'Amusement Park', 'Beach Promenade',
                    'Historic Bridge', 'Concert Hall', 'Opera House', 'Markets', 'Monuments'
                ],
                'groups': ['Museums', 'Outdoor Activities', 'Historical Sites', 'Entertainment', 'Cultural', 'Architecture', 'Nature', 'Shopping']
            }
        }
        
        # Images par catégorie
        images_by_category = {
            'restaurant': [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
            ],
            'hotel': [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
            ],
            'attraction': [
                'https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&h=300&fit=crop',
            ]
        }
        
        attractions = []
        for i in range(500):  # Générer 500 attractions pour avoir beaucoup de contenu
            city = random.choice(cities)
            category = random.choice(list(categories.keys()))
            
            # Variation de position autour de la ville
            lat_offset = random.uniform(-0.1, 0.1)
            lng_offset = random.uniform(-0.1, 0.1)
            
            # Noms plus réalistes selon la catégorie
            base_name = random.choice(categories[category]['names'])
            if category == 'restaurant':
                cuisine = random.choice(categories[category]['cuisines'])
                name = f"{base_name} - {cuisine} Cuisine"
            elif category == 'hotel':
                style = random.choice(categories[category]['styles'])
                name = f"{base_name} {style}"
            else:
                group = random.choice(categories[category]['groups'])
                name = f"{city['name']} {base_name}"
            
            # Ratings plus réalistes avec distribution
            if random.random() < 0.1:  # 10% d'excellentes attractions
                rating = round(random.uniform(4.7, 5.0), 1)
                num_reviews = random.randint(1000, 10000)
                num_likes = random.randint(2000, 50000)
            elif random.random() < 0.3:  # 30% de très bonnes
                rating = round(random.uniform(4.0, 4.6), 1)
                num_reviews = random.randint(500, 2000)
                num_likes = random.randint(500, 5000)
            else:  # 60% de bonnes à correctes
                rating = round(random.uniform(3.0, 4.0), 1)
                num_reviews = random.randint(10, 800)
                num_likes = random.randint(50, 1000)
            
            # Prix selon la catégorie et la qualité
            if category == 'hotel':
                if rating >= 4.5:
                    price_level = random.choice(['$$$', '$$$$'])
                elif rating >= 3.8:
                    price_level = random.choice(['$$', '$$$'])
                else:
                    price_level = random.choice(['$', '$$'])
            elif category == 'restaurant':
                if rating >= 4.5:
                    price_level = random.choice(['$$', '$$$', '$$$$'])
                elif rating >= 3.8:
                    price_level = random.choice(['$', '$$', '$$$'])
                else:
                    price_level = random.choice(['$', '$$'])
            else:  # attractions
                price_level = random.choice(['', '$', '$$'])  # Beaucoup sont gratuites
            
            attraction = {
                'tripadvisor_id': f'mock_{i}',
                'name': name,
                'address': f"{random.randint(1, 999)} {random.choice(['Main', 'Central', 'Royal', 'Park', 'Market'])} {random.choice(['Street', 'Avenue', 'Road', 'Boulevard', 'Square'])}",
                'city': city['name'],
                'country': city['country'],
                'latitude': city['lat'] + lat_offset,
                'longitude': city['lng'] + lng_offset,
                'description': self._generate_description(category, name, city['name']),
                'category': category,
                'subcategory': random.choice(categories[category].get('groups', categories[category].get('styles', categories[category].get('cuisines', [category])))),
                'rating': rating,
                'num_reviews': num_reviews,
                'ranking': random.randint(1, min(100, num_reviews // 10)) if num_reviews > 50 else None,
                'num_likes': num_likes,
                'price_level': price_level,
                'phone': f"+{random.choice(['33', '44', '1', '81', '39', '34', '31', '49', '61', '66'])} {random.randint(1, 9)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}",
                'website': f"https://www.{base_name.lower().replace(' ', '').replace(',', '')}{random.randint(1, 999)}.com",
                'email': f"info@{base_name.lower().replace(' ', '').replace(',', '')}{random.randint(1, 999)}.com",
                'opening_hours': self._generate_opening_hours(category),
                'main_image': random.choice(images_by_category[category]) if random.random() > 0.1 else f"https://picsum.photos/400/300?random={i}",
                'num_photos': random.randint(3, 80),
                'awards': self._generate_awards(rating, num_reviews),
                'target_profiles': self._generate_target_profiles(category, rating),
                'is_active': True
            }
            
            # Ajouter les champs spécifiques selon le type
            if category == 'restaurant':
                attraction['cuisine_type'] = random.choice(categories[category]['cuisines'])
            elif category == 'hotel':
                attraction['hotel_style'] = random.choice(categories[category]['styles'])
            elif category == 'attraction':
                attraction['attraction_groups'] = random.choice(categories[category]['groups'])
            
            attractions.append(attraction)
        
        return attractions
    
    def _generate_description(self, category, name, city):
        """Génère une description réaliste selon la catégorie"""
        descriptions = {
            'restaurant': [
                f"Découvrez {name}, un restaurant exceptionnel au cœur de {city}. Notre chef propose une cuisine authentique dans un cadre élégant.",
                f"Situé dans le centre de {city}, {name} vous offre une expérience culinaire unique avec des produits frais de saison.",
                f"Venez savourer une cuisine raffinée chez {name}, où tradition et modernité se rencontrent dans chaque plat."
            ],
            'hotel': [
                f"Séjournez au {name}, un établissement de charme situé au cœur de {city}. Confort et élégance vous attendent.",
                f"Le {name} vous accueille dans un cadre exceptionnel à {city}. Profitez de nos services haut de gamme.",
                f"Découvrez l'hospitalité du {name}, votre refuge de luxe au centre de {city}."
            ],
            'attraction': [
                f"Visitez {name}, l'une des attractions incontournables de {city}. Une expérience inoubliable vous attend.",
                f"Explorez {name} et découvrez les merveilles de {city}. Un lieu chargé d'histoire et de beauté.",
                f"Ne manquez pas {name} lors de votre séjour à {city}. Une attraction emblématique à découvrir absolument."
            ]
        }
        return random.choice(descriptions[category])
    
    def _generate_opening_hours(self, category):
        """Génère des horaires d'ouverture réalistes"""
        if category == 'restaurant':
            return {
                'monday': '12:00-14:30, 19:00-23:00',
                'tuesday': '12:00-14:30, 19:00-23:00', 
                'wednesday': '12:00-14:30, 19:00-23:00',
                'thursday': '12:00-14:30, 19:00-23:00',
                'friday': '12:00-14:30, 19:00-00:00',
                'saturday': '12:00-14:30, 19:00-00:00',
                'sunday': random.choice(['Fermé', '12:00-14:30, 19:00-22:00'])
            }
        elif category == 'hotel':
            return {
                'monday': '24h/24', 'tuesday': '24h/24', 'wednesday': '24h/24',
                'thursday': '24h/24', 'friday': '24h/24', 'saturday': '24h/24', 'sunday': '24h/24'
            }
        else:  # attractions
            return {
                'monday': '09:00-18:00', 'tuesday': '09:00-18:00', 'wednesday': '09:00-18:00',
                'thursday': '09:00-18:00', 'friday': '09:00-20:00', 'saturday': '10:00-20:00',
                'sunday': '10:00-18:00'
            }
    
    def _generate_awards(self, rating, num_reviews):
        """Génère des prix selon la qualité"""
        awards = []
        if rating >= 4.8 and num_reviews >= 1000:
            awards.extend(['Travellers Choice 2024', 'Hall of Fame'])
        elif rating >= 4.5 and num_reviews >= 500:
            awards.append('Travellers Choice 2024')
        elif rating >= 4.0 and num_reviews >= 100:
            awards.append('Certificate of Excellence')
        return awards
    
    def _generate_target_profiles(self, category, rating):
        """Génère les profils cibles selon la catégorie et qualité"""
        if category == 'hotel':
            if rating >= 4.5:
                return ['tourist', 'professional']
            else:
                return ['tourist', 'local']
        elif category == 'restaurant':
            if rating >= 4.0:
                return ['tourist', 'local', 'professional']
            else:
                return ['local', 'tourist']
        else:  # attractions
            return ['tourist', 'local']
    
    def search_attractions(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recherche d'attractions avec filtres"""
        
        results = self.mock_attractions.copy()
        
        # Filtrer par query (nom, description, ville ou pays)
        if filters.get('query'):
            query = filters['query'].lower()
            results = [
                a for a in results 
                if query in a['name'].lower() 
                or query in a['description'].lower()
                or query in a['city'].lower()
                or query in a['country'].lower()
            ]
        
        # Filtrer par catégorie
        if filters.get('category'):
            results = [a for a in results if a['category'] == filters['category']]
        
        # Filtrer par ville (recherche partielle)
        if filters.get('city'):
            city_query = filters['city'].lower()
            results = [a for a in results if city_query in a['city'].lower()]
        
        # Filtrer par pays (recherche partielle)
        if filters.get('country'):
            country_query = filters['country'].lower()
            results = [a for a in results if country_query in a['country'].lower()]
        
        # Filtrer par note minimum
        if filters.get('min_rating'):
            results = [a for a in results if a['rating'] >= filters['min_rating']]
        
        # Filtrer par note maximum
        if filters.get('max_rating'):
            results = [a for a in results if a['rating'] <= filters['max_rating']]
        
        # Filtrer par nombre minimum de reviews
        if filters.get('min_reviews'):
            results = [a for a in results if a['num_reviews'] >= filters['min_reviews']]
        
        # Filtrer par nombre minimum de photos
        if filters.get('min_photos'):
            results = [a for a in results if a['num_photos'] >= filters['min_photos']]
        
        # Filtrer par niveau de prix
        if filters.get('price_level'):
            results = [a for a in results if a['price_level'] == filters['price_level']]
        
        # Filtrer par profil utilisateur
        if filters.get('profile'):
            results = [a for a in results if filters['profile'] in a['target_profiles']]
        
        # Filtrer par géolocalisation (rayon)
        if all(key in filters for key in ['latitude', 'longitude', 'radius']):
            results = self._filter_by_distance(
                results, 
                filters['latitude'], 
                filters['longitude'], 
                filters['radius']
            )
        
        # Trier les résultats
        ordering = filters.get('ordering', '-num_likes')
        reverse = ordering.startswith('-')
        field = ordering.lstrip('-')
        
        results.sort(key=lambda x: x.get(field, 0), reverse=reverse)
        
        return results
    
    def _filter_by_distance(self, attractions: List[Dict], lat: float, lng: float, radius: float) -> List[Dict]:
        """Filtre les attractions par distance (simplification sans vraie géolocalisation)"""
        import math
        
        def calculate_distance(lat1, lng1, lat2, lng2):
            # Formule de Haversine simplifiée
            R = 6371  # Rayon de la Terre en km
            dlat = math.radians(lat2 - lat1)
            dlng = math.radians(lng2 - lng1)
            a = (math.sin(dlat/2) * math.sin(dlat/2) + 
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
                 math.sin(dlng/2) * math.sin(dlng/2))
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c
        
        filtered = []
        for attraction in attractions:
            if attraction['latitude'] and attraction['longitude']:
                distance = calculate_distance(
                    lat, lng,
                    attraction['latitude'], attraction['longitude']
                )
                if distance <= radius:
                    filtered.append(attraction)
        
        return filtered
    
    def get_popular_attractions(self, country: str = None, profile: str = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Récupère les attractions les plus populaires"""
        
        results = self.mock_attractions.copy()
        
        if country:
            results = [a for a in results if a['country'].lower() == country.lower()]
        
        if profile:
            results = [a for a in results if profile in a['target_profiles']]
        
        # Trier par popularité (num_likes)
        results.sort(key=lambda x: x['num_likes'], reverse=True)
        
        return results[:limit]
    
    def get_attraction_by_id(self, attraction_id: str) -> Dict[str, Any]:
        """Récupère une attraction par son ID"""
        for attraction in self.mock_attractions:
            if attraction['tripadvisor_id'] == attraction_id:
                return attraction
        return None


# Instance globale du service mock
tripadvisor_service = TripAdvisorMockService()