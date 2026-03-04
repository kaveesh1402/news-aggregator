import React, { useState, useEffect } from 'react';
import { newsAPI, insightsAPI } from '../api/client';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import { RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

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
  const [searchType, setSearchType] = useState('keyword');
  const pageSize = 10;

  // Fetch articles
  const fetchArticles = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      let response;

      if (searchQuery) {
        // Perform search
        response = searchType === 'semantic'
          ? await newsAPI.semanticSearch(searchQuery, page, pageSize)
          : await newsAPI.searchArticles(searchQuery, page, pageSize);
      } else if (selectedCategory) {
        // Filter by category
        response = await newsAPI.getArticlesByCategory(selectedCategory, page, pageSize);
      } else if (selectedSentiment) {
        // Filter by sentiment
        response = await newsAPI.getArticlesBySentiment(selectedSentiment, page, pageSize);
      } else {
        // Get all articles
        response = await newsAPI.getAllArticles(page, pageSize);
      }

      setArticles(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch articles. Make sure the backend is running on localhost:8080');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch insights
  const fetchInsights = async () => {
    try {
      const response = await insightsAPI.getInsights();
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchArticles(0);
    fetchInsights();
  }, []);

  // Fetch when filters/search change
  useEffect(() => {
    fetchArticles(0);
  }, [selectedCategory, selectedSentiment, searchQuery, searchType]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Articles</p>
                  <p className="text-3xl font-bold text-blue-600">{insights.totalArticles}</p>
                </div>
                <TrendingUp className="text-blue-400" size={32} />
              </div>
            </div>

            {Object.entries(insights.categoryCounts).slice(0, 3).map(([category, count]) => (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{category}</p>
                <p className="text-3xl font-bold text-blue-600">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onSearchTypeChange={handleSearchTypeChange} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <CategoryFilter
              onCategoryChange={handleCategoryChange}
              onSentimentChange={handleSentimentChange}
              selectedCategory={selectedCategory}
              selectedSentiment={selectedSentiment}
            />
            <button
              onClick={handleManualFetch}
              disabled={loading}
              className="w-full mt-6 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Fetch News
            </button>
          </div>

          {/* Articles Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <RefreshCw className="animate-spin text-blue-600" size={32} />
                </div>
                <p className="text-gray-600 mt-4">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No articles found. Try a different search or filter.</p>
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
