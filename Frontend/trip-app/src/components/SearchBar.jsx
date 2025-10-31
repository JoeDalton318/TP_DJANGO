import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Sliders } from 'lucide-react';

const SearchBar = ({ onSearch, onLocationSearch, countries, categories, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  
  // Filtres avancés basés sur les données réelles de l'API
  const [radius, setRadius] = useState(5);
  const [minRating, setMinRating] = useState('');
  const [minReviews, setMinReviews] = useState('');
  const [minPhotos, setMinPhotos] = useState('');
  const [priceLevel, setPriceLevel] = useState('');
  const [ordering, setOrdering] = useState('-num_reviews');

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (useLocation) {
      // Recherche géolocalisée
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onLocationSearch({
              latitude,
              longitude,
              radius,
              query: searchTerm,
              category: selectedCategory,
              min_rating: minRating,
              min_reviews: minReviews,
              min_photos: minPhotos,
              price_level: priceLevel,
              ordering: ordering
            });
          },
          (error) => {
            console.error('Erreur géolocalisation:', error);
            alert('Impossible d\'accéder à votre position. Effectuation d\'une recherche classique.');
            performTextSearch();
          }
        );
      } else {
        alert('Géolocalisation non supportée par votre navigateur.');
        performTextSearch();
      }
    } else {
      performTextSearch();
    }
  };

  const performTextSearch = () => {
    onSearch({
      query: searchTerm,
      country: selectedCountry,
      category: selectedCategory,
      min_rating: minRating,
      min_reviews: minReviews,
      min_photos: minPhotos,
      price_level: priceLevel,
      ordering: ordering
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedCategory('');
    setUseLocation(false);
    setRadius(5);
    setMinRating('');
    setMinReviews('');
    setMinPhotos('');
    setPriceLevel('');
    setOrdering('-num_reviews');
  };

  const hasAdvancedFilters = minRating || minReviews || minPhotos || priceLevel || ordering !== '-num_reviews' || (useLocation && radius !== 5);

  // Catégories disponibles basées sur les données réelles
  const realCategories = [
    { id: 'attraction', name: 'Attractions' },
    { id: 'hotel', name: 'Hôtels' },
    { id: 'restaurant', name: 'Restaurants' }
  ];

  return (
    <div className="search-container mb-4">
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Rechercher des attractions, monuments, musées..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="button"
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtres avancés"
          >
            <Filter size={20} />
            {hasAdvancedFilters && <span className="badge bg-warning text-dark ms-1">!</span>}
          </button>
          <button
            type="button"
            className={`btn ${useLocation ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setUseLocation(!useLocation)}
            title="Recherche autour de moi"
          >
            <MapPin size={20} />
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Recherche...</span>
              </div>
            ) : (
              <Search size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Filtres de base */}
      {showFilters && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title d-flex align-items-center">
              <Sliders size={18} className="me-2" />
              Filtres de recherche
            </h6>
            
            {/* Filtres de base */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {realCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Pays</label>
                <select
                  className="form-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Tous les pays</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name_fr}>
                      {country.name_fr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rayon de recherche (si géolocalisation activée) */}
            {useLocation && (
              <div className="mb-3">
                <label className="form-label">Rayon de recherche: {radius} km</label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}

            {/* Filtres avancés */}
            <hr />
            <h6 className="mb-3">Filtres de qualité</h6>
            
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Note minimum</label>
                <select
                  className="form-select"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <option value="">Toutes les notes</option>
                  <option value="3.0">⭐ 3.0+ étoiles</option>
                  <option value="3.5">⭐ 3.5+ étoiles</option>
                  <option value="4.0">⭐ 4.0+ étoiles</option>
                  <option value="4.5">⭐ 4.5+ étoiles</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Avis minimum</label>
                <select
                  className="form-select"
                  value={minReviews}
                  onChange={(e) => setMinReviews(e.target.value)}
                >
                  <option value="">Tous les nombres</option>
                  <option value="50">50+ avis</option>
                  <option value="100">100+ avis</option>
                  <option value="500">500+ avis</option>
                  <option value="1000">1000+ avis</option>
                  <option value="5000">5000+ avis</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Photos minimum</label>
                <select
                  className="form-select"
                  value={minPhotos}
                  onChange={(e) => setMinPhotos(e.target.value)}
                >
                  <option value="">Tous les nombres</option>
                  <option value="5">5+ photos</option>
                  <option value="10">10+ photos</option>
                  <option value="50">50+ photos</option>
                  <option value="100">100+ photos</option>
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Niveau de prix</label>
                <select
                  className="form-select"
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value)}
                >
                  <option value="">Tous les prix</option>
                  <option value="1">€ Économique</option>
                  <option value="2">€€ Modéré</option>
                  <option value="3">€€€ Cher</option>
                  <option value="4">€€€€ Très cher</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Trier par</label>
                <select
                  className="form-select"
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                >
                  <option value="-num_reviews">💬 Plus d'avis d'abord</option>
                  <option value="-rating">⭐ Meilleures notes d'abord</option>
                  <option value="ranking">🏆 Meilleur classement</option>
                  <option value="name">🔤 Nom A-Z</option>
                  <option value="-name">🔤 Nom Z-A</option>
                </select>
              </div>
            </div>
            
            {/* État géolocalisation */}
            {useLocation && (
              <div className="alert alert-info d-flex align-items-center">
                <MapPin size={16} className="me-2" />
                Recherche géolocalisée activée - Rayon: {radius} km autour de votre position
              </div>
            )}

            {/* Indicateur de filtres actifs */}
            {hasAdvancedFilters && (
              <div className="alert alert-warning d-flex align-items-center">
                <Filter size={16} className="me-2" />
                Des filtres avancés sont actifs
              </div>
            )}

            {/* Actions */}
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                Réinitialiser tous les filtres
              </button>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm"
                disabled={loading}
                onClick={handleSearch}
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;