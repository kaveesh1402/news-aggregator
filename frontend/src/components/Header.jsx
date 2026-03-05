import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Database, Radar } from 'lucide-react';

export default function Header() {
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="border-b border-slate-700 bg-slate-950 text-slate-100 shadow-2xl">
      <div className="border-b border-slate-800 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className="rounded bg-[var(--news-accent)] px-2 py-1 text-[10px] tracking-wider">LIVE DESK</span>
            <span className="text-slate-300 hidden sm:inline">AI News Monitoring Stream</span>
          </div>
          <div className="text-slate-400">{now}</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--news-accent)]/20 border border-[var(--news-accent)]/50 p-2">
              <BookOpenCheck size={28} className="text-rose-300" />
            </div>
            <div>
              <p className="news-kicker text-rose-300">Editorial Intelligence</p>
              <span className="text-2xl font-black tracking-tight text-white">NewsAgg Network</span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition">
              <span className="inline-flex items-center gap-2">
                <Radar size={15} />
                Home
              </span>
            </Link>
            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <span className="inline-flex items-center gap-2">
                <Database size={15} />
              Database
              </span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
