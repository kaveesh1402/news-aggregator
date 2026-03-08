import { useState, useCallback, useEffect } from 'react';
import { insightsAPI } from '../api/client';

export function useInsights() {
  const [insights, setInsights] = useState(null);
  
  const fetchInsights = useCallback(async () => {
    try {
      const response = await insightsAPI.getInsights();
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { insights, setInsights, fetchInsights };
}
