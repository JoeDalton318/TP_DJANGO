# users/tests/test_auth_register_profile.py

import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestAuthRegisterProfile:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = reverse('user-register')
        self.login_url = reverse('user-login')
        self.select_profile_url = reverse('select-profile')
        self.get_profile_url = reverse('get-profile')
        self.logout_profile_url = reverse('logout-profile')

    def test_register_success(self):
        data = {
            'username': 'newuser',
            'password': 'newpass123',
            'email': 'newuser@example.com'
        }
        response = self.client.post(self.register_url, data, format='json')
        assert response.status_code == 201
        assert User.objects.filter(username='newuser').exists()

    def test_register_missing_fields(self):
        data = { 'username': '', 'password': '' }
        response = self.client.post(self.register_url, data, format='json')
        assert response.status_code == 400
        assert 'error' in response.data

    def test_login_success(self):
        user = User.objects.create_user(username='loginuser', password='secret123')
        data = {
            'username': 'loginuser',
            'password': 'secret123'
        }
        response = self.client.post(self.login_url, data, format='json')
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_invalid_credentials(self):
        data = {
            'username': 'nouser',
            'password': 'wrong'
        }
        response = self.client.post(self.login_url, data, format='json')
        assert response.status_code == 401
        assert 'error' in response.data

    def test_select_profile_requires_auth(self):
        data = {
            'profile_type': 'tourist',
            'selected_country': 'France'
        }
        response = self.client.post(self.select_profile_url, data, format='json')
        assert response.status_code == 401 or response.status_code == 403

    def test_select_and_get_profile_flow(self):
        user = User.objects.create_user(username='flowuser', password='flowpass')
        client = APIClient()
        client.login(username='flowuser', password='flowpass')
        # select profile
        data = {
            'profile_type': 'local',
            'selected_country': 'France'
        }
        response = client.post(self.select_profile_url, data, format='json')
        assert response.status_code == 200
        assert response.data['data']['profile_type'] == 'local'
        assert response.data['data']['selected_country'] == 'France'
        # get profile
        response2 = client.get(self.get_profile_url, format='json')
        assert response2.status_code == 200
        assert response2.data['profile_type'] == 'local'
        assert response2.data['selected_country'] == 'France'
        # logout profile
        response3 = client.post(self.logout_profile_url, format='json')
        assert response3.status_code == 200
        response4 = client.get(self.get_profile_url, format='json')
        # after logout selection the fields may be empty or default
        assert response4.status_code == 200
        assert response4.data['profile_type'] == ''
        assert response4.data['selected_country'] == ''
