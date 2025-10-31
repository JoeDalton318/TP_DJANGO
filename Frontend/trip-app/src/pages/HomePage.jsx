import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, Button } from 'react-bootstrap';
import AttractionCard from '../components/AttractionCard';
import Pagination from '../components/Pagination';
import { attractionsAPI } from '../services/api';

export default function HomePage() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadAttractions = async (query = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = query 
        ? await attractionsAPI.searchAttractions({ q: query, page })
        : await attractionsAPI.getPopularAttractions({ page });
      
      setAttractions(data.results ?? []);
      setTotalPages(data.total_pages ?? 1);
      setTotalCount(data.count ?? 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError(err.message);
      setAttractions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttractions('', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAttractions(searchQuery, 1);
  };

  const handlePageChange = (page) => {
    loadAttractions(searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 mb-3">🌍 Découvrez les attractions</h1>
          
          <Form onSubmit={handleSearch} className="mb-4">
            <Row>
              <Col md={9}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un pays, une ville, une catégorie... (vide = toutes)"
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
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des attractions...</p>
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 mb-0">
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Attractions populaires'} 
              {' '}({totalCount})
            </h2>
            <small className="text-muted">
              Page {currentPage} sur {totalPages}
            </small>
          </div>
          
          {attractions.length === 0 ? (
            <Alert variant="info">
              <p className="mb-0">
                Aucune attraction trouvée. 
                {!searchQuery && ' Essayez de chercher "Paris", "Rome", "London"...'}
              </p>
            </Alert>
          ) : (
            <>
              <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                {attractions.map((attraction) => (
                  <Col key={attraction.id}>
                    <AttractionCard attraction={attraction} />
                  </Col>
                ))}
              </Row>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}