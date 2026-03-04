import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-blue-100 transition">
            <BookOpen size={32} />
            <span>NewsAgg</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-blue-100 transition">Home</Link>
            <a href="http://localhost:8080/h2-console" target="_blank" rel="noopener noreferrer" className="hover:text-blue-100 transition flex items-center gap-2">
              <Zap size={16} />
              Database
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
