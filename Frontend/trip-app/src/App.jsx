import React, { useState, useEffect } from 'react';
import { Map, List, Loader, AlertCircle, Globe } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Composants
import SearchBar from './components/SearchBar';
import AttractionCard from './components/AttractionCard';
import MapView from './components/MapView';
import AttractionModal from './components/AttractionModal';
import Pagination from './components/Pagination';

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
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNext: false,
    hasPrevious: false
  });
  
  // États pour le modal
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Chargement initial avec attractions populaires par région
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les données de configuration en parallèle
        const [countriesData, categoriesData] = await Promise.all([
          attractionsAPI.getCountries(),
          attractionsAPI.getCategories()
        ]);
        
        setCountries(countriesData.countries || []);
        setCategories(categoriesData.categories || []);
        
        // Essayer de détecter la région par géolocalisation ou utiliser France par défaut
        await loadPopularAttractionsByRegion();
        
      } catch (err) {
        console.error('Erreur chargement initial:', err);
        setError('Erreur lors du chargement des données. Vérifiez que le serveur Django est démarré.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  const loadPopularAttractionsByRegion = async (defaultCountry = 'France') => {
    try {
      // Charger les attractions populaires par défaut (France ou pays détecté)
      const attractionsData = await attractionsAPI.getPopularAttractions({ 
        country: defaultCountry, 
        limit: 20,
        page: 1
      });
      
      setAttractions(attractionsData.data || []);
      setPagination({
        currentPage: attractionsData.page || 1,
        totalPages: attractionsData.total_pages || 1,
        totalCount: attractionsData.total_count || 0,
        limit: attractionsData.limit || 20,
        hasNext: attractionsData.has_next || false,
        hasPrevious: attractionsData.has_previous || false
      });
      setLastSearch({ type: 'popular', country: defaultCountry });
      
    } catch (err) {
      console.error('Erreur chargement attractions par région:', err);
      // Fallback: charger sans filtre pays
      try {
        const fallbackData = await attractionsAPI.getPopularAttractions({ limit: 20, page: 1 });
        setAttractions(fallbackData.data || []);
        setPagination({
          currentPage: fallbackData.page || 1,
          totalPages: fallbackData.total_pages || 1,
          totalCount: fallbackData.total_count || 0,
          limit: fallbackData.limit || 20,
          hasNext: fallbackData.has_next || false,
          hasPrevious: fallbackData.has_previous || false
        });
        setLastSearch({ type: 'popular', country: 'global' });
      } catch (fallbackErr) {
        console.error('Erreur fallback:', fallbackErr);
        setError('Impossible de charger les attractions populaires');
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 20,
          hasNext: false,
          hasPrevious: false
        });
      }
    }
  };

  // Recherche textuelle avec pagination
  const handleSearch = async (searchParams, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setIsLocationSearch(false);
      setUserLocation(null);
      
      console.log('🔍 Recherche textuelle avec filtres:', searchParams, 'page:', page);
      
      // Construire les paramètres de recherche avec tous les filtres et pagination
      const searchRequest = {
        query: searchParams.query,
        country: searchParams.country,
        category: searchParams.category,
        page: page,
        limit: 20
      };

      // Ajouter les filtres avancés s'ils sont présents
      if (searchParams.min_rating) searchRequest.min_rating = searchParams.min_rating;
      if (searchParams.min_reviews) searchRequest.min_reviews = searchParams.min_reviews;
      if (searchParams.min_photos) searchRequest.min_photos = searchParams.min_photos;
      if (searchParams.price_level) searchRequest.price_level = searchParams.price_level;
      if (searchParams.opening_period) searchRequest.opening_period = searchParams.opening_period;
      if (searchParams.ordering) searchRequest.ordering = searchParams.ordering;
      
      const results = await attractionsAPI.searchAttractions(searchRequest);
      
      setAttractions(results.data || []);
      setPagination({
        currentPage: results.page || 1,
        totalPages: results.total_pages || 1,
        totalCount: results.total_count || 0,
        limit: results.limit || 20,
        hasNext: results.has_next || false,
        hasPrevious: results.has_previous || false
      });
      setLastSearch({ ...searchParams, type: 'search' });
      
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recherche géolocalisée avec pagination
  const handleLocationSearch = async (locationParams, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setIsLocationSearch(true);
      
      console.log('🧭 Recherche géolocalisée avec filtres:', locationParams, 'page:', page);
      
      // Sauvegarder la position de l'utilisateur
      setUserLocation({
        latitude: locationParams.latitude,
        longitude: locationParams.longitude
      });
      
      // Construire les paramètres de recherche géolocalisée
      const locationRequest = {
        latitude: locationParams.latitude,
        longitude: locationParams.longitude,
        radius: locationParams.radius || 5,
        page: page,
        limit: 20
      };

      // Ajouter les filtres avancés s'ils sont présents
      if (locationParams.category) locationRequest.category = locationParams.category;
      if (locationParams.min_rating) locationRequest.min_rating = locationParams.min_rating;
      if (locationParams.min_reviews) locationRequest.min_reviews = locationParams.min_reviews;
      if (locationParams.min_photos) locationRequest.min_photos = locationParams.min_photos;
      if (locationParams.price_level) locationRequest.price_level = locationParams.price_level;
      if (locationParams.ordering) locationRequest.ordering = locationParams.ordering;
      
      const results = await attractionsAPI.getNearbyAttractions(locationRequest);
      
      setAttractions(results.data || []);
      setPagination({
        currentPage: results.page || 1,
        totalPages: results.total_pages || 1,
        totalCount: results.total_count || 0,
        limit: results.limit || 20,
        hasNext: results.has_next || false,
        hasPrevious: results.has_previous || false
      });
      setLastSearch({ ...locationParams, type: 'location' });
      
    } catch (err) {
      console.error('Erreur recherche géolocalisée:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de page
  const handlePageChange = async (newPage) => {
    if (loading || newPage === pagination.currentPage) return;
    
    // Refaire la dernière recherche avec la nouvelle page
    if (lastSearch) {
      if (lastSearch.type === 'location') {
        await handleLocationSearch(lastSearch, newPage);
      } else if (lastSearch.type === 'search') {
        await handleSearch(lastSearch, newPage);
      } else if (lastSearch.type === 'popular') {
        // Gérer la pagination pour les attractions populaires
        try {
          setLoading(true);
          const attractionsData = await attractionsAPI.getPopularAttractions({ 
            country: lastSearch.country, 
            limit: 20,
            page: newPage
          });
          
          setAttractions(attractionsData.data || []);
          setPagination({
            currentPage: attractionsData.page || newPage,
            totalPages: attractionsData.total_pages || 1,
            totalCount: attractionsData.total_count || 0,
            limit: attractionsData.limit || 20,
            hasNext: attractionsData.has_next || false,
            hasPrevious: attractionsData.has_previous || false
          });
        } catch (err) {
          console.error('Erreur pagination populaires:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
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

  // Titre dynamique basé sur le type de recherche
  const getPageTitle = () => {
    if (!lastSearch) {
      return '🌟 Attractions Populaires';
    }

    switch (lastSearch.type) {
      case 'location':
        return `🧭 Attractions près de vous (${lastSearch.radius || 5} km)`;
      case 'search':
        if (lastSearch.query && lastSearch.country) {
          return `🔍 "${lastSearch.query}" en ${lastSearch.country}`;
        } else if (lastSearch.query) {
          return `🔍 Résultats pour "${lastSearch.query}"`;
        } else if (lastSearch.country) {
          return `🌍 Attractions en ${lastSearch.country}`;
        }
        return '🔍 Résultats de recherche';
      case 'popular':
        return lastSearch.country !== 'global' 
          ? `🌟 Attractions Populaires - ${lastSearch.country}`
          : '🌟 Attractions Populaires Mondiales';
      default:
        return '🌟 Découvrez des Attractions';
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
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              loading={loading}
            />
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
