"""
Script pour créer des données de test pour l'application
"""
import os
import sys
import django

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_app.settings')
django.setup()

from attractions.models import UserProfile, Compilation, CompilationItem, Attraction

def create_test_data():
    print("🚀 Création des données de test...")
    
    # 1. Créer des profils utilisateur
    profiles_data = [
        {
            'name': 'Marie Dupont',
            'age': 28,
            'profile_type': 'tourist',
            'budget_range': 'medium',
            'budget_amount': 300,
            'preferred_categories': ['attraction', 'restaurant'],
            'preferred_countries': ['France', 'Italie'],
            'preferred_price_levels': ['$$', '$$$']
        },
        {
            'name': 'Jean Martin',
            'age': 45,
            'profile_type': 'professional',
            'budget_range': 'high',
            'budget_amount': 800,
            'preferred_categories': ['hotel', 'restaurant'],
            'preferred_countries': ['France', 'Allemagne'],
            'preferred_price_levels': ['$$$', '$$$$']
        },
        {
            'name': 'Sophie Leroy',
            'age': 22,
            'profile_type': 'local',
            'budget_range': 'low',
            'budget_amount': 80,
            'preferred_categories': ['attraction'],
            'preferred_countries': ['France'],
            'preferred_price_levels': ['$', '$$']
        }
    ]
    
    created_profiles = []
    for profile_data in profiles_data:
        profile, created = UserProfile.objects.get_or_create(
            name=profile_data['name'],
            defaults=profile_data
        )
        if created:
            print(f"✅ Profil créé : {profile.name} ({profile.get_profile_type_display()})")
        else:
            print(f"📋 Profil existant : {profile.name}")
        created_profiles.append(profile)
    
    # 2. Créer quelques attractions de test
    attractions_data = [
        {
            'name': 'Tour Eiffel',
            'city': 'Paris',
            'country': 'France',
            'category': 'attraction',
            'subcategory': 'Monument',
            'rating': 4.5,
            'num_reviews': 50000,
            'price_level': '$$',
            'description': 'Monument emblématique de Paris',
            'latitude': 48.8584,
            'longitude': 2.2945
        },
        {
            'name': 'Le Bristol Paris',
            'city': 'Paris',
            'country': 'France',
            'category': 'hotel',
            'subcategory': 'Hôtel de luxe',
            'rating': 4.8,
            'num_reviews': 2500,
            'price_level': '$$$$',
            'description': 'Hôtel palace parisien',
            'latitude': 48.8704,
            'longitude': 2.3164
        },
        {
            'name': 'Restaurant Le Comptoir',
            'city': 'Paris',
            'country': 'France',
            'category': 'restaurant',
            'subcategory': 'Cuisine française',
            'rating': 4.3,
            'num_reviews': 800,
            'price_level': '$$$',
            'description': 'Restaurant gastronomique français',
            'latitude': 48.8534,
            'longitude': 2.3398
        }
    ]
    
    created_attractions = []
    for attraction_data in attractions_data:
        attraction, created = Attraction.objects.get_or_create(
            name=attraction_data['name'],
            city=attraction_data['city'],
            defaults=attraction_data
        )
        if created:
            print(f"✅ Attraction créée : {attraction.name}")
        else:
            print(f"📋 Attraction existante : {attraction.name}")
        created_attractions.append(attraction)
    
    # 3. Créer des compilations pour chaque profil
    for i, profile in enumerate(created_profiles):
        compilation, created = Compilation.objects.get_or_create(
            name=f"Compilation de {profile.name}",
            user_profile=profile,
            defaults={
                'description': f"Liste personnalisée d'attractions pour {profile.name}"
            }
        )
        
        if created:
            print(f"✅ Compilation créée : {compilation.name}")
            
            # Ajouter quelques attractions à chaque compilation
            for j, attraction in enumerate(created_attractions[:2]):  # 2 attractions par compilation
                item, item_created = CompilationItem.objects.get_or_create(
                    compilation=compilation,
                    attraction=attraction,
                    defaults={
                        'priority': j + 1,
                        'personal_note': f"Note de {profile.name} sur {attraction.name}"
                    }
                )
                if item_created:
                    print(f"  📌 Ajouté : {attraction.name}")
        else:
            print(f"📋 Compilation existante : {compilation.name}")
    
    print("\n🎉 Données de test créées avec succès !")
    print(f"📊 Profils : {UserProfile.objects.count()}")
    print(f"📊 Attractions : {Attraction.objects.count()}")
    print(f"📊 Compilations : {Compilation.objects.count()}")
    print(f"📊 Items de compilation : {CompilationItem.objects.count()}")

if __name__ == '__main__':
    create_test_data()