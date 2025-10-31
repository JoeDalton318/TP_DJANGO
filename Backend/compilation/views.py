from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

from .models import Compilation, Attraction
from .serializers import CompilationSerializer, AttractionSerializer
from .tripadvisor_service import tripadvisor_service

User = get_user_model()


class AttractionsViewSet(viewsets.ViewSet):
    """ViewSet pour les attractions - correspond à attractionsAPI du frontend"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        GET /api/attractions/search/?q=rome&category=&country=&min_rating=&max_rating=&min_reviews=&price_level=&page=1
        """
        try:
            # Récupérer les paramètres
            query = request.query_params.get('q', '').strip()
            category = request.query_params.get('category', '').strip()
            country = request.query_params.get('country', '').strip()
            city = request.query_params.get('city', '').strip()
            min_rating = request.query_params.get('min_rating', '')
            max_rating = request.query_params.get('max_rating', '')
            min_reviews = request.query_params.get('min_reviews', '')
            price_level = request.query_params.get('price_level', '')
            ordering = request.query_params.get('ordering', '-num_reviews')
            page = int(request.query_params.get('page', 1))

            # Préparer les filtres pour TripAdvisor
            filters = {}
            if category:
                filters['category'] = category
            if country:
                filters['country'] = country
            if city:
                filters['city'] = city
            if min_rating:
                filters['min_rating'] = min_rating
            if max_rating:
                filters['max_rating'] = max_rating
            if min_reviews:
                filters['min_reviews'] = min_reviews
            if price_level:
                filters['price_level'] = price_level
            if ordering:
                filters['ordering'] = ordering

            # Si pas de query, chercher dans la DB locale
            if not query:
                attractions_qs = Attraction.objects.filter(is_active=True)
                
                # Appliquer les filtres Django
                if category:
                    attractions_qs = attractions_qs.filter(category__icontains=category)
                if country:
                    attractions_qs = attractions_qs.filter(country__icontains=country)
                if city:
                    attractions_qs = attractions_qs.filter(city__icontains=city)
                if min_rating:
                    attractions_qs = attractions_qs.filter(rating__gte=float(min_rating))
                if max_rating:
                    attractions_qs = attractions_qs.filter(rating__lte=float(max_rating))
                if min_reviews:
                    attractions_qs = attractions_qs.filter(num_reviews__gte=int(min_reviews))
                if price_level:
                    attractions_qs = attractions_qs.filter(price_level=price_level)
                
                # Tri
                if ordering:
                    attractions_qs = attractions_qs.order_by(ordering)
                
                attractions_list = list(attractions_qs)
            else:
                # Recherche via TripAdvisor Service
                attractions_data = tripadvisor_service.search_attractions_by_query(query, **filters)
                
                # Sauvegarder dans la DB
                attractions_list = []
                for data in attractions_data:
                    attraction = self._save_or_update_attraction(data)
                    if attraction:
                        attractions_list.append(attraction)

            # Pagination
            paginator = Paginator(attractions_list, 15)
            try:
                paginated = paginator.page(page)
            except EmptyPage:
                paginated = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else paginator.page(1)

            return Response({
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': paginated.number,
                'has_next': paginated.has_next(),
                'has_previous': paginated.has_previous(),
                'results': AttractionSerializer(paginated.object_list, many=True).data
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        GET /api/attractions/popular/?country=France&page=1
        """
        try:
            country = request.query_params.get('country', 'France')
            page = int(request.query_params.get('page', 1))
            
            # Récupérer depuis TripAdvisor ou DB
            attractions_data = tripadvisor_service.get_popular_attractions(country=country, limit=50)
            
            # Sauvegarder dans la DB
            attractions_list = []
            for data in attractions_data:
                attraction = self._save_or_update_attraction(data)
                if attraction:
                    attractions_list.append(attraction)
            
            # Si pas de résultats TripAdvisor, utiliser la DB
            if not attractions_list:
                attractions_list = list(
                    Attraction.objects.filter(is_active=True)
                    .order_by('-rating', '-num_reviews')[:50]
                )

            # Pagination
            paginator = Paginator(attractions_list, 15)
            try:
                paginated = paginator.page(page)
            except EmptyPage:
                paginated = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else paginator.page(1)

            return Response({
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': paginated.number,
                'has_next': paginated.has_next(),
                'has_previous': paginated.has_previous(),
                'results': AttractionSerializer(paginated.object_list, many=True).data
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        """
        GET /api/attractions/{id}/ ou /api/attractions/{tripadvisor_id}/
        """
        try:
            # Essayer par PK Django
            try:
                attraction = Attraction.objects.get(pk=pk)
                return Response(AttractionSerializer(attraction).data)
            except (Attraction.DoesNotExist, ValueError):
                pass
            
            # Essayer par tripadvisor_id
            try:
                attraction = Attraction.objects.get(tripadvisor_id=pk)
                return Response(AttractionSerializer(attraction).data)
            except Attraction.DoesNotExist:
                pass
            
            # Chercher sur TripAdvisor
            data = tripadvisor_service.get_attraction_by_id(pk)
            if data:
                attraction = self._save_or_update_attraction(data)
                if attraction:
                    return Response(AttractionSerializer(attraction).data)
            
            return Response(
                {'error': 'Attraction non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """
        GET /api/attractions/suggestions/?q=par
        """
        try:
            query = request.query_params.get('q', '').strip()
            if not query or len(query) < 2:
                return Response({'suggestions': []})

            # Rechercher dans la DB locale
            attractions = Attraction.objects.filter(
                Q(name__icontains=query) |
                Q(city__icontains=query) |
                Q(country__icontains=query)
            )[:10]

            suggestions = [
                {
                    'id': a.id,
                    'tripadvisor_id': a.tripadvisor_id,
                    'name': a.name,
                    'city': a.city,
                    'country': a.country,
                    'type': a.category
                }
                for a in attractions
            ]

            return Response({'suggestions': suggestions})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """GET /api/attractions/categories/"""
        try:
            categories = Attraction.objects.exclude(
                category=''
            ).values_list('category', flat=True).distinct()
            
            return Response({'categories': sorted([c for c in categories if c])})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def countries(self, request):
        """GET /api/attractions/countries/"""
        try:
            countries = Attraction.objects.exclude(
                country=''
            ).values_list('country', flat=True).distinct().order_by('country')
            
            return Response({'countries': [c for c in countries if c]})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        GET /api/attractions/nearby/?lat=48.8566&lng=2.3522&radius=10&category=&page=1
        """
        try:
            lat = request.query_params.get('lat')
            lng = request.query_params.get('lng')
            radius = request.query_params.get('radius', '10')
            category = request.query_params.get('category', '')
            page = int(request.query_params.get('page', 1))

            if not lat or not lng:
                return Response(
                    {'error': 'Paramètres lat et lng requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Format pour TripAdvisor: "latitude,longitude"
            lat_long = f"{lat},{lng}"
            
            # Filtres
            filters = {'radius': radius}
            if category:
                filters['category'] = category

            # Recherche via TripAdvisor
            attractions_data = tripadvisor_service.nearby_search(
                lat_long=lat_long,
                language="fr",
                **filters
            )
            
            # Sauvegarder dans la DB
            attractions_list = []
            for data in attractions_data:
                attraction = self._save_or_update_attraction(data)
                if attraction:
                    attractions_list.append(attraction)

            # Pagination
            paginator = Paginator(attractions_list, 15)
            try:
                paginated = paginator.page(page)
            except EmptyPage:
                paginated = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else paginator.page(1)

            return Response({
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': paginated.number,
                'has_next': paginated.has_next(),
                'has_previous': paginated.has_previous(),
                'results': AttractionSerializer(paginated.object_list, many=True).data
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    @action(detail=False, methods=['get'])
    def cuisines(self, request):
        """GET /api/attractions/cuisines/"""
        try:
            cuisines = Attraction.objects.filter(
                category='restaurant'
            ).exclude(
                subcategory=''
            ).values_list('subcategory', flat=True).distinct()
            
            return Response({'cuisines': sorted([c for c in cuisines if c])})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='hotel-styles')
    def hotel_styles(self, request):
        """GET /api/attractions/hotel-styles/"""
        try:
            styles = Attraction.objects.filter(
                category='hotel'
            ).exclude(
                styles=[]
            ).values_list('styles', flat=True)
            
            # Aplatir la liste de listes
            all_styles = set()
            for style_list in styles:
                if isinstance(style_list, list):
                    all_styles.update(style_list)
            
            return Response({'hotel_styles': sorted(list(all_styles))})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='attraction-types')
    def attraction_types(self, request):
        """GET /api/attractions/attraction-types/"""
        try:
            types = Attraction.objects.exclude(
                subcategory=''
            ).values_list('subcategory', flat=True).distinct()
            
            return Response({'attraction_types': sorted([t for t in types if t])})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _save_or_update_attraction(self, data: dict) -> 'Attraction':
        """Sauvegarder ou mettre à jour une attraction depuis les données TripAdvisor"""
        try:
            tripadvisor_id = data.get('tripadvisor_id') or data.get('id')
            if not tripadvisor_id:
                return None

            # Préparer les données
            defaults = {
                'name': data.get('name', ''),
                'description': data.get('description', ''),
                'address': data.get('address', ''),
                'city': data.get('city', ''),
                'country': data.get('country', ''),
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'category': data.get('category', 'attraction'),
                'subcategory': data.get('subcategory', ''),
                'rating': data.get('rating'),
                'num_reviews': data.get('num_reviews', 0),
                'ranking': data.get('ranking', 0),
                'price_level': data.get('price_level', ''),
                'phone': data.get('phone', ''),
                'website': data.get('website', ''),
                'timezone': data.get('timezone', ''),
                'main_image': data.get('main_image', ''),
                'num_photos': data.get('num_photos', 0),
                'amenities': data.get('amenities', []),
                'awards': data.get('awards', []),
                'styles': data.get('styles', []),
                'trip_types': data.get('trip_types', []),
                'subratings': data.get('subratings', {}),
                'is_active': True,
            }

            attraction, created = Attraction.objects.update_or_create(
                tripadvisor_id=str(tripadvisor_id),
                defaults=defaults
            )
            return attraction
        except Exception as e:
            import traceback
            traceback.print_exc()
            return None


class CompilationViewSet(viewsets.ViewSet):
    """ViewSet pour les compilations utilisateur"""
    permission_classes = [AllowAny]

    def _get_or_create_compilation(self, request_user):
        if not request_user or not request_user.is_authenticated:
            user, _ = User.objects.get_or_create(
                username='guest',
                defaults={'email': 'guest@example.com'}
            )
        else:
            user = request_user
        
        compilation, _ = Compilation.objects.get_or_create(user=user)
        return compilation

    def list(self, request):
        """GET /api/compilation/?page=1"""
        try:
            compilation = self._get_or_create_compilation(request.user)
            page = int(request.query_params.get('page', 1))
            
            attractions = list(compilation.attractions.filter(is_active=True))
            
            # Pagination
            paginator = Paginator(attractions, 15)
            try:
                paginated = paginator.page(page)
            except EmptyPage:
                paginated = paginator.page(paginator.num_pages) if paginator.num_pages > 0 else paginator.page(1)

            return Response({
                'id': compilation.id,
                'user': compilation.user.username,
                'count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': paginated.number,
                'has_next': paginated.has_next(),
                'has_previous': paginated.has_previous(),
                'attractions': AttractionSerializer(paginated.object_list, many=True).data
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def add(self, request):
        """POST /api/compilation/add/ - body: {"attraction_id": 123}"""
        try:
            compilation = self._get_or_create_compilation(request.user)
            attraction_id = request.data.get('attraction_id')
            
            if not attraction_id:
                return Response(
                    {'error': 'attraction_id requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            attraction = get_object_or_404(Attraction, pk=attraction_id)
            compilation.attractions.add(attraction)
            
            return Response(
                {'message': f'{attraction.name} ajouté à votre compilation'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='remove')
    def remove(self, request, pk=None):
        """DELETE /api/compilation/{attraction_id}/remove/"""
        try:
            compilation = self._get_or_create_compilation(request.user)
            attraction = get_object_or_404(Attraction, pk=pk)
            compilation.attractions.remove(attraction)
            
            return Response({'message': f'{attraction.name} supprimé de votre compilation'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)