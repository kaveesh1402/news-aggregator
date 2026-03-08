import React, { useEffect, useMemo, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const suggestions = useMemo(
    () => ['AI policy', 'startups', 'robotics', 'Nvidia', 'OpenAI'],
    [],
  );
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || query.trim()) {
      return;
    }
    const timer = window.setInterval(() => {
      setSuggestionIndex((index) => (index + 1) % suggestions.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isFocused, query, suggestions.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
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
          <div className="flex-1 relative search-shell">
            <Search className="absolute left-3 top-3.5 text-slate-400 search-icon" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Search ${suggestions[suggestionIndex]}...`}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-[var(--news-accent)] bg-white text-[0.98rem] search-input"
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
