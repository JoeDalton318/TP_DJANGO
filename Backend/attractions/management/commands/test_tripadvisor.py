from django.core.management.base import BaseCommand
from django.conf import settings
from attractions.tripadvisor_service import tripadvisor_real_service


class Command(BaseCommand):
    help = 'Test de la connexion à l\'API TripAdvisor'

    def handle(self, *args, **options):
        """Test principal"""
        self.stdout.write("🚀 Tests de l'API TripAdvisor")
        self.stdout.write("=" * 50)
        
        # Test de configuration
        if not self.test_api_configuration():
            self.stdout.write(
                self.style.ERROR("\n❌ Configuration invalide. Vérifiez votre clé API dans le fichier .env")
            )
            return
        
        # Test de recherche
        location_id = self.test_search_locations()
        
        # Test des détails
        self.test_location_details(location_id)
        
        # Test des fonctions d'attraction
        self.test_search_attractions()
        self.test_popular_attractions()
        
        self.stdout.write(self.style.SUCCESS("\n✅ Tests terminés!"))

    def test_api_configuration(self):
        """Test de la configuration de l'API"""
        self.stdout.write("🔧 Test de configuration TripAdvisor API...")
        
        api_key = getattr(settings, 'TRIPADVISOR_API_KEY', '')
        base_url = getattr(settings, 'TRIPADVISOR_BASE_URL', '')
        
        self.stdout.write(f"   API Key configurée: {'✅ Oui' if api_key and api_key != 'your-tripadvisor-api-key-here' else '❌ Non'}")
        self.stdout.write(f"   Base URL: {base_url}")
        
        return api_key and api_key != 'your-tripadvisor-api-key-here'

    def test_search_locations(self):
        """Test de recherche de lieux"""
        self.stdout.write("\n🔍 Test de recherche de lieux...")
        
        try:
            results = tripadvisor_real_service.search_locations("Paris attractions")
            
            if results:
                self.stdout.write(f"   ✅ {len(results)} résultats trouvés")
                
                # Afficher le premier résultat
                if results:
                    first = results[0]
                    self.stdout.write(f"   Premier résultat: {first.get('name', 'N/A')}")
                    self.stdout.write(f"   Location ID: {first.get('location_id', 'N/A')}")
                    self.stdout.write(f"   Catégorie: {first.get('category', {}).get('name', 'N/A')}")
                    
                    return first.get('location_id')
            else:
                self.stdout.write("   ❌ Aucun résultat trouvé")
                return None
                
        except Exception as e:
            self.stdout.write(f"   ❌ Erreur: {e}")
            return None

    def test_location_details(self, location_id):
        """Test de récupération des détails"""
        if not location_id:
            return
            
        self.stdout.write(f"\n📋 Test des détails pour location_id: {location_id}...")
        
        try:
            details = tripadvisor_real_service.get_location_details(location_id)
            
            if details:
                self.stdout.write("   ✅ Détails récupérés")
                self.stdout.write(f"   Nom: {details.get('name', 'N/A')}")
                description = details.get('description', 'N/A')
                if description and len(description) > 100:
                    description = description[:100] + "..."
                self.stdout.write(f"   Description: {description}")
                self.stdout.write(f"   Note: {details.get('rating', 'N/A')}")
                self.stdout.write(f"   Nombre d'avis: {details.get('num_reviews', 'N/A')}")
            else:
                self.stdout.write("   ❌ Impossible de récupérer les détails")
                
        except Exception as e:
            self.stdout.write(f"   ❌ Erreur: {e}")

    def test_search_attractions(self):
        """Test de la fonction search_attractions"""
        self.stdout.write("\n🎯 Test de search_attractions...")
        
        try:
            filters = {
                'query': 'restaurants',
                'city': 'Paris'
            }
            
            results = tripadvisor_real_service.search_attractions(filters)
            
            if results:
                self.stdout.write(f"   ✅ {len(results)} attractions trouvées")
                
                # Afficher les premières attractions
                for i, attraction in enumerate(results[:3]):
                    self.stdout.write(f"   {i+1}. {attraction.get('name', 'N/A')} - {attraction.get('category', 'N/A')}")
            else:
                self.stdout.write("   ❌ Aucune attraction trouvée")
                
        except Exception as e:
            self.stdout.write(f"   ❌ Erreur: {e}")

    def test_popular_attractions(self):
        """Test des attractions populaires"""
        self.stdout.write("\n⭐ Test des attractions populaires...")
        
        try:
            results = tripadvisor_real_service.get_popular_attractions(country="France", limit=5)
            
            if results:
                self.stdout.write(f"   ✅ {len(results)} attractions populaires trouvées")
                
                for i, attraction in enumerate(results):
                    self.stdout.write(f"   {i+1}. {attraction.get('name', 'N/A')} - {attraction.get('city', 'N/A')}")
            else:
                self.stdout.write("   ❌ Aucune attraction populaire trouvée")
                
        except Exception as e:
            self.stdout.write(f"   ❌ Erreur: {e}")