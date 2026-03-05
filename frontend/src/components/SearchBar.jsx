import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function SearchBar({ onSearch, onSearchTypeChange }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('keyword');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    onSearchTypeChange(type);
  };

  return (
    <div className="news-panel rounded-xl p-6 mb-8 news-entrance">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="news-kicker text-[var(--news-accent)]">Discovery</p>
          <h2 className="text-xl font-black text-slate-900">Search The Wire</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('keyword')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              searchType === 'keyword'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Keyword Search
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('semantic')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition inline-flex items-center gap-2 ${
              searchType === 'semantic'
                ? 'bg-[var(--news-accent)] text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Sparkles size={14} />
            AI Search
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === 'keyword'
                  ? 'Search by keywords...'
                  : 'Search with AI (natural language)...'
              }
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-[var(--news-accent)] bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--news-accent)] text-white px-6 py-2.5 rounded-md hover:bg-[var(--news-accent-dark)] transition font-bold"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
