/**
 * Utilitaires pour la gestion des tokens JWT
 */

// Fonction pour vérifier si un token JWT est expiré
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Décoder le payload du JWT sans vérifier la signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Vérifier si le token est expiré (avec une marge de 30 secondes)
    return payload.exp < (currentTime + 30);
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return true; // Si on ne peut pas décoder, considérer comme expiré
  }
};

// Fonction pour nettoyer les tokens expirés
export const clearExpiredTokens = () => {
  const token = localStorage.getItem('access_token');
  if (token && isTokenExpired(token)) {
    console.log('🧹 Token expiré détecté, nettoyage du localStorage');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return true;
  }
  return false;
};

// Fonction pour obtenir un token valide (retourne null si expiré)
export const getValidToken = () => {
  clearExpiredTokens();
  return localStorage.getItem('access_token');
};

// Helper pour inclure le token dans les headers avec vérification d'expiration
export const getAuthHeaders = () => {
  const token = getValidToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};