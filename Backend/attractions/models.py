from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


class Attraction(models.Model):
    """
    Modèle pour représenter une attraction touristique
    Basé sur l'API TripAdvisor avec tous les champs nécessaires
    """
    
    # Identifiants
    tripadvisor_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    
    # Localisation
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Informations générales
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)  # restaurant, hotel, attraction, etc.
    subcategory = models.CharField(max_length=100, blank=True)
    
    # Évaluations et popularité
    rating = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        null=True, blank=True
    )
    num_reviews = models.PositiveIntegerField(default=0)
    ranking = models.PositiveIntegerField(null=True, blank=True)
    num_likes = models.PositiveIntegerField(default=0)
    
    # Prix et budget
    price_level = models.CharField(
        max_length=10,
        choices=[
            ('$', 'Budget'),
            ('$$', 'Moderate'),
            ('$$$', 'Expensive'),
            ('$$$$', 'Very Expensive'),
        ],
        blank=True
    )
    
    # Contact et horaires
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    
    # Horaires (format JSON pour flexibilité)
    opening_hours = models.JSONField(default=dict, blank=True)
    
    # Informations spécifiques selon le type
    # Pour restaurants
    cuisine_type = models.CharField(max_length=100, blank=True)
    
    # Pour hôtels
    hotel_style = models.CharField(max_length=100, blank=True)
    
    # Pour attractions
    attraction_groups = models.CharField(max_length=200, blank=True)
    
    # Images et récompenses
    main_image = models.URLField(blank=True)
    num_photos = models.PositiveIntegerField(default=0)
    awards = models.JSONField(default=list, blank=True)
    
    # Profil ciblé (pour filtrage par type d'utilisateur)
    target_profiles = models.JSONField(
        default=list,
        help_text="Liste des profils ciblés: ['local', 'tourist', 'professional']"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-num_likes', '-rating']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['city', 'country']),
            models.Index(fields=['rating']),
            models.Index(fields=['num_likes']),
            models.Index(fields=['price_level']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.city}, {self.country}"
    
    @property
    def location(self):
        """Retourne les coordonnées comme tuple"""
        if self.latitude and self.longitude:
            return (self.latitude, self.longitude)
        return None
    
    @property
    def is_restaurant(self):
        return self.category.lower() == 'restaurant'
    
    @property
    def is_hotel(self):
        return self.category.lower() == 'hotel'
    
    @property
    def is_attraction(self):
        return self.category.lower() == 'attraction'


class UserProfile(models.Model):
    """
    Modèle pour représenter un profil utilisateur (Personne 1)
    Gestion des préférences et informations personnelles
    """
    PROFILE_TYPES = [
        ('local', 'Local Explorer'),
        ('tourist', 'Tourist Traveler'),
        ('professional', 'Business Professional'),
    ]
    
    BUDGET_RANGES = [
        ('low', '0-100€'),
        ('medium', '100-500€'),
        ('high', '500-1000€'),
        ('luxury', '1000€+'),
    ]
    
    # Relation avec le user Django (optionnel pour session simple)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Informations de base
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(120)])
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES)
    
    # Budget et préférences
    budget_range = models.CharField(max_length=10, choices=BUDGET_RANGES)
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Préférences de voyage
    preferred_categories = models.JSONField(
        default=list,
        help_text="Liste des catégories préférées: ['restaurant', 'attraction', 'hotel']"
    )
    preferred_countries = models.JSONField(default=list, blank=True)
    preferred_price_levels = models.JSONField(default=list, blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_profile_type_display()})"
    
    @property
    def budget_max(self):
        """Retourne le budget maximum selon la range"""
        budget_map = {
            'low': 100,
            'medium': 500,
            'high': 1000,
            'luxury': 5000,  # Pas de limite haute réelle
        }
        return self.budget_amount or budget_map.get(self.budget_range, 500)


class Compilation(models.Model):
    """
    Modèle pour représenter une compilation d'attractions (Personne 3)
    Gestion des listes d'attractions sauvegardées avec calculs budget
    """
    # Propriétaire de la compilation
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='compilations')
    
    # Informations de base
    name = models.CharField(max_length=200, default="Ma compilation")
    description = models.TextField(blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.name} - {self.user_profile.name}"
    
    @property
    def total_items(self):
        """Nombre total d'items dans la compilation"""
        return self.items.filter(is_active=True).count()
    
    @property
    def estimated_budget(self):
        """Budget estimé total basé sur les price_levels"""
        total = 0
        price_map = {
            '$': 25,      # Budget moyen par item
            '$$': 75,     # Modéré
            '$$$': 150,   # Cher
            '$$$$': 300,  # Très cher
        }
        
        for item in self.items.filter(is_active=True):
            if item.attraction.price_level:
                total += price_map.get(item.attraction.price_level, 50)
            else:
                total += 50  # Prix par défaut
                
        return total
    
    @property
    def budget_status(self):
        """Statut du budget par rapport au profil utilisateur"""
        user_budget = self.user_profile.budget_max
        estimated = self.estimated_budget
        
        if estimated <= user_budget * 0.7:
            return 'under_budget'
        elif estimated <= user_budget:
            return 'on_budget'
        else:
            return 'over_budget'
    
    @property
    def categories_breakdown(self):
        """Répartition par catégories"""
        breakdown = {}
        for item in self.items.filter(is_active=True):
            category = item.attraction.category
            breakdown[category] = breakdown.get(category, 0) + 1
        return breakdown


class CompilationItem(models.Model):
    """
    Modèle pour représenter un item dans une compilation
    Relation entre Compilation et Attraction avec métadonnées
    """
    compilation = models.ForeignKey(Compilation, on_delete=models.CASCADE, related_name='items')
    attraction = models.ForeignKey(Attraction, on_delete=models.CASCADE)
    
    # Métadonnées de l'ajout
    added_at = models.DateTimeField(auto_now_add=True)
    personal_note = models.TextField(blank=True, help_text="Note personnelle sur cette attraction")
    priority = models.PositiveIntegerField(default=1, help_text="Priorité de visite (1=haute, 5=basse)")
    estimated_cost = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Coût estimé personnalisé"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_visited = models.BooleanField(default=False)
    visited_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['priority', '-added_at']
        unique_together = ['compilation', 'attraction']  # Éviter les doublons
    
    def __str__(self):
        return f"{self.compilation.name} - {self.attraction.name}"
    
    @property
    def effective_cost(self):
        """Coût effectif (personnalisé ou estimé selon price_level)"""
        if self.estimated_cost:
            return self.estimated_cost
        
        # Estimation basée sur price_level
        price_map = {
            '$': 25,
            '$$': 75,
            '$$$': 150,
            '$$$$': 300,
        }
        return price_map.get(self.attraction.price_level, 50)