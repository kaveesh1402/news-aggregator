import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Trash2, Clock3 } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

export default function NewsCard({ article, onDelete }) {
  const publishedValue = article.publishedAt || article.publishedDate;
  const publishedDate = publishedValue ? new Date(publishedValue) : null;
  const publishedText =
    publishedDate && !Number.isNaN(publishedDate.getTime())
      ? publishedDate.toLocaleDateString()
      : 'Unknown date';

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Delete this article?')) {
      onDelete(article.id);
    }
  };

  return (
    <Link to={`/article/${article.id}`}>
      <article className="news-panel rounded-xl p-6 h-full cursor-pointer transition duration-300 hover:-translate-y-0.5 hover:shadow-xl news-entrance">
        {article.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-48 w-full object-cover transition duration-300 hover:scale-[1.02]"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <p className="news-kicker text-[var(--news-accent)]">{article.category || 'General'}</p>
          <SentimentBadge sentiment={article.sentiment} />
        </div>

        <div className="mb-4">
          <h3 className="text-2xl font-black leading-tight text-slate-900 line-clamp-2 hover:text-[var(--news-accent)] transition">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 inline-flex items-center gap-2">
            <Clock3 size={14} />
            {publishedText} | {article.source || 'Wire Source'}
          </p>
        </div>

        <p className="text-slate-700 line-clamp-3 mb-5 text-[1.02rem] leading-relaxed">
          {article.summary || article.content}
        </p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
            Open detailed coverage
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
              <ExternalLink size={15} />
              Source
            </span>
            <button
              onClick={handleDelete}
              className="rounded-md border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition"
              aria-label="Delete article"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
