import React from 'react';
import { Circle } from 'lucide-react';

export default function SentimentBadge({ sentiment }) {
  const sentimentConfig = {
    POSITIVE: {
      bg: 'bg-emerald-50/90 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'fill-emerald-500 text-emerald-500',
      label: 'Positive',
    },
    NEUTRAL: {
      bg: 'bg-slate-100/90 border-slate-200',
      text: 'text-slate-700',
      dot: 'fill-slate-400 text-slate-400',
      label: 'Neutral',
    },
    NEGATIVE: {
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-800',
      dot: 'fill-orange-500 text-orange-500',
      label: 'Negative',
    },
  };

  const config = sentimentConfig[sentiment] || sentimentConfig.NEUTRAL;

  return (
    <div className={`${config.bg} ${config.text} border px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold whitespace-nowrap uppercase tracking-wide`}>
      <Circle size={10} className={config.dot} />
      {config.label}
    </div>
  );
}
