import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from users.models import UserProfile

@pytest.mark.django_db
def test_get_user_profile_authenticated():
    user = User.objects.create_user(username="testuser", password="testpass")
    profile = UserProfile.objects.get(user=user)
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get("/api/profile/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["profile_type"] == profile.profile_type
