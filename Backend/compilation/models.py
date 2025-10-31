from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Profils utilisateur: local, touriste, professionnel"""
    PROFILE_TYPES = [
        ('local', 'Local'),
        ('touriste', 'Touriste'),
        ('professionnel', 'Professionnel'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES, default='touriste')
    country = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_profile_type_display()}"


class Attraction(models.Model):
    # Identifiants
    tripadvisor_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    
    # Description
    description = models.TextField(blank=True)
    
    # Adresse
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    country = models.CharField(max_length=100, blank=True, db_index=True)
    
    # Coordonnées GPS
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Catégories
    category = models.CharField(max_length=100, blank=True, db_index=True)
    subcategory = models.CharField(max_length=100, blank=True)
    
    # Évaluations
    rating = models.FloatField(null=True, blank=True, db_index=True)
    num_reviews = models.IntegerField(default=0, db_index=True)
    ranking = models.IntegerField(default=0)
    
    # Prix et contact
    price_level = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(max_length=500, blank=True)
    timezone = models.CharField(max_length=100, blank=True)
    
    # Images
    main_image = models.URLField(max_length=500, blank=True)
    num_photos = models.IntegerField(default=0)
    
    # Attributs supplémentaires (JSON fields)
    amenities = models.JSONField(default=list, blank=True)
    awards = models.JSONField(default=list, blank=True)
    styles = models.JSONField(default=list, blank=True)
    trip_types = models.JSONField(default=list, blank=True)
    subratings = models.JSONField(default=dict, blank=True)
    
    # État
    is_active = models.BooleanField(default=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating', '-num_reviews']
        indexes = [
            models.Index(fields=['tripadvisor_id']),
            models.Index(fields=['category', 'rating']),
            models.Index(fields=['country', 'city']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.city}, {self.country})"


class Compilation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compilations')
    attractions = models.ManyToManyField(Attraction, related_name='compilations')
    date_created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_created']
    
    def __str__(self):
        return f"Compilation de {self.user.username} ({self.attractions.count()} attractions)"