from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from compilation.models import UserProfile

class Command(BaseCommand):
    help = 'Crée des profils utilisateur de test (local, touriste, professionnel)'

    def handle(self, *args, **options):
        profiles_data = [
            {
                'username': 'daril',
                'email': 'daril@example.com',
                'password': 'admin123',
                'profile_type': 'professionnel',
                'country': 'France',
                'is_superuser': True,
                'is_staff': True
            },
            {
                'username': 'local_paris',
                'email': 'local@paris.fr',
                'password': 'test1234',
                'profile_type': 'local',
                'country': 'France'
            },
            {
                'username': 'touriste_usa',
                'email': 'tourist@usa.com',
                'password': 'test1234',
                'profile_type': 'touriste',
                'country': 'USA'
            },
            {
                'username': 'pro_guide',
                'email': 'guide@travel.com',
                'password': 'test1234',
                'profile_type': 'professionnel',
                'country': 'Italy'
            },
        ]

        for data in profiles_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'is_superuser': data.get('is_superuser', False),
                    'is_staff': data.get('is_staff', False)
                }
            )
            
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✓ User créé: {user.username}'))
            else:
                # Mettre à jour le mot de passe si l'utilisateur existe déjà
                user.set_password(data['password'])
                user.is_superuser = data.get('is_superuser', user.is_superuser)
                user.is_staff = data.get('is_staff', user.is_staff)
                user.save()
                self.stdout.write(self.style.WARNING(f'⚠ User existant mis à jour: {user.username}'))
            
            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'profile_type': data['profile_type'],
                    'country': data['country']
                }
            )
            
            if profile_created:
                self.stdout.write(self.style.SUCCESS(
                    f'  → Profil {profile.get_profile_type_display()} créé'
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f'  → Profil déjà existant'
                ))
        
        self.stdout.write(self.style.SUCCESS('\n✓ Tous les profils sont prêts !'))
        self.stdout.write('\nCredentials:')
        self.stdout.write('  - daril / admin123 (Superuser)')
        self.stdout.write('  - local_paris / test1234 (Local)')
        self.stdout.write('  - touriste_usa / test1234 (Touriste)')
        self.stdout.write('  - pro_guide / test1234 (Professionnel)')