from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Attraction
from .serializers import AttractionDetailSerializer

class AttractionDetailView(APIView):
    def get(self, request, pk):
        attraction = get_object_or_404(Attraction, pk=pk)
        serializer = AttractionDetailSerializer(attraction)
        return Response(serializer.data, status=status.HTTP_200_OK)
