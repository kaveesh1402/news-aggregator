import React, { useState, useEffect } from 'react';
import { newsAPI, insightsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import { RefreshCw, AlertCircle, Newspaper, Clock3, Activity } from 'lucide-react';

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;
  const categoryOptions = (insights?.categoryCounts || [])
    .filter((item) => item?.category)
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  const fetchArticles = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      let response;

      if (searchQuery) {
        response = await newsAPI.searchArticles(searchQuery, page, pageSize);
      } else if (selectedCategory) {
        response = await newsAPI.getArticlesByCategory(selectedCategory, page, pageSize);
      } else if (selectedSentiment) {
        response = await newsAPI.getArticlesBySentiment(selectedSentiment, page, pageSize);
      } else {
        response = await newsAPI.getAllArticles(page, pageSize);
      }

      setArticles(response.data.articles);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch articles. Make sure the backend is running on localhost:8080');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await insightsAPI.getInsights();
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  };

  useEffect(() => {
    fetchArticles(0);
    fetchInsights();
  }, []);

  useEffect(() => {
    fetchArticles(0);
  }, [selectedCategory, selectedSentiment, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSelectedSentiment(null);
  };

  const handleSentimentChange = (sentiment) => {
    setSelectedSentiment(sentiment);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleDeleteArticle = async (id) => {
    try {
      await newsAPI.deleteArticle(id);
      fetchArticles(currentPage);
    } catch (err) {
      console.error('Failed to delete article:', err);
      setError('Failed to delete article');
    }
  };

  const handleManualFetch = async () => {
    try {
      setLoading(true);
      await insightsAPI.fetchNews();
      fetchArticles(0);
      fetchInsights();
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const formatLastFetched = (value) => {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <section className="news-panel rounded-xl overflow-hidden mb-6 news-entrance">
          <div className="bg-slate-900 text-slate-100 px-4 py-2 grid grid-cols-[auto_1fr] items-center gap-3 rounded-t-[18px] overflow-hidden">
            <span className="news-kicker rounded-md bg-[var(--news-accent)] px-2.5 py-1 text-[10px] shadow-sm">Breaking</span>
            <div className="min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold">
              <div className="ticker-scroll">
                <span className="inline-block pr-14">
                  AI regulation updates | New model releases | Startup funding rounds | Robotics deployments |
                </span>
                <span className="inline-block pr-14">
                  AI regulation updates | New model releases | Startup funding rounds | Robotics deployments |
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
              <p className="news-kicker text-slate-500 mb-1">Coverage</p>
              <p className="text-3xl font-black text-slate-900">{insights?.totalArticles ?? 0}</p>
              <p className="text-sm text-slate-500">Tracked stories in database</p>
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
              <p className="news-kicker text-slate-500 mb-1">Newsroom Pulse</p>
              <p className="text-lg font-black text-slate-900">{insights?.topCategory || 'General'}</p>
              <p className="text-sm text-slate-500">Dominant category</p>
            </div>
            <div className="p-5">
              <p className="news-kicker text-slate-500 mb-1">Last Pull</p>
              <p className="text-base font-bold text-slate-900">{formatLastFetched(insights?.lastFetchedAt)}</p>
              <p className="text-sm text-slate-500">Latest ingestion cycle</p>
            </div>
          </div>
        </section>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <div className="news-panel rounded-xl border-rose-300 bg-rose-50 text-rose-800 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="sticky top-4 z-30 mb-6 py-1 news-entrance">
          <div className="news-panel rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="rounded bg-slate-900 text-white p-1.5">
                <Clock3 size={14} />
              </span>
              <p className="text-sm font-semibold">
                Last fetched: <span className="text-slate-900 font-bold">{formatLastFetched(insights?.lastFetchedAt)}</span>
              </p>
            </div>
            <button
              onClick={handleManualFetch}
              disabled={loading}
              className="bg-[var(--news-accent)] text-white px-4 py-2.5 rounded-md hover:bg-[var(--news-accent-dark)] transition font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh Feed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
            <CategoryFilter
              categories={categoryOptions}
              onCategoryChange={handleCategoryChange}
              onSentimentChange={handleSentimentChange}
              selectedCategory={selectedCategory}
              selectedSentiment={selectedSentiment}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Top Stories</h2>
              <div className="text-sm font-semibold text-slate-500 inline-flex items-center gap-2">
                <Activity size={14} />
                {articles.length} articles in view
              </div>
            </div>

            {loading ? (
              <div className="news-panel rounded-xl p-10 text-center">
                <RefreshCw className="animate-spin text-[var(--news-accent)] mx-auto" size={32} />
                <p className="text-slate-600 mt-4 font-semibold">Refreshing newsroom feed...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="news-panel rounded-xl p-10 text-center">
                <Newspaper className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600 font-semibold">No stories found for current filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {articles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={fetchArticles}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
