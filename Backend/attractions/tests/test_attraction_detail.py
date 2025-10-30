import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from attractions.models import Attraction

@pytest.mark.django_db
class TestAttractionDetail:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)

    def test_get_existing_attraction(self):
        attraction = Attraction.objects.create(
            name="Tour Eiffel",
            description="Monument emblématique",
            address="Champ de Mars, Paris",
            geo_lat=48.8584,
            geo_lng=2.2945,
            price_level="$$",
            category="Landmark",
            tripadvisor_rating=4.7,
            num_reviews=160000
        )

        url = reverse('attraction-detail', args=[attraction.id])
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == "Tour Eiffel"

    def test_get_non_existing_attraction(self):
        url = reverse('attraction-detail', args=[999])  # id inexistant
        response = self.client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
