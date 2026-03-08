import { useState, useCallback } from 'react';
import { newsAPI } from '../api/client';

export function useArticles(pageSize = 10) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchArticles = useCallback(async (category, sentiment, query, page = 0) => {
    const safePage = Number.isInteger(page) && page >= 0 ? page : 0;
    setLoading(true);
    setError(null);
    try {
      let response;
      if (query) {
        response = await newsAPI.searchArticles(query, safePage, pageSize);
      } else if (category) {
        response = await newsAPI.getArticlesByCategory(category, safePage, pageSize);
      } else if (sentiment) {
        response = await newsAPI.getArticlesBySentiment(sentiment, safePage, pageSize);
      } else {
        response = await newsAPI.getAllArticles(safePage, pageSize);
      }

      setArticles(response.data.articles);
      setTotalPages(response.data.totalPages);
      setCurrentPage(safePage);
    } catch (err) {
      setError('Failed to fetch articles. Make sure the backend is running on localhost:8080');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  return {
    articles,
    loading,
    error,
    currentPage,
    totalPages,
    fetchArticles,
    setArticles, // Useful if you need to manually update articles list (e.g. after delete)
  };
}
