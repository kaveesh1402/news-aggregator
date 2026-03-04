import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('keyword')}
            className={`px-4 py-2 rounded transition ${
              searchType === 'keyword'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Keyword Search
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('semantic')}
            className={`px-4 py-2 rounded transition ${
              searchType === 'semantic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            AI Search
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === 'keyword'
                  ? 'Search by keywords...'
                  : 'Search with AI (natural language)...'
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
