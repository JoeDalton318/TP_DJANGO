# users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password:
            return Response({'error': 'username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        user.save()
        # On peut créer un profil vide
        UserProfile.objects.get_or_create(user=user)
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)


class LoginUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class SelectProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile_type = request.data.get('profile_type')
        selected_country = request.data.get('selected_country')

        if not profile_type or not selected_country:
            return Response(
                {'error': 'profile_type and selected_country are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.profile_type = profile_type
        profile.selected_country = selected_country
        profile.save()

        serializer = UserProfileSerializer(profile)
        return Response({'message': 'Profil sélectionné', 'data': serializer.data}, status=status.HTTP_200_OK)


class LogoutProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.profile_type = ''
            profile.selected_country = ''
            profile.save()
        except UserProfile.DoesNotExist:
            pass

        return Response({'message': 'Profil réinitialisé'}, status=status.HTTP_200_OK)


class GetProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({'message': 'Aucun profil trouvé'}, status=status.HTTP_404_NOT_FOUND)
