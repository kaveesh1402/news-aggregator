import React, { useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="news-panel news-panel-soft news-panel-luxe rounded-xl p-6 sm:p-7 mb-8 news-entrance hover-lift">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="news-kicker text-[var(--news-accent)]">Discovery</p>
          <h2 className="news-section-title text-slate-900">Search The Wire</h2>
        </div>
        <div className="surface-chip inline-flex items-center gap-1.5">
          <CornerDownLeft size={12} />
          Press Enter
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[var(--news-accent)] bg-white text-[0.98rem]"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-6 py-3"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
