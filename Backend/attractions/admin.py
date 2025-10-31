from django.contrib import admin
from .models import Attraction, UserProfile, Compilation, CompilationItem


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


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'profile_type', 'age', 'budget_range', 'budget_max', 'is_active'
    ]
    list_filter = [
        'profile_type', 'budget_range', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'budget_max']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('user', 'name', 'age', 'profile_type')
        }),
        ('Budget', {
            'fields': ('budget_range', 'budget_amount', 'budget_max')
        }),
        ('Préférences', {
            'fields': ('preferred_categories', 'preferred_countries', 'preferred_price_levels'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class CompilationItemInline(admin.TabularInline):
    model = CompilationItem
    extra = 0
    readonly_fields = ['added_at', 'effective_cost']
    fields = ['attraction', 'priority', 'personal_note', 'estimated_cost', 'effective_cost', 'is_visited']


@admin.register(Compilation)
class CompilationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'user_profile', 'total_items', 'estimated_budget', 'budget_status', 'updated_at'
    ]
    list_filter = [
        'user_profile__profile_type', 'is_active', 'created_at'
    ]
    search_fields = ['name', 'user_profile__name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'total_items', 'estimated_budget', 'budget_status', 'categories_breakdown']
    inlines = [CompilationItemInline]
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('user_profile', 'name', 'description')
        }),
        ('Statistiques', {
            'fields': ('total_items', 'estimated_budget', 'budget_status', 'categories_breakdown'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CompilationItem)
class CompilationItemAdmin(admin.ModelAdmin):
    list_display = [
        'compilation', 'attraction', 'priority', 'effective_cost', 'is_visited', 'added_at'
    ]
    list_filter = [
        'priority', 'is_visited', 'is_active', 'added_at'
    ]
    search_fields = ['compilation__name', 'attraction__name', 'personal_note']
    readonly_fields = ['added_at', 'effective_cost']
    
    fieldsets = (
        ('Relation', {
            'fields': ('compilation', 'attraction')
        }),
        ('Détails', {
            'fields': ('priority', 'personal_note', 'estimated_cost', 'effective_cost')
        }),
        ('Status', {
            'fields': ('is_active', 'is_visited', 'visited_at')
        }),
        ('Métadonnées', {
            'fields': ('added_at',),
            'classes': ('collapse',)
        }),
    )