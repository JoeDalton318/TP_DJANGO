import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import AttractionCard from '../components/AttractionCard';
import SortButtons from '../components/SortButtons';
import Pagination from '../components/Pagination';
import CompilationMap from '../shared/CompilationMap';
import api from '../services/api';

export default function CompilationPage() {
  const [data, setData] = useState({ 
    attractions: [], 
    budget_total: 0, 
    total_distance: 0,
    pagination: { count: 0, total_pages: 1, current_page: 1 }
  });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (sortOption = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getCompilation(sortOption, page);
      setData(result);
      setCurrentPage(result.pagination?.current_page || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(sort, currentPage);
  }, [sort, currentPage, load]);

  const handleRemove = async (id) => {
    if (!confirm('Supprimer cette attraction de votre compilation ?')) return;
    try {
      await api.removeAttraction(id);
      await load(sort, currentPage);
    } catch (err) {
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 mb-3">📋 Ma Compilation</h1>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <SortButtons currentSort={sort} onSortChange={handleSortChange} />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card bg="light">
            <Card.Body>
              <Card.Title>💰 Budget Total</Card.Title>
              <h3 className="mb-0">{data.budget_total ?? 0} €</h3>
            </Card.Body>
          </Card>
        </Col>
        {sort === 'distance' && (
          <Col md={6}>
            <Card bg="light">
              <Card.Body>
                <Card.Title>🚶 Distance Totale</Card.Title>
                <h3 className="mb-0">{data.total_distance ?? 0} km</h3>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {data.pagination?.count === 0 ? (
            <Alert variant="info">
              Votre compilation est vide. Ajoutez des attractions depuis la page d'accueil !
            </Alert>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">
                  Mes attractions ({data.pagination?.count ?? 0})
                </h2>
                <small className="text-muted">
                  Page {data.pagination?.current_page ?? 1} sur {data.pagination?.total_pages ?? 1}
                </small>
              </div>

              <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                {(data.attractions ?? []).map((attraction) => (
                  <Col key={attraction.id}>
                    <AttractionCard 
                      attraction={attraction} 
                      onRemove={handleRemove}
                      showRemoveButton={true}
                    />
                  </Col>
                ))}
              </Row>

              <Pagination
                currentPage={data.pagination?.current_page ?? 1}
                totalPages={data.pagination?.total_pages ?? 1}
                onPageChange={handlePageChange}
              />

              <h2 className="h4 mb-3 mt-5">🗺️ Carte de votre itinéraire</h2>
              <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                <CompilationMap attractions={data.attractions ?? []} />
              </div>
            </>
          )}
        </>
      )}
    </Container>
  );
}