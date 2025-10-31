import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes de markers par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CompilationMap = ({ attractions }) => {
  const mapRef = useRef(null);

  // Filtrer les attractions avec coordonnées valides
  const validAttractions = attractions.filter(
    (attraction) => attraction.latitude && attraction.longitude
  );

  // Si aucune attraction n'a de coordonnées, ne rien afficher
  if (validAttractions.length === 0) {
    return (
      <div className="alert alert-info">
        <p className="mb-0">Aucune attraction avec des coordonnées GPS disponibles pour afficher la carte.</p>
      </div>
    );
  }

  // Calculer le centre de la carte (moyenne des coordonnées)
  const center = [
    validAttractions.reduce((sum, a) => sum + parseFloat(a.latitude), 0) / validAttractions.length,
    validAttractions.reduce((sum, a) => sum + parseFloat(a.longitude), 0) / validAttractions.length,
  ];

  // Créer les coordonnées pour la polyline (itinéraire)
  const routeCoordinates = validAttractions.map((attraction) => [
    parseFloat(attraction.latitude),
    parseFloat(attraction.longitude),
  ]);

  // Créer une icône numérotée pour chaque marker
  const createNumberedIcon = (number) => {
    return L.divIcon({
      className: 'custom-numbered-icon',
      html: `<div style="
        background-color: #dc3545;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${number}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

  useEffect(() => {
    // Ajuster la vue pour inclure tous les markers
    if (mapRef.current && validAttractions.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [validAttractions]);

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={center}
        zoom={validAttractions.length === 1 ? 13 : 10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Afficher les markers numérotés */}
        {validAttractions.map((attraction, index) => (
          <Marker
            key={attraction.id}
            position={[parseFloat(attraction.latitude), parseFloat(attraction.longitude)]}
            icon={createNumberedIcon(index + 1)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div style={{ minWidth: '250px', padding: '8px' }}>
                <h6 className="mb-2 fw-bold text-primary" style={{ fontSize: '16px' }}>{attraction.name}</h6>
                {attraction.main_image && (
                  <img
                    src={attraction.main_image}
                    alt={attraction.name}
                    style={{ 
                      width: '100%', 
                      height: '120px', 
                      objectFit: 'cover', 
                      borderRadius: '8px', 
                      marginBottom: '10px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
                <div className="d-flex align-items-center mb-2">
                  <span className="text-muted small me-2">📍</span>
                  <small className="text-muted">{attraction.city}, {attraction.country}</small>
                </div>
                {attraction.rating && (
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-1">⭐</span>
                    <small className="fw-bold">{attraction.rating.toFixed(1)}</small>
                    <small className="text-muted ms-1">({attraction.num_reviews || 0} avis)</small>
                  </div>
                )}
                {attraction.category && (
                  <div className="mt-2">
                    <span className="badge bg-primary" style={{ fontSize: '11px' }}>
                      {attraction.category}
                    </span>
                  </div>
                )}
                {attraction.price_level && (
                  <div className="mt-2">
                    <small className="text-success fw-bold">{attraction.price_level}</small>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Afficher l'itinéraire (polyline) si plus d'une attraction */}
        {validAttractions.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#0d6efd"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
            dashOffset="5"
          />
        )}
      </MapContainer>

      {/* Légende améliorée */}
      <div className="mt-3 p-3 bg-light rounded">
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#dc3545',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              border: '2px solid white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              marginRight: '8px'
            }}>1</div>
            <small className="text-muted">Les numéros indiquent l'ordre de votre itinéraire</small>
          </div>
          <div className="d-flex align-items-center">
            <div style={{
              width: '40px',
              height: '3px',
              background: 'repeating-linear-gradient(90deg, #0d6efd 0px, #0d6efd 10px, transparent 10px, transparent 20px)',
              marginRight: '8px'
            }}></div>
            <small className="text-muted">Trajet suggéré entre les attractions</small>
          </div>
        </div>
        <div className="mt-2">
          <small className="text-primary">
            💡 <strong>Astuce:</strong> Cliquez sur les marqueurs pour voir les détails de chaque attraction
          </small>
        </div>
      </div>
    </div>
  );
};

export default CompilationMap;
