from rest_framework import serializers
from django.db.models import Sum
from .models import Attraction, Compilation

class AttractionSerializer(serializers.ModelSerializer):
    # Sérialiseur pour le modèle Attraction
    class Meta:
        model = Attraction
        fields = ['id', 'tripAdvisor_id', 'nom', 'price_level', 'latitude', 'longitude', 'categorie']

class CompilationSerializer(serializers.ModelSerializer):
    # Sérialiseur pour le modèle Compilation
    attractions = AttractionSerializer(many=True, read_only=True)
    budget_total = serializers.SerializerMethodField()

    class Meta:
        model = Compilation
        fields = ['user', 'attractions', 'date_created', 'budget_total']

    def get_budget_total (self, obj):
        return obj.attractions.aggregate(Sum('price_level'))['price_level__sum'] or 0