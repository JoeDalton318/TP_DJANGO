from rest_framework import serializers
from .models import Attraction


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
from .models import Attraction, Award, Photo, Suggestion


class AwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Award
        fields = ['title']


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['url']


class SuggestionSerializer(serializers.ModelSerializer):
    suggested_attraction_name = serializers.CharField(source='suggested_attraction.name', read_only=True)

    class Meta:
        model = Suggestion
        fields = ['suggested_attraction', 'suggested_attraction_name']


class AttractionDetailSerializer(serializers.ModelSerializer):
    awards = AwardSerializer(many=True, read_only=True)
    photos = PhotoSerializer(many=True, read_only=True)
    suggestions = SuggestionSerializer(many=True, read_only=True)

    class Meta:
        model = Attraction
        fields = [
            'id', 'name', 'description', 'address', 'geo_lat', 'geo_lng',
            'price_level', 'category', 'tripadvisor_rating', 'num_reviews',
            'awards', 'photos', 'suggestions'
        ]
