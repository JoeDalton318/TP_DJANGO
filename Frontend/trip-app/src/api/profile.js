// src/api/profile.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export async function selectProfile(token, profile_type, selected_country) {
  const response = await axios.post(
    `${API_URL}/profile/select/`,
    { profile_type, selected_country },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function getProfile(token) {
  const response = await axios.get(
    `${API_URL}/profile/me/`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function logoutProfile(token) {
  const response = await axios.post(
    `${API_URL}/profile/logout/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
