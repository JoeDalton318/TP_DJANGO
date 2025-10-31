from django.db import models
from django.contrib.auth.models import User
from math import radians, cos, sin, asin, sqrt


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
    """Compilation d'attractions par utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='compilation')
    attractions = models.ManyToManyField(Attraction, related_name='compilations', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'compilations'
        verbose_name = 'Compilation'
        verbose_name_plural = 'Compilations'
    
    def __str__(self):
        return f"Compilation de {self.user.username}"
    
    def calculate_total_budget(self):
        """Calculer le budget total en fonction des price_level"""
        price_mapping = {'$': 10, '$$': 30, '$$$': 60, '$$$$': 100}
        total = 0
        for attraction in self.attractions.all():
            total += price_mapping.get(attraction.price_level, 0)
        return total
    
    def calculate_total_distance(self):
        """Calculer la distance totale entre attractions (itinéraire optimisé)"""
        attractions_list = list(self.attractions.filter(
            latitude__isnull=False, 
            longitude__isnull=False
        ).order_by('id'))
        
        if len(attractions_list) < 2:
            return 0
        
        total_distance = 0
        for i in range(len(attractions_list) - 1):
            dist = self._haversine_distance(
                attractions_list[i].latitude,
                attractions_list[i].longitude,
                attractions_list[i + 1].latitude,
                attractions_list[i + 1].longitude
            )
            total_distance += dist
        
        return round(total_distance, 2)
    
    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculer la distance en km entre deux points GPS"""
        R = 6371  # Rayon de la Terre en km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        return R * c