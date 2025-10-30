from rest_framework import serializers
from django.db.models import Sum
from .models import Attraction, Compilation

class AttractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attraction
        fields = '__all__'

class CompilationSerializer(serializers.ModelSerializer):
    attractions = AttractionSerializer(many=True, read_only=True)
    budget_total = serializers.SerializerMethodField()
    total_distance = serializers.SerializerMethodField()

    class Meta:
        model = Compilation
        fields = ['user', 'attractions', 'date_created', 'budget_total', 'total_distance']

    def get_budget_total(self, obj):
        return obj.attractions.aggregate(Sum('price_level'))['price_level__sum'] or 0

    def get_total_distance(self, obj):
        # Uniquement calculé si le tri par distance est demandé
        if hasattr(obj, 'total_distance'):
            return obj.total_distance
        return 0