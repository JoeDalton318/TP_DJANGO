from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Attraction
from .serializers import AttractionDetailSerializer
from services.tripadvisor import get_location_details
from services.tripadvisor import get_reviews_for_location


class AttractionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        attraction = get_object_or_404(Attraction, pk=pk)
        serializer = AttractionDetailSerializer(attraction)
        return Response(serializer.data, status=status.HTTP_200_OK)




class TripAdvisorAttractionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, location_id):
        data = get_location_details(location_id)

        if not data or "error" in data:
            return Response(
                        {
                            "error": "Impossible de récupérer les données TripAdvisor",
                            "details": (data or {}).get("error", "Aucune donnée renvoyée")
                        },
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response(data, status=status.HTTP_200_OK)
    


class TripAdvisorAttractionReviewsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, location_id):
        data = get_reviews_for_location(location_id)

        if data is None or "error" in data:
            return Response({"error": "Impossible de récupérer les avis TripAdvisor"}, status=status.HTTP_502_BAD_GATEWAY)

        return Response(data, status=status.HTTP_200_OK)
