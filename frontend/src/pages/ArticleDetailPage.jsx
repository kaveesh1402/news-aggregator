import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SentimentBadge from '../components/SentimentBadge';
import { ArrowLeft, ExternalLink, AlertCircle, Loader } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={24} />
            {error || 'Article not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Articles
        </Link>

        {/* Main Article */}
        <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-gray-600">
                    {new Date(article.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
                    {article.category}
                  </span>
                  <SentimentBadge sentiment={article.sentiment} />
                </div>
              </div>
            </div>

            {/* Source Link */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold mt-4"
            >
              Read Original Article
              <ExternalLink size={16} />
            </a>
          </div>

          <hr className="my-8" />

          {/* Summary */}
          {article.summary && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
              <p className="text-lg text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                {article.summary}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Full Content</h2>
            <div className="prose prose-lg text-gray-700 whitespace-pre-wrap max-w-none">
              {article.content}
            </div>
          </div>

          {/* Metadata */}
          <hr className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold">Category</p>
              <p className="text-lg font-bold text-gray-900">{article.category}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold">Sentiment</p>
              <div className="mt-2">
                <SentimentBadge sentiment={article.sentiment} />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold">Published</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(article.publishedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </article>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Articles</h2>
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
