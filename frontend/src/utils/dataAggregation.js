export function extractKeywordsFromArticles(articles = [], max = 5) {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'after', 'into', 'will', 'are', 'its', 'new',
    'ai', 'news', 'over', 'under', 'about', 'amid', 'into', 'more', 'than',
  ]);

  const counts = new Map();
  articles.forEach((article) => {
    const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
    text.split(/[^a-z0-9]+/).forEach((word) => {
      if (word.length < 4 || stopWords.has(word)) {
        return;
      }
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([topic, count]) => ({ topic, count }));
}

export function extractTopCompanies(articles = [], max = 5) {
  const knownCompanies = [
    'OpenAI', 'Nvidia', 'Microsoft', 'Google', 'Meta', 'Amazon', 'Anthropic', 'Apple', 'Tesla', 'xAI',
  ];
  const counts = new Map(knownCompanies.map((name) => [name, 0]));

  articles.forEach((article) => {
    const text = `${article?.title || ''} ${article?.summary || ''}`.toLowerCase();
    knownCompanies.forEach((company) => {
      const normalized = company.toLowerCase();
      if (text.includes(normalized)) {
        counts.set(company, (counts.get(company) || 0) + 1);
      }
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([company, count]) => ({ company, count }));
}
