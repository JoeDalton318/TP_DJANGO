import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';
import AttractionCard from '../components/AttractionCard';
import { attractionsAPI } from '../services/api';

// Hook personnalisé pour debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchPage = () => {
  // États pour les données
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [criticalError, setCriticalError] = useState(null); // Pour les erreurs critiques

  // États pour les filtres avec optimisation
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce 500ms
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    country: '',
    min_rating: '',
    price_level: '',
    ordering: '-num_likes'
  });

  // États pour les options de filtres
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [hotelStyles, setHotelStyles] = useState([]);
  const [attractionTypes, setAttractionTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Charger les catégories et autres données au montage du composant
  useEffect(() => {
    loadFiltersData();
  }, []);

  const loadFiltersData = async () => {
    try {
      console.log('🔄 Loading filters data...');
      // Charger les données une par une pour isoler les erreurs
      const loadPromises = [
        attractionsAPI.getCategories().catch(err => { console.warn('Categories failed:', err); return []; }),
        attractionsAPI.getCountries().catch(err => { console.warn('Countries failed:', err); return []; }),
        attractionsAPI.getCuisines().catch(err => { console.warn('Cuisines failed:', err); return []; }),
        attractionsAPI.getHotelStyles().catch(err => { console.warn('Hotel styles failed:', err); return []; }),
        attractionsAPI.getAttractionTypes().catch(err => { console.warn('Attraction types failed:', err); return []; }),
      ];
      
      const [categoriesData, countriesData, cuisinesData, hotelStylesData, attractionTypesData] = await Promise.all(loadPromises);
      
      console.log('📊 Filters data received:', {
        categories: categoriesData,
        countries: countriesData,
        cuisines: cuisinesData,
        hotelStyles: hotelStylesData,
        attractionTypes: attractionTypesData
      });
      
      // Adapter les formats de données pour correspondre aux API réelles
      setCategories(categoriesData?.categories ? categoriesData.categories.map(cat => ({
        value: cat.id,
        label: cat.name_fr || cat.name,
        icon: 'grid-3x3-gap', // Icône par défaut
        count: 0 // Pas de count dans l'API réelle
      })) : []);
      
      setCountries(countriesData?.countries ? countriesData.countries.map(country => ({
        value: country.name,
        label: country.name_fr || country.name,
        count: 0 // Pas de count dans l'API réelle
      })) : []);
      
      setCuisines(cuisinesData?.cuisines ? cuisinesData.cuisines.map(cuisine => ({
        value: cuisine.id,
        label: cuisine.name_fr || cuisine.name,
        count: 0
      })) : []);
      
      setHotelStyles(hotelStylesData?.hotel_styles ? hotelStylesData.hotel_styles.map(style => ({
        value: style.id,
        label: style.name_fr || style.name,
        count: 0
      })) : []);
      
      setAttractionTypes(attractionTypesData?.attraction_types ? attractionTypesData.attraction_types.map(type => ({
        value: type.id,
        label: type.name_fr || type.name,
        count: 0
      })) : []);
      
      console.log('✅ Filters data processed successfully');
    } catch (error) {
      console.error('❌ Error loading filters data:', error);
      // Ne pas bloquer l'application, juste logguer l'erreur
    }
  };

  // Fonction de recherche optimisée
  const searchAttractions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        ...filters,
        query: debouncedSearchQuery, // Utiliser la valeur debouncée
        page,
        page_size: 20
      };

      // Nettoyer les paramètres vides
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null) {
          delete searchParams[key];
        }
      });

      const response = await attractionsAPI.searchAttractions(searchParams);
      
      if (page === 1) {
        setAttractions(response.data || []);
      } else {
        setAttractions(prev => [...prev, ...(response.data || [])]);
      }
      
      setTotalResults(response.total_count || response.count || 0);
      setCurrentPage(page);
      setHasSearched(true);
    } catch (error) {
      setError(error.message);
      setAttractions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, filters]);

  // Gérer la soumission du formulaire de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchAttractions(1);
  };

  // Gérer les changements de filtres
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Charger plus de résultats
  const loadMore = () => {
    if (!loading) {
      searchAttractions(currentPage + 1);
    }
  };

  // Gérer le clic sur une attraction
  const handleAttractionClick = (attraction) => {
    console.log('Attraction sélectionnée:', attraction);
    // TODO: Navigation vers la page de détail
  };

  // Recherche initiale avec attractions populaires - CORRIGÉ POUR ÉVITER LA BOUCLE
  useEffect(() => {
    let isMounted = true; // Flag pour éviter les mises à jour si le composant est démonté
    
    const loadPopularAttractions = async () => {
      if (!isMounted) return;
      
      console.log('🔄 Loading popular attractions...');
      setLoading(true);
      setError(null);
      
      try {
        const response = await attractionsAPI.getPopularAttractions({ limit: 20, page: 1 });
        console.log('📊 Popular attractions response:', response);
        
        if (!isMounted) return; // Éviter les mises à jour si démonté
        
        // S'assurer que la réponse a le bon format
        if (response && response.data) {
          console.log('✅ Setting attractions:', response.data.length, 'items');
          setAttractions(response.data);
          setTotalResults(response.total_count || response.count || response.data.length);
        } else if (Array.isArray(response)) {
          // Fallback si la réponse est directement un tableau
          console.log('✅ Setting attractions (array):', response.length, 'items');
          setAttractions(response);
          setTotalResults(response.length);
        } else {
          console.warn('⚠️  Unexpected response format:', response);
          setAttractions([]);
          setTotalResults(0);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('❌ Error loading popular attractions:', error);
        setError(`Erreur lors du chargement: ${error.message}`);
        setAttractions([]);
        setTotalResults(0);
        
        // Si c'est une erreur critique de connexion, l'afficher
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          setCriticalError(`Impossible de se connecter au serveur. Vérifiez que le backend Django fonctionne sur http://127.0.0.1:8000`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPopularAttractions();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Dépendances vides pour ne charger qu'une seule fois

  // Effect pour déclencher automatiquement la recherche quand les filtres changent
  useEffect(() => {
    // Ne pas déclencher si aucune recherche n'a encore été faite
    if (hasSearched) {
      console.log('🔄 Filtres changés, nouvelle recherche automatique...');
      searchAttractions(1);
    }
  }, [filters, hasSearched, searchAttractions]);

  return (
    <div className="container-fluid bg-light min-vh-100">
      {/* Gestion des erreurs critiques */}
      {criticalError && (
        <div className="container py-4">
          <div className="alert alert-danger text-center" role="alert">
            <AlertCircle size={48} className="mb-3" />
            <h4>Erreur de connexion</h4>
            <p>{criticalError}</p>
            <button 
              className="btn btn-outline-danger"
              onClick={() => {
                setCriticalError(null);
                setError(null);
                window.location.reload();
              }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      )}
      
      {!criticalError && (
        <div className="container py-4">
          {/* Header avec recherche */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-primary mb-4">
                <i className="bi bi-compass me-3"></i>
                Rechercher des Attractions
              </h1>
            </div>
          </div>
          
          {/* Barre de recherche principale */}
          <div className="row mb-4">
            <div className="col-12">
              <form onSubmit={handleSearch} className="d-flex flex-column flex-lg-row gap-3">
                <div className="input-group flex-grow-1">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={20} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher des attractions, villes, pays..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control border-start-0 ps-0"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline-secondary border-start-0"
                    data-bs-toggle="tooltip"
                    title="Filtres avancés"
                  >
                    <Filter size={20} />
                  </button>
                </div>
                <button type="submit" className="btn btn-primary px-4">
                  <Search size={18} className="me-2" />
                  Rechercher
                </button>
              </form>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <Filter size={18} className="me-2" />
                      Filtres avancés
                    </h5>
                  </div>
                  <div className="card-body">
                    {/* Filtres par catégorie - Version compacte */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2 d-flex align-items-center">
                        <i className="bi bi-grid-3x3-gap me-2"></i>
                        Catégories
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat.value}
                            type="button"
                            className={`btn btn-sm ${filters.category === cat.value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleFilterChange('category', filters.category === cat.value ? '' : cat.value)}
                          >
                            <i className={`bi bi-${cat.icon} me-1`}></i>
                            {cat.label}
                            <span className="badge bg-light text-dark ms-1">{cat.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtres spécifiques selon la catégorie - Version compacte */}
                    {filters.category && (
                      <div className="mb-3 p-2 bg-light rounded">
                        {filters.category === 'restaurant' && (
                          <div>
                            <small className="fw-bold text-muted mb-2 d-block">Type de Cuisine</small>
                            <div className="d-flex flex-wrap gap-1">
                              {cuisines.slice(0, 4).map(cuisine => (
                                <button
                                  key={cuisine.value}
                                  type="button"
                                  className={`btn btn-xs ${filters.cuisine === cuisine.value ? 'btn-warning' : 'btn-outline-warning'}`}
                                  onClick={() => handleFilterChange('cuisine', filters.cuisine === cuisine.value ? '' : cuisine.value)}
                                  style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                                >
                                  {cuisine.label.replace('Cuisine ', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {filters.category === 'hotel' && (
                          <div>
                            <small className="fw-bold text-muted mb-2 d-block">Style d'Hôtel</small>
                            <div className="d-flex flex-wrap gap-1">
                              {hotelStyles.slice(0, 4).map(style => (
                                <button
                                  key={style.value}
                                  type="button"
                                  className={`btn btn-xs ${filters.hotel_style === style.value ? 'btn-info' : 'btn-outline-info'}`}
                                  onClick={() => handleFilterChange('hotel_style', filters.hotel_style === style.value ? '' : style.value)}
                                  style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                                >
                                  {style.label.replace('Hôtels ', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {filters.category === 'attraction' && (
                          <div>
                            <small className="fw-bold text-muted mb-2 d-block">Type d'Attraction</small>
                            <div className="d-flex flex-wrap gap-1">
                              {attractionTypes.slice(0, 4).map(type => (
                                <button
                                  key={type.value}
                                  type="button"
                                  className={`btn btn-xs ${filters.attraction_type === type.value ? 'btn-success' : 'btn-outline-success'}`}
                                  onClick={() => handleFilterChange('attraction_type', filters.attraction_type === type.value ? '' : type.value)}
                                  style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}
                                >
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Filtres principaux en ligne compacte */}
                    <div className="row g-2">
                      {/* Localisation */}
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          <i className="bi bi-geo-alt me-1"></i>Pays
                        </label>
                        <select
                          value={filters.country}
                          onChange={(e) => handleFilterChange('country', e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="">Tous les pays</option>
                          {countries.slice(0, 8).map(country => (
                            <option key={country.value} value={country.value}>
                              {country.label} ({country.count})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          <i className="bi bi-building me-1"></i>Ville
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: London, Tokyo..."
                          value={filters.city}
                          onChange={(e) => handleFilterChange('city', e.target.value)}
                          className="form-control form-control-sm"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">
                          <i className="bi bi-star-fill me-1 text-warning"></i>Note min.
                        </label>
                        <select
                          value={filters.min_rating}
                          onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="">Toutes</option>
                          <option value="4.5">4.5+ ⭐</option>
                          <option value="4">4+ ⭐</option>
                          <option value="3.5">3.5+ ⭐</option>
                          <option value="3">3+ ⭐</option>
                        </select>
                      </div>
                    </div>

                    {/* Ligne filtres prix et tri */}
                    <div className="row g-2 mt-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          <i className="bi bi-currency-dollar me-1 text-success"></i>Prix
                        </label>
                        <div className="btn-group w-100" role="group">
                          {[
                            {value: '', label: 'Tous'},
                            {value: '$', label: '$'},
                            {value: '$$', label: '$$'},
                            {value: '$$$', label: '$$$'},
                            {value: '$$$$', label: '$$$$'}
                          ].map(price => (
                            <button
                              key={price.value}
                              type="button"
                              className={`btn btn-sm ${filters.price_level === price.value ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => handleFilterChange('price_level', price.value)}
                            >
                              {price.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          <i className="bi bi-sort-down me-1"></i>Trier par
                        </label>
                        <select
                          value={filters.ordering}
                          onChange={(e) => handleFilterChange('ordering', e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="-num_likes">🔥 Popularité</option>
                          <option value="-rating">⭐ Meilleure note</option>
                          <option value="rating">📈 Note croissante</option>
                          <option value="name">🔤 A-Z</option>
                          <option value="-name">🔤 Z-A</option>
                        </select>
                      </div>
                    </div>

                    {/* Bouton reset compact */}
                    <div className="text-end mt-3">
                      <button 
                        type="button" 
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setFilters({
                            category: '',
                            city: '',
                            country: '',
                            min_rating: '',
                            price_level: '',
                            ordering: '-num_likes'
                          });
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="row">
            <div className="col-12">
              {/* Informations sur les résultats */}
              {hasSearched && (
                <div className="mb-3">
                  <div className="text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    {totalResults} attraction(s) trouvée(s)
                  </div>
                </div>
              )}

              {/* Gestion des erreurs */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <AlertCircle size={20} className="me-2" />
                  <span>{error}</span>
                </div>
              )}

              {/* Liste des attractions */}
              <div className="row g-4">
                {attractions.map((attraction) => (
                  <div key={attraction.id || attraction.tripadvisor_id} className="col-12 col-md-6 col-lg-4">
                    <AttractionCard
                      attraction={attraction}
                      onClick={handleAttractionClick}
                    />
                  </div>
                ))}
              </div>

              {/* Indicateur de chargement */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <div className="mt-3 text-muted">Chargement des attractions...</div>
                </div>
              )}

              {/* Bouton charger plus */}
              {!loading && attractions.length > 0 && attractions.length < totalResults && (
                <div className="text-center mt-4">
                  <button onClick={loadMore} className="btn btn-outline-primary btn-lg px-5">
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Charger plus d'attractions
                  </button>
                </div>
              )}

              {/* Message si aucun résultat */}
              {hasSearched && !loading && attractions.length === 0 && !error && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-search display-1 text-muted"></i>
                  </div>
                  <h3 className="text-muted">Aucune attraction trouvée</h3>
                  <p className="text-muted">Essayez de modifier vos critères de recherche.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;