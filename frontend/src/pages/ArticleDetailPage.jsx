import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SentimentBadge from '../components/SentimentBadge';
import { ArrowLeft, ExternalLink, AlertCircle, Loader, CalendarDays, Newspaper } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [articleRes, recsRes] = await Promise.all([
          newsAPI.getArticleById(id),
          newsAPI.getRecommendations(id, 3),
        ]);
        setArticle(articleRes.data);
        setRecommendations(recsRes.data);
      } catch (err) {
        setError('Failed to fetch article details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-[var(--news-accent)] mx-auto mb-4" size={32} />
          <p className="text-slate-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen">
        <div className="news-shell py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[var(--news-secondary)] hover:text-slate-900 mb-8 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </Link>
          <div className="news-panel border-rose-300 bg-rose-50 text-rose-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={24} />
            {error || 'Article not found'}
          </div>
        </div>
      </div>
    );
  }

  const publishedValue = article.publishedAt || article.publishedDate;
  const publishedDate = publishedValue ? new Date(publishedValue) : null;
  const hasValidDate = publishedDate && !Number.isNaN(publishedDate.getTime());
  const publishedLong = hasValidDate
    ? publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown date';
  const publishedShort = hasValidDate
    ? publishedDate.toLocaleDateString()
    : 'Unknown date';
  const sourceExcerpt = article.sourceExcerpt || article.content || 'No source excerpt available.';

  return (
    <div className="min-h-screen">
      <div className="news-shell py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[var(--news-secondary)] hover:text-slate-900 mb-8 font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </Link>

        <article className="news-panel news-panel-soft news-panel-luxe rounded-xl p-5 sm:p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <p className="news-kicker text-[var(--news-accent)] mb-2">Full Briefing</p>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight max-w-4xl">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-slate-600 inline-flex items-center gap-1.5">
                    <CalendarDays size={15} />
                    {publishedLong}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {article.category}
                  </span>
                  <SentimentBadge sentiment={article.sentiment} />
                </div>
              </div>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--news-secondary)] hover:text-slate-900 text-sm font-semibold mt-4 btn-ghost px-3 py-2"
            >
              Read Original Article
              <ExternalLink size={16} />
            </a>
          </div>

          <hr className="my-8 border-slate-200" />

          {article.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-[460px] object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          {article.summary && (
            <div className="mb-8">
              <h2 className="news-section-title text-slate-900 mb-2">AI Summary</h2>
              <p className="text-sm text-[var(--news-secondary)] mb-4">
                Concise model-generated overview of the article.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed bg-blue-50 p-5 rounded-xl border-l-4 border-blue-400 max-w-4xl">
                {article.summary}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="news-section-title text-slate-900 mb-2">Source Excerpt</h2>
            <p className="text-sm text-slate-500 mb-4">
              Cleaned source-backed excerpt. Open the original link for full article text.
            </p>
            <div className="prose prose-lg text-slate-700 whitespace-pre-wrap max-w-none bg-slate-50 border border-slate-200 rounded-xl p-5 leading-8">
              {sourceExcerpt}
            </div>
          </div>

          <hr className="my-8 border-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold">Category</p>
              <p className="text-lg font-bold text-slate-900">{article.category}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold">Sentiment</p>
              <div className="mt-2">
                <SentimentBadge sentiment={article.sentiment} />
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold">Published</p>
              <p className="text-lg font-bold text-slate-900">
                {publishedShort}
              </p>
            </div>
          </div>
        </article>

        {recommendations.length > 0 && (
          <section>
            <h2 className="news-section-title text-slate-900 mb-6 inline-flex items-center gap-2">
              <Newspaper size={26} />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec) => (
                <NewsCard key={rec.id} article={rec} onDelete={() => {}} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
