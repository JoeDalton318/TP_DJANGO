// src/api/attraction.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export async function getAttractionDetail(token, id) {
  const response = await axios.get(`${BASE_URL}/attractions/${id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function getTripAdvisorDetail(token, location_id) {
  const response = await axios.get(`${BASE_URL}/attractions/tripadvisor/${location_id}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function getTripAdvisorReviews(token, location_id) {
  const response = await axios.get(`${BASE_URL}/attractions/tripadvisor/${location_id}/reviews/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
