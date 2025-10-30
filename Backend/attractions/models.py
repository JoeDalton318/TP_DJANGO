from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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