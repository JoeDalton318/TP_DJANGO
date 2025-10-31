import React, { useState } from 'react';
import { Info, DollarSign, Calculator, TrendingUp } from 'lucide-react';

const BudgetExplanation = ({ onClose, userBudget, estimatedBudget, attractions = [] }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Mapping des prix comme dans le backend Django
  const priceMapping = {
    '$': { amount: 25, label: 'Budget (Économique)' },
    '$$': { amount: 75, label: 'Modéré' },
    '$$$': { amount: 150, label: 'Cher' },
    '$$$$': { amount: 300, label: 'Très cher' }
  };

  const getBudgetStatus = () => {
    if (!userBudget || !estimatedBudget) return 'unknown';
    
    if (estimatedBudget <= userBudget * 0.7) return 'under_budget';
    if (estimatedBudget <= userBudget) return 'on_budget';
    return 'over_budget';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_budget': return 'text-success';
      case 'on_budget': return 'text-warning';
      case 'over_budget': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'under_budget': return 'Sous le budget';
      case 'on_budget': return 'Dans le budget';
      case 'over_budget': return 'Dépasse le budget';
      default: return 'Budget non défini';
    }
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Calculator className="me-2" size={20} />
              Comment est calculé votre budget ?
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Vue d'ensemble */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  <TrendingUp className="me-2" size={18} />
                  Résumé de votre compilation
                </h6>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <strong>Budget estimé :</strong>
                      <span className="text-primary">{estimatedBudget || 0}€</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <strong>Votre budget max :</strong>
                      <span className="text-info">{userBudget || 'Non défini'}€</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="d-flex justify-content-between">
                    <strong>Statut :</strong>
                    <span className={getStatusColor(budgetStatus)}>
                      {getStatusText(budgetStatus)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Méthode de calcul */}
            <div className="alert alert-info">
              <Info className="me-2" size={18} />
              <strong>Méthode de calcul :</strong>
              <p className="mb-0 mt-2">
                Le budget est estimé selon le niveau de prix de chaque attraction sur TripAdvisor.
                Chaque niveau correspond à un coût moyen par personne :
              </p>
            </div>

            {/* Barème des prix */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  <DollarSign className="me-2" size={18} />
                  Barème des prix (par personne)
                </h6>
                
                <div className="row">
                  {Object.entries(priceMapping).map(([symbol, info]) => (
                    <div key={symbol} className="col-md-6 mb-2">
                      <div className="d-flex justify-content-between border rounded p-2">
                        <span>
                          <strong>{symbol}</strong> - {info.label}
                        </span>
                        <span className="text-primary">{info.amount}€</span>
                      </div>
                    </div>
                  ))}
                </div>

                <small className="text-muted">
                  * Pour les attractions sans niveau de prix, nous estimons 50€ par défaut
                </small>
              </div>
            </div>

            {/* Détail par attraction */}
            {attractions && attractions.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="card-title mb-0">Détail par attraction</h6>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Masquer' : 'Afficher'} les détails
                    </button>
                  </div>
                  
                  {showDetails && (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Attraction</th>
                            <th>Niveau de prix</th>
                            <th>Coût estimé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attractions.map((attraction, index) => {
                            const priceLevel = attraction.price_level || '';
                            const cost = priceLevel && priceMapping[priceLevel] 
                              ? priceMapping[priceLevel].amount 
                              : 50;
                            
                            return (
                              <tr key={index}>
                                <td>
                                  <small>{attraction.name || `Attraction ${index + 1}`}</small>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {priceLevel || 'Non défini'}
                                  </span>
                                </td>
                                <td>
                                  <strong>{cost}€</strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes importantes */}
            <div className="mt-4">
              <h6>Notes importantes :</h6>
              <ul className="small text-muted">
                <li>Les prix sont des estimations basées sur les données TripAdvisor</li>
                <li>Les coûts réels peuvent varier selon la saison, les promotions, etc.</li>
                <li>Certaines attractions peuvent être gratuites malgré leur niveau de prix</li>
                <li>N'hésitez pas à vérifier les prix officiels avant votre voyage</li>
              </ul>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetExplanation;