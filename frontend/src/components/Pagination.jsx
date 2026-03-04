import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum = i;
          if (totalPages > 5 && currentPage > 2) {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={pageNum >= totalPages}
              className={`px-3 py-2 rounded transition ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {pageNum + 1}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
