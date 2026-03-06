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
    <div className="news-panel rounded-xl p-6 h-fit sticky top-4 news-entrance">
      <h2 className="flex items-center gap-2 text-lg font-black mb-4 text-slate-900">
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
            className={`w-full text-left px-3 py-2 rounded-md transition text-sm font-semibold ${
              !selectedCategory
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Topics
          </button>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm font-semibold ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
              <span className="ml-2 text-xs opacity-80">({count})</span>
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
            className={`w-full text-left px-3 py-2 rounded-md transition text-sm font-semibold ${
              !selectedSentiment
                ? 'bg-[var(--news-accent)] text-white'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
            }`}
          >
            All Sentiments
          </button>
          {SENTIMENTS.map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => onSentimentChange(sentiment)}
              className={`w-full text-left px-3 py-2 rounded-md transition text-sm font-semibold inline-flex items-center gap-2 ${
                selectedSentiment === sentiment
                  ? 'bg-[var(--news-accent)] text-white'
                  : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
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
