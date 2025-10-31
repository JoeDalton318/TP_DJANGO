import requests
import os
import logging

logger = logging.getLogger(__name__)

API_KEY = os.getenv("TRIPADVISOR_API_KEY")
BASE_URL = "https://api.content.tripadvisor.com/api/v1/location"

def get_location_details(location_id):
    """
    Récupère les détails d'une attraction depuis l’API TripAdvisor.
    """
    if not API_KEY:
        logger.error("Clé API TripAdvisor non trouvée.")
        return {"error": "Clé API manquante."}

    url = f"{BASE_URL}/{location_id}/details"
    params = {
        "language": "fr"
    }
    headers = {
        "accept": "application/json",
        "x-api-key": API_KEY
    }

    try:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Erreur API TripAdvisor (Details): {response.status_code} - {response.text}")
            return {"error": "Erreur lors de l'appel à TripAdvisor", "status": response.status_code}
    except requests.RequestException as e:
        logger.exception("Erreur réseau lors de l'appel à TripAdvisor (Details).")
        return {"error": str(e)}

def get_reviews_for_location(location_id):
    """
    Récupère les avis d'une attraction depuis l’API TripAdvisor.
    """
    if not API_KEY:
        logger.error("Clé API TripAdvisor non trouvée.")
        return {"error": "Clé API manquante."}

    url = f"{BASE_URL}/{location_id}/reviews"
    params = {
        "language": "fr"
    }
    headers = {
        "accept": "application/json",
        "x-api-key": API_KEY
    }

    try:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Erreur API TripAdvisor (Reviews): {response.status_code} - {response.text}")
            return {"error": "Erreur lors de l'appel à TripAdvisor", "status": response.status_code}
    except requests.RequestException as e:
        logger.exception("Erreur réseau lors de l'appel à TripAdvisor (Reviews).")
        return {"error": str(e)}
