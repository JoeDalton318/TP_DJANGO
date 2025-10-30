from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer

class SelectProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile_type = request.data.get('profile_type')
        selected_country = request.data.get('selected_country')

        if not profile_type or not selected_country:
            return Response({"error": "profile_type and selected_country are required"}, status=400)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.profile_type = profile_type
        profile.selected_country = selected_country
        profile.save()

        return Response({"message": "Profil sélectionné", "data": UserProfileSerializer(profile).data})

class LogoutProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.profile_type = ""
            profile.selected_country = ""
            profile.save()
        except UserProfile.DoesNotExist:
            pass

        return Response({"message": "Profil réinitialisé"})

class GetProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
            data = UserProfileSerializer(profile).data
            return Response(data)
        except UserProfile.DoesNotExist:
            return Response({"message": "Aucun profil trouvé"}, status=404)
