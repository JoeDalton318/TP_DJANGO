// src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users/auth';

export async function register(username, password, email) {
  const response = await axios.post(`${API_URL}/register/`, { username, password, email });
  return response.data;
}

export async function login(username, password) {
  const response = await axios.post(`${API_URL}/login/`, { username, password });
  return response.data;
}

export async function refreshToken(refresh) {
  const response = await axios.post(`${API_URL}/refresh/`, { refresh });
  return response.data;
}
