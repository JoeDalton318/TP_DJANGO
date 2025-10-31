import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalCount, 
  limit,
  onPageChange, 
  loading = false 
}) => {
  // Calculer les pages à afficher
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5; // Nombre maximum de pages à afficher
    
    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si il y en a peu
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipses
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  // Calculer les indices pour affichage "X-Y de Z résultats"
  const startIndex = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = Math.min(currentPage * limit, totalCount);

  // Toujours afficher les informations sur les résultats
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 border-top pt-3">
      {/* Informations sur les résultats */}
      <div className="mb-2 mb-md-0">
        <small className="text-muted">
          {totalCount > 0 ? (
            <>Affichage de <strong>{startIndex.toLocaleString()}</strong> à <strong>{endIndex.toLocaleString()}</strong> sur <strong>{totalCount.toLocaleString()}</strong> résultats</>
          ) : (
            <>Aucun résultat trouvé</>
          )}
        </small>
      </div>

      {/* Contrôles de pagination - Afficher seulement s'il y a plus d'une page */}
      {totalPages > 1 && (
        <nav aria-label="Navigation des pages">
          <ul className="pagination mb-0">
            {/* Première page */}
            <li className={`page-item ${currentPage === 1 || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || loading}
                title="Première page"
              >
                <ChevronsLeft size={16} />
              </button>
            </li>

            {/* Page précédente */}
            <li className={`page-item ${currentPage === 1 || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                title="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>
            </li>

            {/* Pages numérotées */}
            {visiblePages.map((page, index) => (
              <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' || loading ? 'disabled' : ''}`}>
                {page === '...' ? (
                  <span className="page-link">...</span>
                ) : (
                  <button
                    className="page-link"
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* Page suivante */}
            <li className={`page-item ${currentPage === totalPages || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                title="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </li>

            {/* Dernière page */}
            <li className={`page-item ${currentPage === totalPages || loading ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
                title="Dernière page"
              >
                <ChevronsRight size={16} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Pagination;