import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Badge } from 'react-bootstrap';
import { Trash2, DollarSign, Navigation } from 'lucide-react';
import { compilationAPI } from '../services/api';
import AttractionCard from '../components/AttractionCard';

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
          <Form.Group>
            <Form.Label>Trier par</Form.Label>
            <Form.Select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
              <option value="">Par défaut</option>
              <option value="budget_asc">Budget (croissant)</option>
              <option value="budget_desc">Budget (décroissant)</option>
              <option value="distance">Distance (itinéraire optimisé)</option>
            </Form.Select>
          </Form.Group>
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
              <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                {(data.attractions || []).map((attraction) => (
                  <Col key={attraction.id}>
                    <div className="position-relative">
                      <AttractionCard attraction={attraction} />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        onClick={() => handleRemove(attraction.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {data.pagination?.total_pages > 1 && (
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="align-self-center">
                    Page {currentPage} sur {data.pagination.total_pages}
                  </span>
                  <Button
                    variant="outline-primary"
                    disabled={currentPage >= data.pagination.total_pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}