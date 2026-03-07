import React from 'react';
import { Filter, Layers, Smile, Frown, Minus } from 'lucide-react';

const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];

export default function CategoryFilter({
  categories = [],
  onCategoryChange,
  onSentimentChange,
  selectedCategory,
  selectedSentiment,
}) {
  const sentimentIcon = (sentiment) => {
    if (sentiment === 'POSITIVE') return <Smile size={14} />;
    if (sentiment === 'NEGATIVE') return <Frown size={14} />;
    return <Minus size={14} />;
  };

  return (
    <div className="news-panel news-panel-soft news-panel-luxe rounded-xl p-6 h-fit sticky top-4 news-entrance hover-lift">
      <h2 className="flex items-center gap-2 text-xl font-black mb-4 text-slate-900">
        <Filter size={20} />
        Filters
      </h2>

      <div className="mb-6">
        <h3 className="text-xs font-black text-slate-500 mb-3 tracking-wider uppercase flex items-center gap-2">
          <Layers size={13} />
          Topic
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm font-semibold ${
              !selectedCategory
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:translate-x-0.5'
            }`}
          >
            All Topics
          </button>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm font-semibold ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:translate-x-0.5'
              }`}
            >
              <span>{category}</span>
              <span className="category-count-chip ml-2 text-xs rounded-full px-2 py-0.5 border">({count})</span>
            </button>
          ))}
          {categories.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500 bg-slate-50 rounded-md">
              Topics will appear after the first news fetch.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-slate-500 mb-3 tracking-wider uppercase">Sentiment</h3>
        <div className="space-y-2">
          <button
            onClick={() => onSentimentChange(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm font-semibold ${
              !selectedSentiment
                ? 'bg-[var(--news-accent)] text-white shadow'
                : 'bg-[var(--news-accent-soft)] text-[#852f1b] hover:bg-[#ffe3d8] hover:translate-x-0.5'
            }`}
          >
            All Sentiments
          </button>
          {SENTIMENTS.map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => onSentimentChange(sentiment)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm font-semibold inline-flex items-center gap-2 ${
                selectedSentiment === sentiment
                  ? 'bg-[var(--news-accent)] text-white shadow'
                  : 'bg-[var(--news-accent-soft)] text-[#852f1b] hover:bg-[#ffe3d8] hover:translate-x-0.5'
              }`}
            >
              {sentimentIcon(sentiment)}
              {sentiment}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
