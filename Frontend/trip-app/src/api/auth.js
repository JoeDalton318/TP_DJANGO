const API_URL = 'http://localhost:8000/api'; // Adapté à ton backend

// 🔐 Inscription
export async function registerUser(data) {
  const response = await fetch(`${API_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erreur lors de l’inscription');
  }

  return await response.json();
}
    export async function refreshToken(refresh) {
        const response = await axios.post('http://localhost:8000/api/auth/refresh/', { refresh });
        return response.data;
}

// 🔐 Connexion
export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Erreur lors de la connexion');
  }

  return await response.json();
}

// 👤 Récupérer les infos du profil actuel
export async function fetchProfile(token) {
  const response = await fetch(`${API_URL}/profile/me/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de récupérer le profil');
  }

  return await response.json();
}

// ✅ Sélectionner un profil (ex: voyageur, admin, etc.)
export async function selectProfile(profileId, token) {
  const response = await fetch(`${API_URL}/profile/select/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profile_id: profileId }),
  });

  if (!response.ok) {
    throw new Error('Impossible de sélectionner le profil');
  }

  return await response.json();
}

// 🔓 Déconnexion
export async function logoutProfile(token) {
  const response = await fetch(`${API_URL}/profile/logout/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la déconnexion');
  }

  return await response.json();
}
