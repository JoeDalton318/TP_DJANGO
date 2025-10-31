# users/views.py

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

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
    
    @action(detail=False, methods=['put', 'patch'])
    def update_info(self, request):
        """PUT/PATCH /api/users/profile/update_info/ - Modifier nom d'utilisateur et email"""
        try:
            user = request.user
            username = request.data.get('username')
            email = request.data.get('email')
            
            # Vérifier si le username est déjà pris
            if username and username != user.username:
                if User.objects.filter(username=username).exists():
                    return Response(
                        {'error': 'Ce nom d\'utilisateur est déjà pris'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.username = username
            
            # Vérifier si l'email est déjà pris
            if email and email != user.email:
                if User.objects.filter(email=email).exists():
                    return Response(
                        {'error': 'Cet email est déjà utilisé'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                user.email = email
            
            user.save()
            
            # Retourner le profil mis à jour
            profile = user.profile
            serializer = UserProfileSerializer(profile)
            return Response({
                'message': 'Profil mis à jour avec succès',
                'profile': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """POST /api/users/profile/change_password/ - Changer le mot de passe"""
        try:
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            
            if not old_password or not new_password:
                return Response(
                    {'error': 'Ancien et nouveau mot de passe requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier l'ancien mot de passe
            if not user.check_password(old_password):
                return Response(
                    {'error': 'Ancien mot de passe incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier la longueur du nouveau mot de passe
            if len(new_password) < 8:
                return Response(
                    {'error': 'Le mot de passe doit contenir au moins 8 caractères'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Changer le mot de passe
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': 'Mot de passe modifié avec succès'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """POST /api/users/register/ - Inscription avec profil"""
    try:
        # Utiliser le serializer pour validation
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
    
    except Exception as e:
        return Response({
            'error': 'Erreur lors de l\'inscription',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """POST /api/users/login/ - Connexion"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({
                'error': 'Nom d\'utilisateur et mot de passe requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Identifiants incorrects'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la connexion',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
