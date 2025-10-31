import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes de marqueurs Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour l'utilisateur (plus visible)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -34],
  shadowSize: [50, 50]
});

// Icônes personnalisées selon la catégorie et la qualité
const createAttractionIcon = (attraction) => {
  let color = 'blue'; // Par défaut
  let size = [25, 41]; // Taille par défaut
  
  // Couleur selon la catégorie
  if (attraction.category === 'hotel') {
    color = 'green';
  } else if (attraction.category === 'restaurant') {
    color = 'orange';
  } else {
    color = 'blue'; // attraction
  }
  
  // Taille selon la qualité (rating et nombre d'avis)
  if (attraction.rating >= 4.5 && attraction.num_reviews >= 1000) {
    size = [35, 57]; // Très populaire
  } else if (attraction.rating >= 4.0 && attraction.num_reviews >= 100) {
    size = [30, 49]; // Populaire
  }
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: size,
    iconAnchor: [size[0]/2, size[1]],
    popupAnchor: [1, -34],
    shadowSize: [size[1], size[1]]
  });
};

// Composant pour ajuster la vue de la carte
const MapController = ({ center, zoom, attractions }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    } else if (attractions && attractions.length > 0) {
      // Calculer les limites pour afficher toutes les attractions
      const validLocations = attractions
        .filter(attr => attr.latitude && attr.longitude)
        .map(attr => [attr.latitude, attr.longitude]);
      
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [map, center, zoom, attractions]);

  return null;
};

const MapView = ({ 
  attractions = [], 
  userLocation = null, 
  center = [48.8566, 2.3522], // Paris par défaut
  zoom = 10,
  height = '400px',
  onMarkerClick = null 
}) => {
  const mapRef = useRef();

  // Filtrer les attractions qui ont des coordonnées valides
  const validAttractions = attractions.filter(
    attraction => attraction.latitude && 
                 attraction.longitude && 
                 !isNaN(attraction.latitude) && 
                 !isNaN(attraction.longitude)
  );

  // Fonction pour obtenir l'emoji selon la catégorie
  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      default: return '📍';
    }
  };

  // Fonction pour obtenir la couleur selon la qualité
  const getQualityColor = (attraction) => {
    if (attraction.rating >= 4.5) return '#28a745'; // Vert
    if (attraction.rating >= 4.0) return '#ffc107'; // Jaune
    if (attraction.rating >= 3.5) return '#fd7e14'; // Orange
    return '#6c757d'; // Gris
  };

  return (
    <div style={{ height, width: '100%' }} className="border rounded">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          center={userLocation ? [userLocation.latitude, userLocation.longitude] : null}
          zoom={zoom}
          attractions={validAttractions}
        />
        
        {/* Marqueur de l'utilisateur avec cercle de proximité */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.latitude, userLocation.longitude]} 
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>🎯 Votre position</strong>
                  <br />
                  <small className="text-muted">
                    📐 Lat: {userLocation.latitude.toFixed(6)}<br />
                    📐 Lng: {userLocation.longitude.toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>
            
            {/* Cercle de proximité autour de l'utilisateur */}
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={20}
              pathOptions={{ 
                color: '#dc3545', 
                fillColor: '#dc3545', 
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          </>
        )}
        
        {/* Marqueurs des attractions avec cercles colorés */}
        {validAttractions.map((attraction, index) => (
          <React.Fragment key={attraction.id || index}>
            {/* Cercle coloré selon la qualité */}
            <CircleMarker
              center={[attraction.latitude, attraction.longitude]}
              radius={12 + (attraction.rating >= 4.5 ? 8 : attraction.rating >= 4.0 ? 4 : 0)}
              pathOptions={{ 
                color: getQualityColor(attraction), 
                fillColor: getQualityColor(attraction), 
                fillOpacity: 0.3,
                weight: 3
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]} className="map-tooltip">
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {getCategoryEmoji(attraction.category)} {attraction.rating ? `⭐${attraction.rating}` : ''}
                </span>
              </Tooltip>
            </CircleMarker>
            
            {/* Marqueur principal */}
            <Marker
              position={[attraction.latitude, attraction.longitude]}
              icon={createAttractionIcon(attraction)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(attraction);
                  }
                }
              }}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div style={{ minWidth: '250px' }}>
                  {/* En-tête avec nom et catégorie */}
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{ fontSize: '20px' }}>
                      {getCategoryEmoji(attraction.category)}
                    </span>
                    <h6 className="mb-0 flex-grow-1">{attraction.name}</h6>
                  </div>
                  
                  {/* Localisation */}
                  {attraction.city && attraction.country && (
                    <p className="mb-2 text-muted d-flex align-items-center">
                      <span className="me-1">📍</span>
                      {attraction.city}, {attraction.country}
                    </p>
                  )}
                  
                  {/* Rating et avis */}
                  {attraction.rating && (
                    <div className="mb-2">
                      <span className="fw-bold" style={{ color: getQualityColor(attraction) }}>
                        ⭐ {attraction.rating}/5
                      </span>
                      {attraction.num_reviews && (
                        <span className="text-muted ms-1">
                          ({attraction.num_reviews.toLocaleString()} avis)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Distance si disponible */}
                  {attraction.distance && (
                    <p className="mb-2 text-success d-flex align-items-center">
                      <span className="me-1">📏</span>
                      Distance: {parseFloat(attraction.distance).toFixed(1)} km
                      {attraction.bearing && ` (${attraction.bearing})`}
                    </p>
                  )}
                  
                  {/* Prix si disponible */}
                  {attraction.price_level && (
                    <p className="mb-2 d-flex align-items-center">
                      <span className="me-1">💰</span>
                      {typeof attraction.price_level === 'string' && attraction.price_level.includes('€') 
                        ? attraction.price_level 
                        : '€'.repeat(attraction.price_level)
                      }
                    </p>
                  )}
                  
                  {/* Awards si disponibles */}
                  {attraction.awards && attraction.awards.length > 0 && (
                    <p className="mb-2 d-flex align-items-center">
                      <span className="me-1">🏆</span>
                      <span className="badge bg-warning text-dark">
                        Travelers Choice {attraction.awards[0].year}
                      </span>
                    </p>
                  )}
                  
                  {/* Image si disponible */}
                  {attraction.main_image && (
                    <img 
                      src={attraction.main_image}
                      alt={attraction.name}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #dee2e6'
                      }}
                      className="mt-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Bouton pour voir les détails */}
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onMarkerClick && onMarkerClick(attraction)}
                    >
                      Voir détails complets
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
      
      {/* Légende */}
      <div 
        className="position-absolute bg-white border rounded p-2 shadow-sm"
        style={{ 
          bottom: '10px', 
          right: '10px', 
          zIndex: 1000,
          fontSize: '12px'
        }}
      >
        <div className="fw-bold mb-1">Légende</div>
        <div>🏛️ Attractions • 🏨 Hôtels • 🍽️ Restaurants</div>
        <div className="mt-1">
          <span style={{ color: '#28a745' }}>●</span> Excellent (4.5+) •
          <span style={{ color: '#ffc107' }}>●</span> Très bon (4.0+) •
          <span style={{ color: '#fd7e14' }}>●</span> Bon (3.5+)
        </div>
      </div>
    </div>
  );
};

export default MapView;