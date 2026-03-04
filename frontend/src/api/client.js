import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// News endpoints
export const newsAPI = {
  getAllArticles: (page = 0, size = 10) =>
    client.get('/news', { params: { page, size } }),
  
  getArticleById: (id) =>
    client.get(`/news/${id}`),
  
  searchArticles: (query, page = 0, size = 10) =>
    client.get('/news/search', { params: { q: query, page, size } }),
  
  semanticSearch: (query, page = 0, size = 10) =>
    client.get('/news/semantic-search', { params: { query, page, size } }),
  
  getArticlesByCategory: (category, page = 0, size = 10) =>
    client.get(`/news/category/${category}`, { params: { page, size } }),
  
  getArticlesBySentiment: (sentiment, page = 0, size = 10) =>
    client.get(`/news/sentiment/${sentiment}`, { params: { page, size } }),
  
  getRecommendations: (id, size = 5) =>
    client.get(`/news/${id}/recommendations`, { params: { size } }),
  
  deleteArticle: (id) =>
    client.delete(`/news/${id}`),
};

// Insights endpoints
export const insightsAPI = {
  getInsights: () =>
    client.get('/insights'),
  
  fetchNews: () =>
    client.post('/fetch-news'),
  
  getHealth: () =>
    client.get('/health'),
};

export default client;
