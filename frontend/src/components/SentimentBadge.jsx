import React from 'react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

export default function SentimentBadge({ sentiment }) {
  const sentimentConfig = {
    POSITIVE: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: ThumbsUp,
      label: 'Positive',
    },
    NEUTRAL: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: Minus,
      label: 'Neutral',
    },
    NEGATIVE: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: ThumbsDown,
      label: 'Negative',
    },
  };

  const config = sentimentConfig[sentiment] || sentimentConfig.NEUTRAL;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold whitespace-nowrap`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
}
