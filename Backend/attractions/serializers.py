from rest_framework import serializers
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
