# users/profile_logic.py

"""
Logique métier différenciée selon les types de profils utilisateurs

TOURIST (Touriste):
- Objectif: Découvrir les attractions populaires
- Accès: Attractions touristiques, monuments, restaurants populaires
- Limite compilation: 30 attractions
- Recommandations: Basées sur la popularité et les avis
- Filtres suggérés: Prix modéré, attractions familiales

LOCAL (Habitant local):
- Objectif: Découvrir des lieux authentiques et moins connus
- Accès: Toutes attractions + spots cachés + événements locaux
- Limite compilation: 50 attractions
- Recommandations: Lieux authentiques, restaurants locaux, événements
- Filtres suggérés: Nouveautés, moins touristiques

PROFESSIONAL (Guide/Professionnel du tourisme):
- Objectif: Créer des itinéraires complets pour clients
- Accès: Toutes attractions + outils avancés
- Limite compilation: 100 attractions (pour créer des circuits)
- Recommandations: Diversifiées, informations détaillées
- Outils supplémentaires: Export PDF, calcul d'itinéraires optimisés
- Filtres suggérés: Par type de clientèle, durée de visite

Cette différenciation permet:
1. Une expérience personnalisée selon les besoins
2. Une monétisation potentielle (Professional = compte premium)
3. Une meilleure UX avec des recommandations adaptées
"""

def get_compilation_limit(profile_type):
    """Retourne la limite d'attractions selon le type de profil"""
    limits = {
        'tourist': 30,
        'local': 50,
        'professional': 100,
    }
    return limits.get(profile_type, 30)

def get_recommended_categories(profile_type):
    """Retourne les catégories recommandées selon le profil"""
    recommendations = {
        'tourist': [
            'attractions', 'restaurants', 'hotels', 
            'museums', 'monuments', 'activities'
        ],
        'local': [
            'restaurants', 'nightlife', 'activities',
            'shopping', 'entertainment', 'events'
        ],
        'professional': [
            'all'  # Accès à toutes les catégories
        ],
    }
    return recommendations.get(profile_type, recommendations['tourist'])

def get_search_suggestions(profile_type, country):
    """Retourne des suggestions de recherche selon le profil"""
    if profile_type == 'tourist':
        return [
            f"Top attractions in {country}",
            f"Best restaurants {country}",
            f"Family activities {country}",
            f"Things to do {country}"
        ]
    elif profile_type == 'local':
        return [
            f"Hidden gems {country}",
            f"Local restaurants {country}",
            f"New places {country}",
            f"Events {country}"
        ]
    else:  # professional
        return [
            f"Complete guide {country}",
            f"Tourist circuits {country}",
            f"All attractions {country}",
            f"Professional itineraries {country}"
        ]

def can_access_feature(profile_type, feature_name):
    """Vérifie si un profil peut accéder à une fonctionnalité"""
    features_access = {
        'export_pdf': ['professional'],
        'advanced_itinerary': ['professional'],
        'batch_operations': ['professional', 'local'],
        'standard_compilation': ['tourist', 'local', 'professional'],
        'map_view': ['tourist', 'local', 'professional'],
        'reviews': ['tourist', 'local', 'professional'],
    }
    
    allowed_profiles = features_access.get(feature_name, [])
    return profile_type in allowed_profiles

def get_profile_badge_info(profile_type):
    """Retourne les informations du badge de profil"""
    badges = {
        'tourist': {
            'icon': '🎒',
            'color': 'primary',
            'label': 'Voyageur',
            'description': 'Découvrez les meilleures attractions'
        },
        'local': {
            'icon': '🏡',
            'color': 'success',
            'label': 'Local',
            'description': 'Explorez des lieux authentiques'
        },
        'professional': {
            'icon': '💼',
            'color': 'warning',
            'label': 'Professionnel',
            'description': 'Outils avancés pour créer des circuits'
        },
    }
    return badges.get(profile_type, badges['tourist'])
