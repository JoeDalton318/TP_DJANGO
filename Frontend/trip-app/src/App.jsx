import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  console.log('🚀 App component loading...');
  
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    
    fetch('http://127.0.0.1:8000/api/attractions/popular/')
      .then(response => {
        console.log('📡 API response:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📊 API data:', data);
        setAttractions(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ API error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  console.log('🎯 Render state:', { loading, error, attractionsCount: attractions.length });

  if (loading) {
    return (
      <div className="container py-4">
        <h1 className="text-primary">🧭 Rechercher des Attractions</h1>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <div className="mt-3">Chargement des attractions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <h1 className="text-primary">🧭 Rechercher des Attractions</h1>
        <div className="alert alert-danger">
          ❌ Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-primary">🧭 Rechercher des Attractions</h1>
      
      <div className="mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Rechercher des attractions..."
        />
      </div>

      <div className="row g-3">
        {attractions.map((attraction, index) => (
          <div key={attraction.id || index} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{attraction.name}</h5>
                <p className="card-text">
                  📍 {attraction.city}, {attraction.country}
                </p>
                {attraction.rating && (
                  <p className="card-text">
                    ⭐ {attraction.rating}/5
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-muted">
        Attractions chargées: {attractions.length}
      </div>
    </div>
  );
}

export default App;
