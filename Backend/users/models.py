# users/models.py

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    PROFILE_CHOICES = [
        ('tourist', 'Tourist'),
        ('local', 'Local'),
        ('professional', 'Professional'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_type = models.CharField(max_length=50, choices=PROFILE_CHOICES, default='tourist')
    selected_country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.profile_type}"
