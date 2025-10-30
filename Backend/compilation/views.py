from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Compilation, Attraction
from .serializers import CompilationSerializer
from rest_framework.permissions import IsAuthenticated

class CompilationViewSet(viewsets.ModelViewSet):
    serializer_class = CompilationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtre les compilations pour ne retourner que celles de l'utilisateur connecté
        return Compilation.objects.filter(user=self.request.user)

    def list(self, request):
        # GET /api/compilation/
        compilation = self.get_queryset().first()
        if not compilation:
            compilation = Compilation.objects.create(user=request.user)
        serializer = self.get_serializer(compilation)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        # POST /api/compilation/add/
        compilation = self.get_queryset().first()
        if not compilation:
            compilation = Compilation.objects.create(user=request.user)

        attraction_data = request.data
        try:
            attraction, created = Attraction.objects.get_or_create(**attraction_data)
            compilation.attractions.add(attraction)
            serializer = self.get_serializer(compilation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        # DELETE /api/compilation/delete/{id}/
        compilation = self.get_queryset().first()
        if not compilation:
            return Response(
                {"error": "Compilation not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            attraction = Attraction.objects.get(id=pk)
            compilation.attractions.remove(attraction)
            serializer = self.get_serializer(compilation)
            return Response(serializer.data)
        except Attraction.DoesNotExist:
            return Response(
                {"error": "Attraction not found"},
                status=status.HTTP_404_NOT_FOUND
            )