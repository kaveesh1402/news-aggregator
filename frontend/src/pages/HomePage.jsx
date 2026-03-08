import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsAPI, insightsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import CommandCenterHeader from '../components/CommandCenterHeader';
import InsightsSidebar from '../components/InsightsSidebar';
import { extractKeywordsFromArticles, extractTopCompanies } from '../utils/dataAggregation';
import { formatLastFetched } from '../utils/formatters';
import { useArticles } from '../hooks/useArticles';
import { useInsights } from '../hooks/useInsights';
import {
  RefreshCw,
  AlertCircle,
  Newspaper,
  Clock3,
  Activity,
  Smile,
  Frown,
  Minus
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

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

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || null;
  const selectedSentiment = searchParams.get('sentiment') || null;
  const searchQuery = searchParams.get('q') || '';
  const rawPage = Number.parseInt(searchParams.get('page') || '0', 10);
  const initialPage = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0;

  const {
    articles,
    loading: articlesLoading,
    error: articlesError,
    currentPage,
    totalPages,
    fetchArticles
  } = useArticles(10);

  const { insights, fetchInsights } = useInsights();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchArticles(selectedCategory, selectedSentiment, searchQuery, initialPage);
  }, [selectedCategory, selectedSentiment, searchQuery, initialPage, fetchArticles]);

  const handleSearch = (query) => {
    if (query) {
      setSearchParams({ q: query, page: '0' });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryChange = (category) => {
    if (category) {
      setSearchParams({ category, page: '0' });
    } else {
      setSearchParams({});
    }
  };

  const handleSentimentChange = (sentiment) => {
    if (sentiment) {
      setSearchParams({ sentiment, page: '0' });
    } else {
      setSearchParams({});
    }
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleDeleteArticle = async (id) => {
    try {
      await newsAPI.deleteArticle(id);
      fetchArticles(selectedCategory, selectedSentiment, searchQuery, currentPage);
    } catch (err) {
      console.error('Failed to delete article:', err);
    }
  };

  const handleManualFetch = async () => {
    try {
      setIsRefreshing(true);
      await insightsAPI.fetchNews();
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '0');
      setSearchParams(newParams);
      await fetchArticles(selectedCategory, selectedSentiment, searchQuery, 0);
      await fetchInsights();
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const categoryOptions = (insights?.categoryCounts || [])
    .filter((item) => item?.category)
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  const sentimentCounts = (insights?.sentimentCounts || []).reduce((acc, item) => {
    const key = item?.sentiment;
    if (key) acc[key] = item.count || 0;
    return acc;
  }, {});

  const sentimentDelta = (sentimentCounts.POSITIVE || 0) - (sentimentCounts.NEGATIVE || 0);

  const trendingTopics = extractKeywordsFromArticles(articles, 6);
  const topCompanies = extractTopCompanies(articles, 6);
  
  const momentum = categoryOptions.slice(0, 3).map((entry, index) => ({
    label: entry.category,
    score: Math.max(12, 100 - index * 22),
  }));

  const showSkeleton = articlesLoading && articles.length === 0;

  return (
    <div className="min-h-screen ambient-canvas">
      <div className="ambient-gradient-layer" aria-hidden="true" />
      <div className="news-shell py-6 sm:py-8">
        
        <CommandCenterHeader insights={insights} />

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
          <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
        </div>

        {(articlesError) && (
          <div className="news-panel rounded-xl border-rose-300 bg-rose-50/90 text-rose-800 px-4 py-3 mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {articlesError}
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
              disabled={isRefreshing || articlesLoading}
              className="btn-primary px-4 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
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

            {articlesLoading ? (
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
                <motion.div
                  className="grid grid-cols-1 gap-6 mb-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {articles.map((article) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </motion.div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

          <InsightsSidebar 
            trendingTopics={trendingTopics}
            topCompanies={topCompanies}
            sentimentDelta={sentimentDelta}
            momentum={momentum}
          />
        </div>
      </div>
    </div>
  );
}
