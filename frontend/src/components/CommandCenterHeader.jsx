import React, { useRef } from 'react';
import { Layers3, Globe2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { formatLastFetched } from '../utils/formatters';

export default function CommandCenterHeader({ insights }) {
  const headerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const sentimentCounts = (insights?.sentimentCounts || []).reduce((acc, item) => {
    const key = item?.sentiment;
    if (key) acc[key] = item.count || 0;
    return acc;
  }, {});
  const sentimentSeries = [
    { key: 'POSITIVE', label: 'Positive', color: 'linear-gradient(120deg, #059669, #34d399)' },
    { key: 'NEUTRAL', label: 'Neutral', color: 'linear-gradient(120deg, #64748b, #94a3b8)' },
    { key: 'NEGATIVE', label: 'Negative', color: 'linear-gradient(120deg, #b45309, #f59e0b)' },
  ];
  const sentimentTotal = sentimentSeries.reduce((sum, item) => sum + (sentimentCounts[item.key] || 0), 0);
  
  const categoryOptions = (insights?.categoryCounts || [])
    .filter((item) => item?.category)
    .sort((a, b) => (b.count || 0) - (a.count || 0));
  const categorySeries = categoryOptions.slice(0, 5);
  const categoryMax = categorySeries.length ? Math.max(...categorySeries.map((c) => c.count || 0), 1) : 1;

  return (
    <motion.section 
      ref={headerRef}
      style={{ scale: heroScale, opacity: heroOpacity }}
      className="news-panel news-panel-soft command-center rounded-xl overflow-hidden mb-9" 
    >
      <div className="bg-slate-900 text-slate-100 command-center-ticker px-4 py-2 grid grid-cols-[auto_1fr] items-center gap-3 rounded-t-[18px] overflow-hidden">
        <span className="news-kicker rounded-md bg-[var(--news-accent)] px-2.5 py-1 text-[10px] shadow-sm">Breaking</span>
        <div className="ticker-wrap min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold">
          <div className="ticker-scroll">
            <span className="inline-block pr-14">
              AI regulation updates | New model releases | Startup funding rounds | Robotics deployments |
            </span>
            <span className="inline-block pr-14">
              AI regulation updates | New model releases | Startup funding rounds | Robotics deployments |
            </span>
          </div>
        </div>
      </div>
      <motion.div 
        style={{ y: yParallax }}
        className="p-5 sm:p-8 pb-5 border-b border-slate-200/80 bg-[linear-gradient(110deg,#fff_0%,#f8fbff_65%,#fef4ef_100%)] command-center-hero"
      >
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="news-kicker text-[var(--news-accent)] mb-2"
        >
          Command Center
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-6xl font-black leading-tight headline-gradient"
        >
          AI Global News Intelligence
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-3 text-sm sm:text-base max-w-3xl text-slate-600 leading-relaxed"
        >
          Enterprise-grade tracking for coverage volume, sentiment shifts, and category momentum.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          <span className="surface-chip">Real-time ingestion</span>
          <span className="surface-chip">Semantic retrieval</span>
          <span className="surface-chip">Source-aware summaries</span>
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative z-10 bg-white/70">
        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 command-metric">
          <p className="news-kicker text-slate-500 mb-1">Coverage</p>
          <div className="text-3xl font-black text-slate-900 inline-flex items-center gap-2">
            <Layers3 size={22} className="text-[var(--news-secondary)]" />
            {insights ? insights.totalArticles : <span className="skeleton inline-block h-8 w-16" />}
          </div>
          <p className="text-sm text-slate-500">Tracked stories in database</p>
        </div>
        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200 bg-white/70 command-metric">
          <p className="news-kicker text-slate-500 mb-1">Newsroom Pulse</p>
          <div className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
            <Globe2 size={18} className="text-[var(--news-secondary)]" />
            {insights ? (insights.topCategory || 'General') : <span className="skeleton inline-block h-6 w-24" />}
          </div>
          <p className="text-sm text-slate-500">Dominant category</p>
        </div>
        <div className="p-5 bg-white/70 command-metric">
          <p className="news-kicker text-slate-500 mb-1">Last Pull</p>
          <div className="text-base font-bold text-slate-900">
            {insights ? formatLastFetched(insights?.lastFetchedAt) : <span className="skeleton inline-block h-5 w-40" />}
          </div>
          <p className="text-sm text-slate-500">Latest ingestion cycle</p>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white/80 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 command-analytics">
        <div>
          <p className="news-kicker text-slate-500 mb-3">Sentiment Mix</p>
          <div className="mini-chart">
            {sentimentSeries.map((item) => {
              const count = sentimentCounts[item.key] || 0;
              const width = sentimentTotal > 0 ? Math.max((count / sentimentTotal) * 100, count > 0 ? 8 : 0) : 0;
              return (
                <div key={item.key} className="mini-chart-row">
                  <span className="font-semibold text-slate-600">{item.label}</span>
                  <div className="mini-chart-track" title={`${item.label}: ${count}`}>
                    <div className="mini-chart-fill" style={{ width: `${width}%`, background: item.color }} />
                  </div>
                  <span className="text-slate-500 font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="news-kicker text-slate-500 mb-3">Top Categories</p>
          <div className="mini-chart">
            {(categorySeries.length ? categorySeries : [{ category: 'No data', count: 0 }]).map(({ category, count }) => {
              const width = categoryMax > 0 ? ((count || 0) / categoryMax) * 100 : 0;
              return (
                <div key={category} className="mini-chart-row">
                  <span className="font-semibold text-slate-600 truncate" title={category}>{category}</span>
                  <div className="mini-chart-track" title={`${category}: ${count || 0}`}>
                    <div className="mini-chart-fill" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-slate-500 font-semibold">{count || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
