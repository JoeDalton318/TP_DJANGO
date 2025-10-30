from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    PROFILE_CHOICES = [
        ('local', 'Local'),
        ('tourist', 'Touriste'),
        ('professional', 'Professionnel'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_CHOICES, blank=True)
    selected_country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.profile_type or 'No Profile'})"
