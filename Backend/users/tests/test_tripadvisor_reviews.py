from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

class TripAdvisorReviewViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)

        self.headers = {
            "HTTP_AUTHORIZATION": f"Bearer {self.token}"
        }
        self.valid_location_id = "126570"

    @patch("attractions.views.get_reviews_for_location")  # patch dans la VUE
    def test_get_tripadvisor_reviews_success(self, mock_get_reviews):
        mock_get_reviews.return_value = {
            "data": [{"id": 1, "text": "Super attraction"}]
        }

        response = self.client.get(
            f"/api/attractions/tripadvisor/{self.valid_location_id}/reviews/",
            **self.headers
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)

    def test_get_tripadvisor_reviews_unauthorized(self):
        response = self.client.get(
            f"/api/attractions/tripadvisor/{self.valid_location_id}/reviews/"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
