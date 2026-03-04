import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Trash2 } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

export default function NewsCard({ article, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Delete this article?')) {
      onDelete(article.id);
    }
  };

  return (
    <Link to={`/article/${article.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 h-full cursor-pointer border border-gray-200">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600">
              {article.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(article.publishedDate).toLocaleDateString()}
            </p>
          </div>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        <p className="text-gray-700 line-clamp-3 mb-4">
          {article.summary || article.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
              {article.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink size={16} className="text-gray-500" />
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
