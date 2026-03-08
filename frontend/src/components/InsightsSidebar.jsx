import React from 'react';
import { BrainCircuit, Building2, TrendingUp, Sparkles } from 'lucide-react';

export default function InsightsSidebar({ trendingTopics, topCompanies, sentimentDelta, momentum }) {
  return (
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
  );
}
