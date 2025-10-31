# users/models.py

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Profils utilisateur: local, touriste, professionnel"""
    PROFILE_TYPES = [
        ('local', 'Local'),
        ('tourist', 'Touriste'),
        ('professional', 'Professionnel'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES, default='tourist')
    selected_country = models.CharField(max_length=100, default='France')
    preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'Profil Utilisateur'
        verbose_name_plural = 'Profils Utilisateurs'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_profile_type_display()} - {self.selected_country}"
