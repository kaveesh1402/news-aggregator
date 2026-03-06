import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="news-panel news-panel-soft news-panel-luxe rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-2 mt-8 news-entrance">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:mr-2">
        Page {currentPage + 1} of {totalPages}
      </p>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="btn-ghost p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className={`px-3 py-2 rounded-xl transition text-sm font-bold ${
                pageNum === currentPage
                  ? 'bg-slate-900 text-white shadow'
                  : 'btn-ghost disabled:opacity-50 disabled:cursor-not-allowed'
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
        className="btn-ghost p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
