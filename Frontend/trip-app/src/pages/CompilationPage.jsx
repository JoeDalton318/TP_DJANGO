import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Badge, Nav } from 'react-bootstrap';
import { Trash2, DollarSign, Navigation, Map } from 'lucide-react';
import { compilationAPI } from '../services/api';
import AttractionCard from '../components/AttractionCard';
import CompilationMap from '../components/CompilationMap';
import Pagination from '../components/Pagination';

export default function CompilationPage() {
  const [data, setData] = useState({ 
    attractions: [], 
    budget_total: 0, 
    total_distance: 0,
    pagination: { count: 0, total_pages: 1, current_page: 1 }
  });
  const [ordering, setOrdering] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'

  const load = useCallback(async (orderOption = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await compilationAPI.getCompilation({ ordering: orderOption, page });
      setData(result);
      setCurrentPage(result.pagination?.current_page || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(ordering, currentPage);
  }, [ordering, currentPage, load]);

  const handleRemove = async (id) => {
    if (!window.confirm('Supprimer cette attraction de votre compilation ?')) return;
    
    try {
      await compilationAPI.removeAttraction(id);
      load(ordering, currentPage);
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
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
      <h1 className="mb-4">📋 Ma Compilation</h1>

      {error && (
        <Alert variant="danger">
          <p>{error}</p>
        </Alert>
      )}

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5>Attractions</h5>
              <h2>{data.pagination?.count || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5><DollarSign size={20} /> Budget Total</h5>
              <h2>{data.budget_total || 0} €</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h5><Navigation size={20} /> Distance Totale</h5>
              <h2>{data.total_distance || 0} km</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtres de tri */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Trier par</Form.Label>
                <Form.Select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                  <option value="">Par défaut</option>
                  <option value="budget_asc">Budget (croissant)</option>
                  <option value="budget_desc">Budget (décroissant)</option>
                  <option value="distance">Distance (itinéraire optimisé)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label>Mode d'affichage</Form.Label>
              <Nav variant="pills" className="d-flex">
                <Nav.Item className="flex-fill">
                  <Nav.Link 
                    active={viewMode === 'list'} 
                    onClick={() => setViewMode('list')}
                    className="text-center"
                  >
                    📋 Liste
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill">
                  <Nav.Link 
                    active={viewMode === 'map'} 
                    onClick={() => setViewMode('map')}
                    className="text-center"
                  >
                    <Map size={16} className="me-1" />
                    Carte
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {!loading && !error && (
        <>
          {data.pagination?.count === 0 ? (
            <Alert variant="info">
              Votre compilation est vide. Ajoutez des attractions depuis la page de recherche !
            </Alert>
          ) : (
            <>
              {viewMode === 'list' ? (
                <>
                  <Row xs={1} sm={2} md={2} lg={3} className="g-3 g-md-4 mb-4">
                    {(data.attractions || []).map((attraction) => (
                      <Col key={attraction.id}>
                        <div className="position-relative h-100">
                          <AttractionCard attraction={attraction} />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={() => handleRemove(attraction.id)}
                            style={{ zIndex: 10 }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              ) : (
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">🗺️ Carte de votre itinéraire</h5>
                  </Card.Header>
                  <Card.Body>
                    <CompilationMap attractions={data.attractions || []} />
                  </Card.Body>
                </Card>
              )}

              {/* Pagination */}
              {data.pagination?.total_pages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.pagination.total_pages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}