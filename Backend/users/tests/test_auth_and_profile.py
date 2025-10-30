import pytest
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from users.models import UserProfile
from attractions.models import Attraction

@pytest.mark.django_db
class TestAuthAndProfile(APITestCase):
    def setUp(self):
        # Crée un utilisateur
        self.username = "user1"
        self.password = "pass123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        
        # Récupère ou crée le profil automatiquement associé
        self.profile, _ = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={'profile_type': 'local', 'selected_country': 'France'}
        )

    def authenticate(self):
        url_login = reverse('token_obtain_pair')
        resp = self.client.post(url_login, {"username": self.username, "password": self.password}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_access_profile_with_token(self):
        """Test: accéder au profil utilisateur avec un token JWT valide"""
        self.authenticate()
        url_profile = reverse('get-profile')
        response = self.client.get(url_profile)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == self.profile.id

    def test_access_protected_attraction_endpoint(self):
        """Test: accéder à un endpoint protégé après authentification"""
        attraction = Attraction.objects.create(
            name="Test Attr",
            description="Desc",
            address="Addr",
            geo_lat=10.0,
            geo_lng=20.0,
            price_level="€",
            category="TestCat",
            tripadvisor_rating=3.5,
            num_reviews=50
        )

        self.authenticate()
        url_attr = reverse('attraction-detail', args=[attraction.id])
        resp = self.client.get(url_attr)

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == "Test Attr"
