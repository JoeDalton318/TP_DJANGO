import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes de marqueurs Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour l'utilisateur
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône personnalisée pour les attractions
const attractionIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour ajuster la vue de la carte
const MapController = ({ center, zoom, attractions }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    } else if (attractions && attractions.length > 0) {
      // Calculer les limites pour afficher toutes les attractions
      const validLocations = attractions
        .filter(attr => attr.location && attr.location.length === 2)
        .map(attr => attr.location);
      
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [20, 20] });
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
    attraction => attraction.location && 
                 Array.isArray(attraction.location) && 
                 attraction.location.length === 2 &&
                 !isNaN(attraction.location[0]) && 
                 !isNaN(attraction.location[1])
  );

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
        
        {/* Marqueur de l'utilisateur */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={userIcon}
          >
            <Popup>
              <div>
                <strong>Votre position</strong>
                <br />
                <small>
                  Lat: {userLocation.latitude.toFixed(6)}<br />
                  Lng: {userLocation.longitude.toFixed(6)}
                </small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marqueurs des attractions */}
        {validAttractions.map((attraction, index) => (
          <Marker
            key={attraction.id || index}
            position={[attraction.location[0], attraction.location[1]]}
            icon={attractionIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(attraction);
                }
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h6 className="mb-2">{attraction.name}</h6>
                {attraction.city && attraction.country && (
                  <p className="mb-1 text-muted">
                    📍 {attraction.city}, {attraction.country}
                  </p>
                )}
                {attraction.rating && (
                  <p className="mb-1">
                    ⭐ {attraction.rating}/5
                    {attraction.num_reviews && (
                      <span className="text-muted"> ({attraction.num_reviews} avis)</span>
                    )}
                  </p>
                )}
                {attraction.distance && (
                  <p className="mb-1 text-success">
                    📏 Distance: {parseFloat(attraction.distance).toFixed(1)} km
                  </p>
                )}
                {attraction.main_image && (
                  <img 
                    src={attraction.main_image} 
                    alt={attraction.name}
                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                    className="mt-2"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;