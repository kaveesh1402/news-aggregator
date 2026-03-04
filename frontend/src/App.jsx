import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
      </Routes>
    </Router>
  );
}
