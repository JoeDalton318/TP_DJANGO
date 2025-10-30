from rest_framework import viewsets, status
from rest_framework.response import Response
from .utils import sort_by_shortest_route
from .serializers import CompilationSerializer
from rest_framework.permissions import IsAuthenticated
from .models import Compilation

class CompilationViewSet(viewsets.ModelViewSet):
    serializer_class = CompilationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Compilation.objects.filter(user=self.request.user)

    def list(self, request):
        compilation = self.get_queryset().first()
        if not compilation:
            compilation = Compilation.objects.create(user=request.user)

        # Gestion du tri
        sort_param = request.query_params.get('sort')
        
        if sort_param == 'distance':
            # Tri par distance
            attractions, total_distance = sort_by_shortest_route(compilation.attractions.all())
            compilation.attractions.set(attractions, clear=True)
            compilation.total_distance = total_distance
        elif sort_param == 'budget_asc':
            compilation.attractions.all().order_by('price_level')
        elif sort_param == 'budget_desc':
            compilation.attractions.all().order_by('-price_level')

        serializer = self.get_serializer(compilation)
        return Response(serializer.data)