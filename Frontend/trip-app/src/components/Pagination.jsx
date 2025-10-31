import { Pagination as BsPagination } from 'react-bootstrap';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <BsPagination>
        <BsPagination.First 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
        />
        <BsPagination.Prev 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        
        {startPage > 1 && (
          <>
            <BsPagination.Item onClick={() => onPageChange(1)}>1</BsPagination.Item>
            {startPage > 2 && <BsPagination.Ellipsis disabled />}
          </>
        )}
        
        {pages.map(page => (
          <BsPagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </BsPagination.Item>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <BsPagination.Ellipsis disabled />}
            <BsPagination.Item onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </BsPagination.Item>
          </>
        )}
        
        <BsPagination.Next 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        />
        <BsPagination.Last 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages}
        />
      </BsPagination>
    </div>
  );
}