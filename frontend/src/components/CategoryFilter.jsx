import React from 'react';
import { Filter } from 'lucide-react';

const CATEGORIES = [
  'LLM',
  'AI Startups',
  'Robotics',
  'AI Research',
  'AI Policy',
  'AI Tools',
];

const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];

export default function CategoryFilter({ onCategoryChange, onSentimentChange, selectedCategory, selectedSentiment }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
      <h2 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-900">
        <Filter size={20} />
        Filters
      </h2>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2 rounded transition ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sentiment</h3>
        <div className="space-y-2">
          <button
            onClick={() => onSentimentChange(null)}
            className={`w-full text-left px-3 py-2 rounded transition ${
              !selectedSentiment
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Sentiments
          </button>
          {SENTIMENTS.map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => onSentimentChange(sentiment)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                selectedSentiment === sentiment
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sentiment}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
