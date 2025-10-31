import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Form, Button, Spinner } from 'react-bootstrap';
import AttractionsCarousel from '../components/AttractionsCarousel';
import AttractionCard from '../components/AttractionCard';
import Pagination from '../components/Pagination';
import { attractionsAPI, authAPI } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [popularAttractions, setPopularAttractions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le profil utilisateur
      const profileData = await authAPI.getProfile();
      setProfile(profileData);

      // Charger les attractions populaires selon le pays sélectionné
      const attractionsData = await attractionsAPI.getPopularAttractions({
        country: profileData.selected_country,
        page: 1,
        limit: 15,
      });

      setPopularAttractions(attractionsData.results || []);
      setTotalPages(attractionsData.total_pages || 1);
      setTotalCount(attractionsData.count || 0);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttractionClick = (attraction) => {
    navigate(`/attraction/${attraction.id || attraction.tripadvisor_id}`);
  };

  const loadAttractions = async (query = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = query 
        ? await attractionsAPI.searchAttractions({ q: query, page, limit: 15 })
        : await attractionsAPI.getPopularAttractions({ 
            country: profile?.selected_country, 
            page,
            limit: 15
          });
      
      setPopularAttractions(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError(err.message);
      setPopularAttractions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAttractions(searchQuery, 1);
  };

  const handlePageChange = (page) => {
    loadAttractions(searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !profile) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* En-tête avec profil */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="display-4 mb-2">
              🌍 Bienvenue, {profile?.username || 'voyageur'} !
            </h1>
            <p className="lead text-muted mb-0">
              Découvrez les meilleures attractions en {profile?.selected_country}
            </p>
          </div>
          {profile?.badge_info && (
            <div className="text-md-end">
              <span className={`badge bg-${profile.badge_info.color} p-3`} style={{ fontSize: '1rem' }}>
                {profile.badge_info.icon} {profile.badge_info.label}
              </span>
              <div className="mt-2">
                <small className="text-muted">{profile.badge_info.description}</small>
                {profile.compilation_limit && (
                  <div className="mt-1">
                    <small className="text-muted">
                      📋 Limite compilation: <strong>{profile.compilation_limit}</strong> attractions
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Barre de recherche */}
      <Form onSubmit={handleSearch} className="mb-4">
        <Row>
          <Col md={9}>
            <Form.Control
              type="text"
              placeholder="Rechercher un pays, une ville, une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
            />
          </Col>
          <Col md={3}>
            <Button type="submit" variant="primary" size="lg" className="w-100">
              🔍 Rechercher
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Carrousel des attractions populaires */}
      {!searchQuery && popularAttractions.length > 0 && (
        <>
          <h2 className="mb-3">🌟 Attractions les plus populaires</h2>
          <AttractionsCarousel 
            attractions={popularAttractions.slice(0, 5)} 
            onAttractionClick={handleAttractionClick}
          />
        </>
      )}

      {/* Liste des résultats */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des attractions...</p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
            <h3>
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Toutes les attractions'} 
              {' '}({totalCount})
            </h3>
            <small className="text-muted">
              Page {currentPage} sur {totalPages}
            </small>
          </div>
          
          {popularAttractions.length === 0 ? (
            <Alert variant="info">
              Aucune attraction trouvée. 
              {!searchQuery && ' Essayez de rechercher "Paris", "Rome", "London"...'}
            </Alert>
          ) : (
            <>
              <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-3 g-md-4">
                {popularAttractions.map((attraction) => (
                  <Col key={attraction.id} onClick={() => handleAttractionClick(attraction)}>
                    <AttractionCard attraction={attraction} />
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}