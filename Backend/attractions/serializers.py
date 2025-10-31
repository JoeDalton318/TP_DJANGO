from rest_framework import serializers
from .models import Attraction, UserProfile, Compilation, CompilationItem


class AttractionSerializer(serializers.ModelSerializer):
    """Serializer complet pour les attractions"""
    
    location = serializers.ReadOnlyField()
    is_restaurant = serializers.ReadOnlyField()
    is_hotel = serializers.ReadOnlyField()
    is_attraction = serializers.ReadOnlyField()
    
    class Meta:
        model = Attraction
        fields = '__all__'


class AttractionCardSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les cartes d'attraction"""
    
    location = serializers.ReadOnlyField()
    
    class Meta:
        model = Attraction
        fields = [
            'id', 'tripadvisor_id', 'name', 'city', 'country',
            'category', 'rating', 'num_reviews', 'price_level',
            'main_image', 'location'
        ]


class AttractionSearchSerializer(serializers.Serializer):
    """Serializer pour les paramètres de recherche"""
    
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    
    min_rating = serializers.FloatField(required=False, min_value=0, max_value=5)
    max_rating = serializers.FloatField(required=False, min_value=0, max_value=5)
    
    min_reviews = serializers.IntegerField(required=False, min_value=0)
    min_photos = serializers.IntegerField(required=False, min_value=0)
    
    price_level = serializers.CharField(required=False, allow_blank=True)
    
    # Géolocalisation
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    radius = serializers.FloatField(required=False, min_value=0, help_text="Rayon en kilomètres")
    
    # Profil utilisateur
    profile = serializers.ChoiceField(
        choices=['local', 'tourist', 'professional'],
        required=False
    )
    
    # Tri
    ordering = serializers.ChoiceField(
        choices=['rating', '-rating', 'num_likes', '-num_likes', 'name', '-name'],
        required=False,
        default='-num_likes'
    )


# ===== SERIALIZERS POUR PERSONNE 1 (UserProfile) =====

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour les profils utilisateur"""
    
    budget_max = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'name', 'age', 'profile_type', 'budget_range', 
            'budget_amount', 'budget_max', 'preferred_categories',
            'preferred_countries', 'preferred_price_levels',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_age(self, value):
        if value < 1 or value > 120:
            raise serializers.ValidationError("L'âge doit être entre 1 et 120 ans.")
        return value


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de profils (champs requis seulement)"""
    
    class Meta:
        model = UserProfile
        fields = ['name', 'age', 'profile_type', 'budget_range']
    
    def create(self, validated_data):
        """Créer un profil et l'associer automatiquement à l'utilisateur connecté"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)


# ===== SERIALIZERS POUR PERSONNE 3 (Compilation) =====

class CompilationItemSerializer(serializers.ModelSerializer):
    """Serializer pour les items de compilation"""
    
    attraction = AttractionCardSerializer(read_only=True)
    attraction_id = serializers.IntegerField(write_only=True)
    effective_cost = serializers.ReadOnlyField()
    
    class Meta:
        model = CompilationItem
        fields = [
            'id', 'attraction', 'attraction_id', 'priority', 
            'personal_note', 'estimated_cost', 'effective_cost',
            'is_active', 'is_visited', 'visited_at', 'added_at'
        ]
        read_only_fields = ['added_at']
    
    def validate_attraction_id(self, value):
        try:
            attraction = Attraction.objects.get(id=value)
            if not attraction.is_active:
                raise serializers.ValidationError("Cette attraction n'est pas disponible.")
        except Attraction.DoesNotExist:
            raise serializers.ValidationError("Attraction non trouvée.")
        return value


class CompilationSerializer(serializers.ModelSerializer):
    """Serializer complet pour les compilations"""
    
    items = CompilationItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    estimated_budget = serializers.ReadOnlyField()
    budget_status = serializers.ReadOnlyField()
    categories_breakdown = serializers.ReadOnlyField()
    user_profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Compilation
        fields = [
            'id', 'name', 'description', 'user_profile', 'items',
            'total_items', 'estimated_budget', 'budget_status',
            'categories_breakdown', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CompilationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour lister les compilations"""
    
    total_items = serializers.ReadOnlyField()
    estimated_budget = serializers.ReadOnlyField()
    budget_status = serializers.ReadOnlyField()
    user_profile_name = serializers.CharField(source='user_profile.name', read_only=True)
    
    class Meta:
        model = Compilation
        fields = [
            'id', 'name', 'description', 'user_profile_name',
            'total_items', 'estimated_budget', 'budget_status',
            'updated_at'
        ]


class CompilationCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une compilation"""
    
    user_profile_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Compilation
        fields = ['name', 'description', 'user_profile_id']
    
    def validate_user_profile_id(self, value):
        try:
            profile = UserProfile.objects.get(id=value)
            if not profile.is_active:
                raise serializers.ValidationError("Ce profil utilisateur n'est pas actif.")
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("Profil utilisateur non trouvé.")
        return value
    
    def create(self, validated_data):
        user_profile_id = validated_data.pop('user_profile_id')
        user_profile = UserProfile.objects.get(id=user_profile_id)
        validated_data['user_profile'] = user_profile
        return super().create(validated_data)


# ===== SERIALIZERS POUR STATISTIQUES =====

class CompilationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de compilation"""
    
    total_compilations = serializers.IntegerField()
    total_items = serializers.IntegerField()
    average_budget = serializers.FloatField()
    most_popular_category = serializers.CharField()
    categories_distribution = serializers.DictField()


class UserProfileStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de profil utilisateur"""
    
    total_profiles = serializers.IntegerField()
    profile_types_distribution = serializers.DictField()
    budget_ranges_distribution = serializers.DictField()
    average_age = serializers.FloatField()