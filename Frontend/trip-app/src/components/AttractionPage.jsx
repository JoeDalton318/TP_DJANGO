// src/components/AttractionPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getAttractionDetail, getTripAdvisorDetail, getTripAdvisorReviews } from '../api/attraction';

const AttractionPage = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [attraction, setAttraction] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const att = await getAttractionDetail(token, id);
      setAttraction(att);
      // Supposons que `att` comporte `location_id`
      const trip = await getTripAdvisorDetail(token, att.location_id);
      setTripDetails(trip);
      const rev = await getTripAdvisorReviews(token, att.location_id);
      setReviews(rev.data || []);
    };
    if (token) {
      fetchData();
    }
  }, [token, id]);

  if (!attraction || !tripDetails) return <div>Chargement...</div>;

  return (
    <div>
      <h1>{attraction.name}</h1>
      <p>{attraction.description}</p>
      <p>Note TripAdvisor: {tripDetails.rating}</p>
      <h2>Avis</h2>
      <ul>
        {reviews.map(r => (
          <li key={r.id}>{r.title} — {r.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default AttractionPage;
