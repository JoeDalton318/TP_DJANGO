#!/usr/bin/env python
"""
Script de démarrage personnalisé pour Django qui utilise la variable PORT depuis .env
"""
import os
import sys
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

def main():
    """Démarre le serveur Django avec le port configuré"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_app.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Récupération du port depuis les variables d'environnement
    port = os.getenv('PORT', '8000')
    
    # Construction de la commande avec le port
    if len(sys.argv) == 1:
        # Si aucun argument, on lance runserver avec le port configuré
        sys.argv = ['manage.py', 'runserver', f'0.0.0.0:{port}']
    elif len(sys.argv) == 2 and sys.argv[1] == 'runserver':
        # Si runserver sans port, on ajoute le port configuré
        sys.argv.append(f'0.0.0.0:{port}')
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()