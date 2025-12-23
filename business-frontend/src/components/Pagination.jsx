import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showInfo = true,
  className = '',
  align = 'center', // 'left', 'center', 'right'
}) => {
  // Don't render if only one page or no pages
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Alignment classes
  const alignClasses = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end',
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis before range if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }

      // Add page numbers in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after range if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col ${alignClasses[align]} gap-4 ${className}`}>
      {/* Info Text */}
      {showInfo && (
        <p className={`text-sm text-gray-600 ${align === 'right' ? 'text-right' : align === 'left' ? 'text-left' : 'text-center'}`}>
          Showing <span className="font-semibold text-secondary">{startIndex + 1}</span> to{' '}
          <span className="font-semibold text-secondary">{endIndex}</span> of{' '}
          <span className="font-semibold text-secondary">{totalItems}</span> results
        </p>
      )}

      {/* Pagination Controls */}
      <div className={`flex ${align === 'right' ? 'justify-end' : align === 'left' ? 'justify-start' : 'justify-center'} items-center gap-2`}>
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1 ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm'
          }`}
          aria-label="Previous page"
        >
          <FiChevronLeft size={18} />
          <span>Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[40px] px-4 py-2 rounded-lg font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary shadow-sm'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1 ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-sm'
          }`}
          aria-label="Next page"
        >
          <span>Next</span>
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

