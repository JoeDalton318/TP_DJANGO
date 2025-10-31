# users/views.py

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from .models import UserProfile
from .serializers import UserProfileSerializer, UserRegistrationSerializer


class UserProfileViewSet(viewsets.ViewSet):
    """ViewSet pour la gestion des profils utilisateur"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """GET /api/users/profile/me/ - Récupérer le profil de l'utilisateur connecté"""
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def select_profile(self, request):
        """POST /api/users/profile/select_profile/ - Sélectionner/Modifier le profil"""
        try:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile_type = request.data.get('profile_type')
            selected_country = request.data.get('selected_country')
            
            if profile_type:
                profile.profile_type = profile_type
            if selected_country:
                profile.selected_country = selected_country
            
            profile.save()
            
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """POST /api/users/register/ - Inscription avec profil"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'username': user.username,
                'email': user.email,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/users/logout/ - Déconnexion et suppression de la compilation"""
    try:
        # Supprimer la compilation de l'utilisateur
        from compilation.models import Compilation
        Compilation.objects.filter(user=request.user).delete()
        
        # Note: token blacklist nécessite djangorestframework-simplejwt[crypto]
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # Ignorer si blacklist n'est pas activé
        
        return Response({'message': 'Déconnexion réussie, compilation supprimée'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
