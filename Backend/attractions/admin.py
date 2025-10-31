from django.contrib import admin
from .models import Attraction


@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'city', 'country', 'category', 
        'rating', 'num_reviews', 'price_level'
    ]
    list_filter = [
        'category', 'country', 'price_level', 'is_active'
    ]
    search_fields = ['name', 'city', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('name', 'tripadvisor_id', 'description', 'category', 'subcategory')
        }),
        ('Localisation', {
            'fields': ('address', 'city', 'country', 'latitude', 'longitude')
        }),
        ('Évaluations', {
            'fields': ('rating', 'num_reviews', 'ranking', 'num_likes')
        }),
        ('Contact et Prix', {
            'fields': ('phone', 'website', 'email', 'price_level')
        }),
        ('Spécifique au type', {
            'fields': ('cuisine_type', 'hotel_style', 'attraction_groups'),
            'classes': ('collapse',)
        }),
        ('Médias et Récompenses', {
            'fields': ('main_image', 'num_photos', 'awards'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('target_profiles', 'opening_hours', 'is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
