import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompilation } from '../contexts/CompilationContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { 
  Heart, Trash2, ArrowUpDown, MapPin, Star, Euro, 
  Navigation, Share2, Download, Calculator, Map, Info
} from 'lucide-react';
import BudgetExplanation from '../components/BudgetExplanation';

const CompilationPage = () => {
  const navigate = useNavigate();
  const { profile, selectedCountry } = useUserProfile();
  const { 
    compiledAttractions, 
    removeAttraction, 
    clearCompilation, 
    getTotalBudget,
    sortByBudget 
  } = useCompilation();
  
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showBudgetExplanation, setShowBudgetExplanation] = useState(false);

  const handleSort = (criteria) => {
    if (criteria === 'budget') {
      const ascending = sortBy === 'budget' ? sortOrder === 'desc' : false;
      sortByBudget(ascending);
      setSortBy('budget');
      setSortOrder(ascending ? 'asc' : 'desc');
    } else {
      // Tri local pour les autres critères
      setSortBy(criteria);
      setSortOrder(sortBy === criteria && sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  const getSortedAttractions = () => {
    if (sortBy === 'budget') {
      return compiledAttractions; // Déjà trié par le context
    }
    
    const sorted = [...compiledAttractions].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'addedAt':
          aValue = new Date(a.addedAt || 0);
          bValue = new Date(b.addedAt || 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };

  const getPriceLevel = (attraction) => {
    const level = attraction.price_level?.length || 1;
    return '€'.repeat(level);
  };

  const getEstimatedCost = (attraction) => {
    const priceLevel = attraction.price_level?.length || 1;
    switch (priceLevel) {
      case 1: return 20;
      case 2: return 50;
      case 3: return 100;
      case 4: return 200;
      default: return 30;
    }
  };

  if (compiledAttractions.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <div className="container py-5">
          <div className="text-center">
            <div className="mb-4">
              <Heart size={80} className="text-muted" />
            </div>
            <h2>Votre liste est vide</h2>
            <p className="text-muted mb-4">
              Ajoutez des attractions à votre liste pour créer votre itinéraire personnalisé
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/search')}
              >
                Rechercher des attractions
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/home')}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h3 mb-1">Ma Compilation</h1>
              <p className="text-muted mb-0">
                {compiledAttractions.length} attraction{compiledAttractions.length > 1 ? 's' : ''} • {selectedCountry?.name}
              </p>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary">
                  <Map size={16} className="me-1" />
                  Voir sur carte
                </button>
                <button className="btn btn-outline-secondary">
                  <Share2 size={16} className="me-1" />
                  Partager
                </button>
                <button className="btn btn-outline-secondary">
                  <Download size={16} className="me-1" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row">
          {/* Sidebar avec résumé */}
          <div className="col-lg-4 order-lg-2">
            <div className="sticky-top" style={{ top: '1rem' }}>
              {/* Résumé budget */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center">
                    <Calculator size={20} className="me-2 text-primary" />
                    Budget estimé
                  </h5>
                  <div className="text-center">
                    <div className="display-6 text-primary fw-bold">
                      {getTotalBudget()}€
                    </div>
                    <small className="text-muted">
                      Coût approximatif pour {compiledAttractions.length} attraction{compiledAttractions.length > 1 ? 's' : ''}
                    </small>
                  </div>
                  <hr />
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSort('budget')}
                    >
                      <Euro size={16} className="me-1" />
                      Optimiser le budget
                    </button>
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => setShowBudgetExplanation(true)}
                    >
                      <Info size={16} className="me-1" />
                      Comment est calculé ce budget ?
                    </button>
                    <button className="btn btn-outline-success">
                      <Navigation size={16} className="me-1" />
                      Optimiser l'itinéraire
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Actions rapides</h6>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => navigate('/search')}
                    >
                      Ajouter plus d'attractions
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        if (window.confirm('Voulez-vous vraiment vider votre liste ?')) {
                          clearCompilation();
                        }
                      }}
                    >
                      <Trash2 size={14} className="me-1" />
                      Vider la liste
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des attractions */}
          <div className="col-lg-8 order-lg-1">
            {/* Contrôles de tri */}
            <div className="card mb-4">
              <div className="card-body py-3">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <span className="fw-medium">Trier par :</span>
                  <div className="btn-group" role="group">
                    <button
                      className={`btn btn-sm ${sortBy === 'addedAt' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSort('addedAt')}
                    >
                      Date d'ajout
                    </button>
                    <button
                      className={`btn btn-sm ${sortBy === 'name' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSort('name')}
                    >
                      Nom
                    </button>
                    <button
                      className={`btn btn-sm ${sortBy === 'rating' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSort('rating')}
                    >
                      Note
                    </button>
                    <button
                      className={`btn btn-sm ${sortBy === 'budget' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSort('budget')}
                    >
                      Budget
                    </button>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleSort(sortBy)}
                  >
                    <ArrowUpDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des attractions */}
            <div className="row g-4">
              {getSortedAttractions().map((attraction, index) => (
                <div key={attraction.id} className="col-12">
                  <div className="card">
                    <div className="row g-0">
                      <div className="col-md-4">
                        <img
                          src={attraction.main_image || 'https://via.placeholder.com/300x200?text=Attraction'}
                          className="img-fluid rounded-start h-100"
                          alt={attraction.name}
                          style={{ objectFit: 'cover', minHeight: '200px' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=Attraction';
                          }}
                        />
                      </div>
                      <div className="col-md-8">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="card-title mb-1">{attraction.name}</h5>
                              <div className="d-flex align-items-center text-muted mb-2">
                                <MapPin size={14} className="me-1" />
                                <small>{attraction.city}, {attraction.country}</small>
                              </div>
                            </div>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeAttraction(attraction.id)}
                              title="Retirer de la liste"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Rating */}
                          {attraction.rating && (
                            <div className="d-flex align-items-center mb-2">
                              <Star size={14} className="text-warning me-1" fill="currentColor" />
                              <span className="fw-medium me-2">{attraction.rating}</span>
                              <small className="text-muted">
                                ({attraction.num_reviews?.toLocaleString()} avis)
                              </small>
                            </div>
                          )}

                          {/* Description courte */}
                          <p className="card-text text-muted small mb-3">
                            {attraction.description ? 
                              attraction.description.substring(0, 150) + '...' : 
                              attraction.subcategory || 'Découvrez cette attraction'
                            }
                          </p>

                          {/* Footer de la carte */}
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                              <span className="badge bg-secondary">
                                {attraction.subcategory || attraction.category}
                              </span>
                              <span className="badge bg-success">
                                {getPriceLevel(attraction)} ({getEstimatedCost(attraction)}€)
                              </span>
                            </div>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate(`/attraction/${attraction.id}`)}
                              >
                                Voir détails
                              </button>
                            </div>
                          </div>

                          {/* Ordre dans la liste */}
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-primary rounded-pill">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message de fin */}
            <div className="text-center mt-5 py-4">
              <div className="text-muted">
                <Heart size={24} className="mb-2" />
                <p>Vous avez {compiledAttractions.length} attraction{compiledAttractions.length > 1 ? 's' : ''} dans votre liste</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/search')}
                >
                  Ajouter plus d'attractions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal d'explication du budget */}
      {showBudgetExplanation && (
        <BudgetExplanation 
          onClose={() => setShowBudgetExplanation(false)}
          userBudget={profile?.budget_max}
          estimatedBudget={getTotalBudget()}
          attractions={compiledAttractions}
        />
      )}
    </div>
  );
};

export default CompilationPage;