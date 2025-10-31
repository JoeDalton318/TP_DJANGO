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
        fields = ['id', 'user', 'attractions', 'date_created', 'budget_total', 'total_distance']

    def get_budget_total(self, obj):
        return obj.attractions.aggregate(Sum('price_level'))['price_level__sum'] or 0

    def get_total_distance(self, obj):
        return getattr(obj, 'total_distance', 0)

class PaginatedAttractionSerializer(serializers.Serializer):
    """Serializer pour les réponses paginées"""
    count = serializers.IntegerField()
    next = serializers.CharField(allow_null=True)
    previous = serializers.CharField(allow_null=True)
    results = AttractionSerializer(many=True)
    total_pages = serializers.IntegerField()
    current_page = serializers.IntegerField()