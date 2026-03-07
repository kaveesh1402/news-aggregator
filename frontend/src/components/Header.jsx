import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Database, Radar, Sparkles } from 'lucide-react';

export default function Header({ theme = 'light', onToggleTheme }) {
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="relative border-b border-slate-800/60 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden">
      <div className="relative border-b border-slate-800 bg-slate-900/70">
        <div className="news-shell py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className="rounded bg-[var(--news-accent)] px-2 py-1 text-[10px] tracking-wider">LIVE DESK</span>
            <span className="text-slate-300 hidden sm:inline">AI News Monitoring Stream</span>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-slate-300">{now}</div>
        </div>
      </div>

      <div className="news-shell relative py-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-xl bg-[var(--news-accent)]/20 border border-[var(--news-accent)]/50 p-2.5 shadow-lg shadow-orange-500/10">
              <BookOpenCheck size={28} className="text-rose-300" />
            </div>
            <div>
              <p className="news-kicker text-orange-300">Editorial Intelligence</p>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">NewsAgg Network</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="rounded-xl border border-slate-700/80 bg-slate-900/55 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition">
              <span className="inline-flex items-center gap-2">
                <Radar size={15} />
                Home
              </span>
            </Link>
            <button
              type="button"
              onClick={onToggleTheme}
              className="theme-toggle-btn rounded-xl border border-slate-700/80 bg-slate-900/55 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <span className="inline-flex items-center gap-2.5">
                  <span className="theme-toggle-icon-wrap" aria-hidden="true">
                    <svg className="theme-icon theme-icon-sun theme-svg" viewBox="0 0 24 24">
                      <circle className="theme-sun-core" cx="12" cy="12" r="4.1" />
                      <g className="theme-sun-rays">
                        <line x1="12" y1="1.8" x2="12" y2="4.6" />
                        <line x1="12" y1="19.4" x2="12" y2="22.2" />
                        <line x1="1.8" y1="12" x2="4.6" y2="12" />
                        <line x1="19.4" y1="12" x2="22.2" y2="12" />
                        <line x1="4.6" y1="4.6" x2="6.6" y2="6.6" />
                        <line x1="17.4" y1="17.4" x2="19.4" y2="19.4" />
                        <line x1="4.6" y1="19.4" x2="6.6" y2="17.4" />
                        <line x1="17.4" y1="6.6" x2="19.4" y2="4.6" />
                      </g>
                    </svg>
                    <svg className="theme-icon theme-icon-moon theme-svg" viewBox="0 0 24 24">
                      <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3a6.7 6.7 0 1 0 9.8 9.8Z" />
                    </svg>
                  </span>
                  <span className="theme-toggle-label-wrap" aria-hidden="true">
                    <span className="theme-toggle-label theme-toggle-label-dark">Dark</span>
                    <span className="theme-toggle-label theme-toggle-label-light">Light</span>
                  </span>
                </span>
            </button>
            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-700/80 bg-slate-900/55 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <span className="inline-flex items-center gap-2">
                <Database size={15} />
                Database
              </span>
            </a>
          </nav>
        </div>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 inline-flex items-center gap-2 max-w-3xl">
          <Sparkles size={14} className="text-orange-300" />
          <span>High-fidelity briefings with AI categorization, sentiment, and similarity intelligence.</span>
        </div>
      </div>
    </header>
  );
}
