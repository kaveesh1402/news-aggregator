import React, { useState, useEffect } from 'react';
import { newsAPI, insightsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import {
  RefreshCw,
  AlertCircle,
  Newspaper,
  Clock3,
  Activity,
  Layers3,
  Globe2,
  Smile,
  Frown,
  Minus,
  BrainCircuit,
  Building2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

function FilterSkeleton() {
  return (
    <div className="news-panel news-panel-soft rounded-xl p-6 h-fit">
      <div className="skeleton h-6 w-28 mb-5" />
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="space-y-2 mb-6">
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
      </div>
      <div className="skeleton h-4 w-28 mb-3" />
      <div className="space-y-2">
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <article className="news-panel news-panel-soft rounded-xl p-5 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <div className="skeleton h-52 md:h-[210px] w-full rounded-xl" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="skeleton h-8 w-[88%] mb-2" />
          <div className="skeleton h-8 w-[72%] mb-3" />
          <div className="skeleton h-4 w-48 mb-4" />
          <div className="space-y-2 mb-5">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-[82%]" />
          </div>
          <div className="skeleton h-9 w-full" />
        </div>
      </div>
    </article>
  );
}

function extractKeywordsFromArticles(articles = [], max = 5) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'after', 'into', 'will', 'are', 'its', 'new',
    'ai', 'news', 'over', 'under', 'about', 'amid', 'into', 'more', 'than',
  ]);

  const counts = new Map();
  articles.forEach((article) => {
    const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
    text.split(/[^a-z0-9]+/).forEach((word) => {
      if (word.length < 4 || stopWords.has(word)) {
        return;
      }
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([topic, count]) => ({ topic, count }));
}

function extractTopCompanies(articles = [], max = 5) {
  const knownCompanies = [
    'OpenAI', 'Nvidia', 'Microsoft', 'Google', 'Meta', 'Amazon', 'Anthropic', 'Apple', 'Tesla', 'xAI',
  ];
  const counts = new Map(knownCompanies.map((name) => [name, 0]));

  articles.forEach((article) => {
    const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
    knownCompanies.forEach((company) => {
      const normalized = company.toLowerCase();
      if (text.includes(normalized)) {
        counts.set(company, (counts.get(company) || 0) + 1);
      }
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([company, count]) => ({ company, count }));
}

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
  const sentimentCounts = (insights?.sentimentCounts || []).reduce((acc, item) => {
    const key = item?.sentiment;
    if (key) acc[key] = item.count || 0;
    return acc;
  }, {});
  const sentimentSeries = [
    { key: 'POSITIVE', label: 'Positive', color: 'linear-gradient(120deg, #059669, #34d399)' },
    { key: 'NEUTRAL', label: 'Neutral', color: 'linear-gradient(120deg, #64748b, #94a3b8)' },
    { key: 'NEGATIVE', label: 'Negative', color: 'linear-gradient(120deg, #b45309, #f59e0b)' },
  ];
  const sentimentTotal = sentimentSeries.reduce((sum, item) => sum + (sentimentCounts[item.key] || 0), 0);
  const categorySeries = categoryOptions.slice(0, 5);
  const categoryMax = categorySeries.length ? Math.max(...categorySeries.map((c) => c.count || 0), 1) : 1;
  const trendingTopics = extractKeywordsFromArticles(articles, 6);
  const topCompanies = extractTopCompanies(articles, 6);
  const sentimentDelta = (sentimentCounts.POSITIVE || 0) - (sentimentCounts.NEGATIVE || 0);
  const momentum = categorySeries.slice(0, 3).map((entry, index) => ({
    label: entry.category,
    score: Math.max(12, 100 - index * 22),
  }));

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
  const showSkeleton = loading && articles.length === 0;

  return (
    <div className="min-h-screen ambient-canvas">
      <div className="ambient-gradient-layer" aria-hidden="true" />
      <div className="news-shell py-6 sm:py-8">
        <section className="news-panel news-panel-soft command-center rounded-xl overflow-hidden mb-9 news-entrance section-reveal" style={{ '--reveal-delay': '40ms' }}>
          <div className="bg-slate-900 text-slate-100 command-center-ticker px-4 py-2 grid grid-cols-[auto_1fr] items-center gap-3 rounded-t-[18px] overflow-hidden">
            <span className="news-kicker rounded-md bg-[var(--news-accent)] px-2.5 py-1 text-[10px] shadow-sm">Breaking</span>
            <div className="ticker-wrap min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold">
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
          <div className="p-5 sm:p-8 pb-5 border-b border-slate-200/80 bg-[linear-gradient(110deg,#fff_0%,#f8fbff_65%,#fef4ef_100%)] command-center-hero">
            <p className="news-kicker text-[var(--news-accent)] mb-2">Command Center</p>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight headline-gradient">AI Global News Intelligence</h1>
            <p className="mt-3 text-sm sm:text-base max-w-3xl text-slate-600 leading-relaxed">
              Enterprise-grade tracking for coverage volume, sentiment shifts, and category momentum.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="surface-chip">Real-time ingestion</span>
              <span className="surface-chip">Semantic retrieval</span>
              <span className="surface-chip">Source-aware summaries</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 bg-white/70 command-metric">
              <p className="news-kicker text-slate-500 mb-1">Coverage</p>
              <div className="text-3xl font-black text-slate-900 inline-flex items-center gap-2">
                <Layers3 size={22} className="text-[var(--news-secondary)]" />
                {insights ? insights.totalArticles : <span className="skeleton inline-block h-8 w-16" />}
              </div>
              <p className="text-sm text-slate-500">Tracked stories in database</p>
            </div>
            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 bg-white/70 command-metric">
              <p className="news-kicker text-slate-500 mb-1">Newsroom Pulse</p>
              <div className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <Globe2 size={18} className="text-[var(--news-secondary)]" />
                {insights ? (insights.topCategory || 'General') : <span className="skeleton inline-block h-6 w-24" />}
              </div>
              <p className="text-sm text-slate-500">Dominant category</p>
            </div>
            <div className="p-5 bg-white/70 command-metric">
              <p className="news-kicker text-slate-500 mb-1">Last Pull</p>
              <div className="text-base font-bold text-slate-900">
                {insights ? formatLastFetched(insights?.lastFetchedAt) : <span className="skeleton inline-block h-5 w-40" />}
              </div>
              <p className="text-sm text-slate-500">Latest ingestion cycle</p>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-white/80 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 command-analytics">
            <div>
              <p className="news-kicker text-slate-500 mb-3">Sentiment Mix</p>
              <div className="mini-chart">
                {sentimentSeries.map((item) => {
                  const count = sentimentCounts[item.key] || 0;
                  const width = sentimentTotal > 0 ? Math.max((count / sentimentTotal) * 100, count > 0 ? 8 : 0) : 0;
                  return (
                    <div key={item.key} className="mini-chart-row">
                      <span className="font-semibold text-slate-600">{item.label}</span>
                      <div className="mini-chart-track" title={`${item.label}: ${count}`}>
                        <div className="mini-chart-fill" style={{ width: `${width}%`, background: item.color }} />
                      </div>
                      <span className="text-slate-500 font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="news-kicker text-slate-500 mb-3">Top Categories</p>
              <div className="mini-chart">
                {(categorySeries.length ? categorySeries : [{ category: 'No data', count: 0 }]).map(({ category, count }) => {
                  const width = categoryMax > 0 ? ((count || 0) / categoryMax) * 100 : 0;
                  return (
                    <div key={category} className="mini-chart-row">
                      <span className="font-semibold text-slate-600 truncate" title={category}>{category}</span>
                      <div className="mini-chart-track" title={`${category}: ${count || 0}`}>
                        <div className="mini-chart-fill" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-slate-500 font-semibold">{count || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 news-entrance section-reveal" style={{ '--reveal-delay': '110ms' }}>
          <div className="news-panel news-panel-soft news-panel-luxe hover-lift rounded-xl px-5 py-4 pulse-card">
            <p className="news-kicker text-slate-500 mb-2">Positive</p>
            <p className="text-2xl font-black text-slate-900 inline-flex items-center gap-2">
              <Smile size={18} className="text-emerald-600" />
              {sentimentCounts.POSITIVE || 0}
            </p>
          </div>
          <div className="news-panel news-panel-soft news-panel-luxe hover-lift rounded-xl px-5 py-4 pulse-card">
            <p className="news-kicker text-slate-500 mb-2">Neutral</p>
            <p className="text-2xl font-black text-slate-900 inline-flex items-center gap-2">
              <Minus size={18} className="text-slate-500" />
              {sentimentCounts.NEUTRAL || 0}
            </p>
          </div>
          <div className="news-panel news-panel-soft news-panel-luxe hover-lift rounded-xl px-5 py-4 pulse-card">
            <p className="news-kicker text-slate-500 mb-2">Negative</p>
            <p className="text-2xl font-black text-slate-900 inline-flex items-center gap-2">
              <Frown size={18} className="text-orange-700" />
              {sentimentCounts.NEGATIVE || 0}
            </p>
          </div>
        </section>

        <div className="section-reveal" style={{ '--reveal-delay': '160ms' }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {error && (
          <div className="news-panel rounded-xl border-rose-300 bg-rose-50/90 text-rose-800 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="sticky top-4 z-30 mb-7 py-1 news-entrance section-reveal" style={{ '--reveal-delay': '220ms' }}>
          <div className="news-panel news-panel-soft news-panel-luxe rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 feed-toolbar">
            <div className="flex items-center gap-3 text-slate-700">
              <span className="rounded bg-slate-900 text-white p-1.5 shadow">
                <Clock3 size={14} />
              </span>
              <p className="text-sm font-semibold">
                Last fetched: <span className="text-slate-900 font-bold">{formatLastFetched(insights?.lastFetchedAt)}</span>
              </p>
            </div>
            <button
              onClick={handleManualFetch}
              disabled={loading}
              className="btn-primary px-4 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              Refresh Feed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 section-reveal" style={{ '--reveal-delay': '260ms' }}>
          <div className="xl:col-span-3 lg:sticky lg:top-6 lg:self-start">
            {showSkeleton ? (
              <FilterSkeleton />
            ) : (
              <CategoryFilter
                categories={categoryOptions}
                onCategoryChange={handleCategoryChange}
                onSentimentChange={handleSentimentChange}
                selectedCategory={selectedCategory}
                selectedSentiment={selectedSentiment}
              />
            )}
          </div>

          <div className="xl:col-span-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="news-section-title text-slate-900 tracking-tight">Top Stories</h2>
              <div className="news-caption inline-flex items-center gap-2">
                <Activity size={14} />
                {articles.length} articles in view
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 mb-8">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            ) : articles.length === 0 ? (
              <div className="news-panel news-panel-soft rounded-xl p-10 text-center">
                <Newspaper className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600 font-semibold">No stories found for current filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {articles.map((article, index) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onDelete={handleDeleteArticle}
                      style={{ animationDelay: `${Math.min(index * 55, 320)}ms` }}
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

          <aside className="xl:col-span-3">
            <div className="news-panel news-panel-soft news-panel-luxe rounded-xl p-5 mb-6 insights-panel">
              <h3 className="text-lg font-black text-slate-900 inline-flex items-center gap-2 mb-4">
                <Sparkles size={17} className="text-[var(--news-accent)]" />
                AI Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="news-kicker text-slate-500 mb-2 inline-flex items-center gap-1.5"><TrendingUp size={13} />Trending Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {(trendingTopics.length ? trendingTopics : [{ topic: 'Awaiting feed', count: 0 }]).map((item) => (
                      <span key={item.topic} className="surface-chip" title={`${item.topic}: ${item.count}`}>
                        {item.topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="news-kicker text-slate-500 mb-2 inline-flex items-center gap-1.5"><Building2 size={13} />Top Companies</p>
                  <ul className="space-y-2">
                    {(topCompanies.length ? topCompanies : [{ company: 'No matches yet', count: 0 }]).map((item) => (
                      <li key={item.company} className="insight-row">
                        <span className="text-sm font-semibold text-slate-700">{item.company}</span>
                        <span className="text-xs font-bold text-slate-500">{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="news-kicker text-slate-500 mb-2 inline-flex items-center gap-1.5"><BrainCircuit size={13} />Sentiment Trend</p>
                  <p className="text-sm text-slate-600">
                    Net sentiment is <span className="font-bold text-slate-900">{sentimentDelta >= 0 ? 'positive' : 'negative'}</span> by {Math.abs(sentimentDelta)} stories.
                  </p>
                </div>

                <div>
                  <p className="news-kicker text-slate-500 mb-2">Category Momentum</p>
                  <div className="space-y-2">
                    {(momentum.length ? momentum : [{ label: 'No data', score: 0 }]).map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>{item.label}</span>
                          <span>{item.score}%</span>
                        </div>
                        <div className="mini-chart-track">
                          <div className="mini-chart-fill" style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
