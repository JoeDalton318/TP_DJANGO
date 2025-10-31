import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User

@pytest.mark.django_db
def test_login_success():
    user = User.objects.create_user(username="testuser", password="testpass")
    client = APIClient()
    response = client.post("/api/auth/login/", {"username": "testuser", "password": "testpass"})
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data

@pytest.mark.django_db
def test_login_fail_wrong_credentials():
    client = APIClient()
    response = client.post("/api/auth/login/", {"username": "wrong", "password": "wrong"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
