from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

# Signal désactivé car la création du profil est gérée par le serializer UserRegistrationSerializer
# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     """Crée automatiquement un profil quand un nouvel utilisateur est créé (uniquement si pas déjà créé)."""
#     if created:
#         # Vérifier si un profil existe déjà (peut être créé par le serializer)
#         if not UserProfile.objects.filter(user=instance).exists():
#             UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, created, **kwargs):
    """Sauvegarde le profil utilisateur après mise à jour."""
    # Ne sauvegarder que si l'utilisateur existe déjà et a un profil
    if not created and hasattr(instance, 'profile'):
        instance.profile.save()
