import React, { useState, useEffect } from 'react';
import { Map, List, Loader, AlertCircle, Globe } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Composants
import SearchBar from './components/SearchBar';
import AttractionCard from './components/AttractionCard';
import MapView from './components/MapView';
import AttractionModal from './components/AttractionModal';

// Services
import { attractionsAPI } from './services/api';

function App() {
  // États principaux
  const [attractions, setAttractions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  
  // États pour la recherche
  const [lastSearch, setLastSearch] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  
  // États pour le modal
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les données initiales en parallèle
      const [attractionsData, countriesData, categoriesData] = await Promise.all([
        attractionsAPI.getPopularAttractions({ limit: 12 }),
        attractionsAPI.getCountries(),
        attractionsAPI.getCategories()
      ]);
      
      setAttractions(attractionsData.data || []);
      setCountries(countriesData.countries || []);
      setCategories(categoriesData.categories || []);
      
    } catch (err) {
      console.error('Erreur chargement initial:', err);
      setError('Erreur lors du chargement des données. Vérifiez que le serveur Django est démarré.');
    } finally {
      setLoading(false);
    }
  };

  // Recherche textuelle
  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      setIsLocationSearch(false);
      setUserLocation(null);
      
      console.log('� Recherche textuelle:', searchParams);
      
      const results = await attractionsAPI.searchAttractions({
        query: searchParams.query,
        country: searchParams.country,
        category: searchParams.category,
        limit: 20
      });
      
      setAttractions(results.data || []);
      setLastSearch(searchParams);
      
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recherche géolocalisée
  const handleLocationSearch = async (locationParams) => {
    try {
      setLoading(true);
      setError(null);
      setIsLocationSearch(true);
      
      console.log('🧭 Recherche géolocalisée:', locationParams);
      
      // Sauvegarder la position de l'utilisateur
      setUserLocation({
        latitude: locationParams.latitude,
        longitude: locationParams.longitude
      });
      
      const results = await attractionsAPI.getNearbyAttractions({
        latitude: locationParams.latitude,
        longitude: locationParams.longitude,
        radius: locationParams.radius || 5,
        limit: 20
      });
      
      setAttractions(results.data || []);
      setLastSearch(locationParams);
      
    } catch (err) {
      console.error('Erreur recherche géolocalisée:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Afficher les détails d'une attraction
  const handleViewDetails = (attraction) => {
    setSelectedAttraction(attraction);
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAttraction(null);
  };

  // Clic sur marqueur de carte
  const handleMarkerClick = (attraction) => {
    handleViewDetails(attraction);
  };

  // Titre dynamique
  const getPageTitle = () => {
    if (isLocationSearch) {
      return `🧭 Attractions près de vous`;
    } else if (lastSearch?.query) {
      return `🔍 Résultats pour "${lastSearch.query}"`;
    } else if (lastSearch?.country) {
      return `🌍 Attractions en ${lastSearch.country}`;
    } else {
      return '🌟 Attractions Populaires';
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <header className="bg-primary text-white py-3 shadow">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-0 d-flex align-items-center">
                <Globe className="me-2" size={32} />
                Trip Explorer
              </h1>
              <small>Découvrez les meilleures attractions avec TripAdvisor</small>
            </div>
            <div className="col-auto">
              {/* Toggle vue liste/carte */}
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${viewMode === 'list' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} className="me-1" />
                  Liste
                </button>
                <button
                  type="button"
                  className={`btn ${viewMode === 'map' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setViewMode('map')}
                >
                  <Map size={16} className="me-1" />
                  Carte
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container py-4">
        {/* Barre de recherche */}
        <SearchBar
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
          countries={countries}
          categories={categories}
          loading={loading}
        />

        {/* Titre et compteur */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">{getPageTitle()}</h2>
          {attractions.length > 0 && (
            <span className="badge bg-secondary">
              {attractions.length} attraction{attractions.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="text-center py-5">
            <Loader className="spinner-border text-primary" size={40} />
            <div className="mt-3">
              <strong>Recherche en cours...</strong>
              <br />
              <small className="text-muted">
                {isLocationSearch 
                  ? 'Recherche d\'attractions près de vous...' 
                  : 'Recherche d\'attractions...'
                }
              </small>
            </div>
          </div>
        )}

        {/* État d'erreur */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <AlertCircle className="me-2" size={20} />
            <div>
              <strong>Erreur</strong>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Résultats */}
        {!loading && !error && attractions.length === 0 && lastSearch && (
          <div className="text-center py-5">
            <div className="text-muted">
              <Globe size={48} className="mb-3" />
              <h5>Aucune attraction trouvée</h5>
              <p>Essayez avec d'autres mots-clés ou élargissez votre zone de recherche.</p>
            </div>
          </div>
        )}

        {/* Affichage des résultats */}
        {!loading && !error && attractions.length > 0 && (
          <>
            {viewMode === 'list' ? (
              // Vue liste
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {attractions.map((attraction, index) => (
                  <AttractionCard
                    key={attraction.id || index}
                    attraction={attraction}
                    onViewDetails={handleViewDetails}
                    showDistance={isLocationSearch}
                  />
                ))}
              </div>
            ) : (
              // Vue carte
              <div className="row">
                <div className="col-12">
                  <MapView
                    attractions={attractions}
                    userLocation={userLocation}
                    height="600px"
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de détails */}
      <AttractionModal
        attraction={selectedAttraction}
        isOpen={showModal}
        onClose={handleCloseModal}
      />

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h6>Trip Explorer</h6>
              <p className="mb-0">Powered by TripAdvisor API</p>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                Développé avec React + Django + TripAdvisor API
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
