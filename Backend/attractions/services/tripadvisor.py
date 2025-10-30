import os
import requests
from django.conf import settings

class TripAdvisorClient:
    BASE_URL = "https://api.content.tripadvisor.com/api/partner/2.0/location"

    def __init__(self):
        self.api_key = settings.TRIPADVISOR_API_KEY
        if not self.api_key:
            raise ValueError("TripAdvisor API key is not configured")

    def get_location_details(self, location_id: str, language: str = "en"):
        """
        Récupère les détails d'une attraction via l'API TripAdvisor.
        :param location_id: identifiant Tripadvisor
        :param language: langue souhaitée (ex: "en", "fr")
        :return: dict des données ou None en cas d'erreur
        """
        url = f"{self.BASE_URL}/{location_id}"
        params = {
            "key": self.api_key,
            "lang": language
        }
        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
        except requests.RequestException as exc:
            # log un warning ou renvoie None
            return None

        return resp.json()
def get_location_reviews(location_id):
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
