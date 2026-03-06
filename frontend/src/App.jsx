import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-enter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="relative z-10">
        <Header />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}
