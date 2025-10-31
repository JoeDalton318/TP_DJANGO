import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from unittest.mock import patch
from rest_framework import status

@pytest.mark.django_db
def test_tripadvisor_detail_view_success():
    user = User.objects.create_user(username='testuser', password='testpass')
    client = APIClient()
    client.login(username='testuser', password='testpass')

    mock_response = {"name": "Tour Eiffel", "location_id": "123456"}

    # Patch la FONCTION dans le module de la VUE, pas le service !
    with patch("attractions.views.get_location_details", return_value=mock_response):
        response = client.get('/api/attractions/tripadvisor/123456/')

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Tour Eiffel"

@pytest.mark.django_db
def test_tripadvisor_detail_view_failure():
    user = User.objects.create_user(username='testuser', password='testpass')
    client = APIClient()
    client.login(username='testuser', password='testpass')

    with patch("attractions.views.get_location_details", return_value=None):
        response = client.get('/api/attractions/tripadvisor/invalid/')

    assert response.status_code == status.HTTP_502_BAD_GATEWAY
    assert "error" in response.data
