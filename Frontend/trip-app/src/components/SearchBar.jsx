import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

const SearchBar = ({ onSearch, onLocationSearch, countries, categories, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [useLocation, setUseLocation] = useState(false);

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
              radius: 5, // 5km par défaut
              query: searchTerm
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
      category: selectedCategory
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedCategory('');
    setUseLocation(false);
  };

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
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
            title="Filtres"
          >
            <Filter size={20} />
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

      {/* Filtres avancés */}
      {showFilters && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Filtres de recherche</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Pays</label>
                <select
                  className="form-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Tous les pays</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.name}>
                      {country.name_fr || country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name_fr || category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {useLocation && (
              <div className="mt-3">
                <div className="alert alert-info d-flex align-items-center">
                  <MapPin size={16} className="me-2" />
                  Recherche géolocalisée activée - nous utiliserons votre position actuelle
                </div>
              </div>
            )}

            <div className="mt-3">
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;