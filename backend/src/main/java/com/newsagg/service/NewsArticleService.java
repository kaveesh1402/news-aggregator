package com.newsagg.service;

import com.newsagg.ai.categorizer.CategorizerService;
import com.newsagg.ai.embeddings.EmbeddingService;
import com.newsagg.ai.sentiment.SentimentAnalysisService;
import com.newsagg.ai.summarizer.SummarizerService;
import com.newsagg.dto.*;
import com.newsagg.entity.NewsArticle;
import com.newsagg.entity.SentimentType;
import com.newsagg.repository.NewsArticleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class NewsArticleService {
    private static final int MAX_EXCERPT_CHARS = 700;
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");

    private final NewsArticleRepository newsArticleRepository;
    private final SummarizerService summarizerService;
    private final SentimentAnalysisService sentimentAnalysisService;
    private final CategorizerService categorizerService;
    private final EmbeddingService embeddingService;

    public NewsArticleService(
            NewsArticleRepository newsArticleRepository,
            SummarizerService summarizerService,
            SentimentAnalysisService sentimentAnalysisService,
            CategorizerService categorizerService,
            EmbeddingService embeddingService) {
        this.newsArticleRepository = newsArticleRepository;
        this.summarizerService = summarizerService;
        this.sentimentAnalysisService = sentimentAnalysisService;
        this.categorizerService = categorizerService;
        this.embeddingService = embeddingService;
    }

    public SearchResponseDTO getAllArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        Page<NewsArticle> articles = newsArticleRepository.findAll(pageable);
        return buildSearchResponse(articles, page, size);
    }

    public NewsArticleDTO getArticleById(Long id) {
        return newsArticleRepository.findById(id)
                .map(this::safeConvertToDTO)
                .orElseThrow(() -> new RuntimeException("Article not found: " + id));
    }

    public SearchResponseDTO searchArticles(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        Page<NewsArticle> articles = newsArticleRepository.searchByKeyword(keyword, pageable);
        return buildSearchResponse(articles, page, size);
    }

    public SearchResponseDTO getArticlesByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        Page<NewsArticle> articles = newsArticleRepository.findByCategory(category, pageable);
        return buildSearchResponse(articles, page, size);
    }

    public SearchResponseDTO getArticlesBySentiment(String sentiment, int page, int size) {
        try {
            SentimentType sentimentType = SentimentType.valueOf(sentiment.toUpperCase());
            Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
            Page<NewsArticle> articles = newsArticleRepository.findBySentiment(sentimentType, pageable);
            return buildSearchResponse(articles, page, size);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid sentiment type: " + sentiment);
        }
    }

    public SearchResponseDTO semanticSearch(String query, int page, int size) {
        double[] queryEmbedding = embeddingService.generateEmbedding(query);
        List<NewsArticle> allArticles = newsArticleRepository.findAll();

        List<NewsArticle> rankedArticles = allArticles.stream()
                .map(article -> {
                    if (article.getEmbedding() != null) {
                        double[] articleEmbedding = embeddingService.deserializeEmbedding(article.getEmbedding());
                        double similarity = embeddingService.cosineSimilarity(queryEmbedding, articleEmbedding);
                        article.setRelevanceScore(similarity);
                    } else {
                        article.setRelevanceScore(0.0);
                    }
                    return article;
                })
                .filter(article -> article.getRelevanceScore() > 0.1)
                .sorted(Comparator.comparingDouble(NewsArticle::getRelevanceScore).reversed())
                .collect(Collectors.toList());

        int totalElements = rankedArticles.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<NewsArticle> pagedArticles = rankedArticles.subList(fromIndex, toIndex);
        List<NewsArticleDTO> dtos = pagedArticles.stream().map(this::safeConvertToDTO).collect(Collectors.toList());

        return SearchResponseDTO.builder()
                .articles(dtos)
                .totalElements(totalElements)
                .totalPages((totalElements + size - 1) / size)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    public SearchResponseDTO getRecommendations(Long articleId, int size) {
        NewsArticle article = newsArticleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found: " + articleId));

        if (article.getEmbedding() == null) {
            return SearchResponseDTO.builder()
                    .articles(new ArrayList<>())
                    .totalElements(0)
                    .totalPages(0)
                    .currentPage(0)
                    .pageSize(size)
                    .build();
        }

        double[] articleEmbedding = embeddingService.deserializeEmbedding(article.getEmbedding());

        List<NewsArticle> recommendations = newsArticleRepository.findAll().stream()
                .filter(a -> !a.getId().equals(articleId))
                .map(a -> {
                    if (a.getEmbedding() != null) {
                        double[] otherEmbedding = embeddingService.deserializeEmbedding(a.getEmbedding());
                        double similarity = embeddingService.cosineSimilarity(articleEmbedding, otherEmbedding);
                        a.setRelevanceScore(similarity);
                    } else {
                        a.setRelevanceScore(0.0);
                    }
                    return a;
                })
                .filter(a -> a.getRelevanceScore() > 0.2)
                .sorted(Comparator.comparingDouble(NewsArticle::getRelevanceScore).reversed())
                .limit(size)
                .collect(Collectors.toList());

        List<NewsArticleDTO> dtos = recommendations.stream().map(this::safeConvertToDTO).collect(Collectors.toList());

        return SearchResponseDTO.builder()
                .articles(dtos)
                .totalElements(recommendations.size())
                .totalPages(1)
                .currentPage(0)
                .pageSize(size)
                .build();
    }

    @Transactional
    public NewsArticleDTO processArticle(NewsArticle article) {
        log.info("Processing article: {}", article.getTitle());

        try {
            try {
                String summary = summarizerService.summarizeArticle(article.getTitle(), article.getContent());
                article.setSummary(summary);
            } catch (Exception e) {
                log.warn("Summary generation failed for article: {}", article.getTitle(), e);
            }

            try {
                SentimentType sentiment = sentimentAnalysisService.analyzeSentiment(article.getTitle(),
                        article.getContent());
                article.setSentiment(sentiment != null ? sentiment : SentimentType.NEUTRAL);
            } catch (Exception e) {
                log.warn("Sentiment analysis failed for article: {}", article.getTitle(), e);
                article.setSentiment(SentimentType.NEUTRAL);
            }

            try {
                String category = categorizerService.categorizeArticle(
                        article.getTitle(),
                        buildCategorizationText(article));
                article.setCategory(category);
            } catch (Exception e) {
                log.warn("Category classification failed for article: {}", article.getTitle(), e);
            }

            try {
                String summary = article.getSummary() != null ? article.getSummary() : "";
                String fullText = (article.getTitle() + " " + summary).trim();
                if (!fullText.isBlank()) {
                    double[] articleEmbedding = embeddingService.generateEmbedding(fullText);
                    article.setEmbedding(embeddingService.serializeEmbedding(articleEmbedding));
                }
            } catch (Exception e) {
                log.warn("Embedding generation failed for article: {}", article.getTitle(), e);
            }
        } catch (Exception e) {
            log.error("Error processing article: {}", article.getTitle(), e);
        }

        article.setProcessed(true);
        newsArticleRepository.save(article);
        return safeConvertToDTO(article);
    }

    public void saveArticle(NewsArticle article) {
        newsArticleRepository.save(article);
    }

    public boolean articleExistsByUrl(String url) {
        return newsArticleRepository.findByUrl(url).isPresent();
    }

    public List<NewsArticle> getUnprocessedArticles() {
        return newsArticleRepository.findUnprocessedArticles();
    }

    public InsightsDTO getInsights() {
        List<NewsArticle> allArticles = newsArticleRepository.findAll();
        long total = allArticles.size();
        long processed = allArticles.stream().filter(NewsArticle::getProcessed).count();
        long unprocessed = total - processed;

        Map<String, Long> categoryCounts = allArticles.stream()
                .collect(Collectors.groupingBy(NewsArticle::getCategory, Collectors.counting()));

        Map<SentimentType, Long> sentimentCounts = allArticles.stream()
                .collect(Collectors.groupingBy(NewsArticle::getSentiment, Collectors.counting()));

        String topCategory = categoryCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

        String dominantSentiment = sentimentCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().toString())
                .orElse("NEUTRAL");

        List<CategoryCountDTO> categoryList = categoryCounts.entrySet().stream()
                .map(e -> CategoryCountDTO.builder().category(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        List<SentimentCountDTO> sentimentList = sentimentCounts.entrySet().stream()
                .map(e -> SentimentCountDTO.builder().sentiment(e.getKey().toString()).count(e.getValue()).build())
                .collect(Collectors.toList());

        LocalDateTime lastFetchedAt = allArticles.stream()
                .map(NewsArticle::getFetchedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return InsightsDTO.builder()
                .totalArticles(total)
                .processedArticles(processed)
                .unprocessedArticles(unprocessed)
                .categoryCounts(categoryList)
                .sentimentCounts(sentimentList)
                .topCategory(topCategory)
                .dominantSentiment(dominantSentiment)
                .lastFetchedAt(lastFetchedAt)
                .build();
    }

    public void deleteArticle(Long id) {
        newsArticleRepository.deleteById(id);
    }

    public int recategorizeAllArticles() {
        List<NewsArticle> articles = newsArticleRepository.findAll();
        List<NewsArticle> updatedArticles = new ArrayList<>();

        for (NewsArticle article : articles) {
            String updatedCategory = categorizerService.categorizeArticle(
                    article.getTitle(),
                    buildCategorizationText(article));

            if (!Objects.equals(updatedCategory, article.getCategory())) {
                article.setCategory(updatedCategory);
                updatedArticles.add(article);
            }
        }

        if (!updatedArticles.isEmpty()) {
            newsArticleRepository.saveAll(updatedArticles);
        }

        return updatedArticles.size();
    }

    public int recomputeSentimentForAllArticles() {
        List<NewsArticle> articles = newsArticleRepository.findAll();
        List<NewsArticle> updatedArticles = new ArrayList<>();

        for (NewsArticle article : articles) {
            SentimentType current = article.getSentiment();
            SentimentType recomputed;

            try {
                recomputed = sentimentAnalysisService.analyzeSentiment(article.getTitle(), article.getContent());
            } catch (Exception e) {
                log.warn("Skipping sentiment recompute for article: {}", article.getTitle(), e);
                continue;
            }

            if (recomputed == null) {
                recomputed = SentimentType.NEUTRAL;
            }

            boolean sentimentChanged = !Objects.equals(current, recomputed);
            boolean processedChanged = !Boolean.TRUE.equals(article.getProcessed());

            if (sentimentChanged || processedChanged) {
                article.setSentiment(recomputed);
                article.setProcessed(true);
                updatedArticles.add(article);
            }
        }

        if (!updatedArticles.isEmpty()) {
            newsArticleRepository.saveAll(updatedArticles);
        }

        return updatedArticles.size();
    }

    public int recomputeSummariesForAllArticles() {
        List<NewsArticle> articles = newsArticleRepository.findAll();
        List<NewsArticle> updatedArticles = new ArrayList<>();

        for (NewsArticle article : articles) {
            String currentSummary = article.getSummary();
            String recomputed;

            try {
                recomputed = summarizerService.summarizeArticle(article.getTitle(), article.getContent());
            } catch (Exception e) {
                log.warn("Skipping summary recompute for article: {}", article.getTitle(), e);
                continue;
            }

            if (!Objects.equals(currentSummary, recomputed)) {
                article.setSummary(recomputed);
                article.setProcessed(true);
                updatedArticles.add(article);
            }
        }

        if (!updatedArticles.isEmpty()) {
            newsArticleRepository.saveAll(updatedArticles);
        }

        return updatedArticles.size();
    }

    private SearchResponseDTO buildSearchResponse(Page<NewsArticle> articles, int page, int size) {
        List<NewsArticleDTO> dtos = articles.getContent().stream()
                .map(this::safeConvertToDTO)
                .collect(Collectors.toList());

        return SearchResponseDTO.builder()
                .articles(dtos)
                .totalElements(articles.getTotalElements())
                .totalPages(articles.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private NewsArticleDTO convertToDTO(NewsArticle article) {
        return NewsArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .sourceExcerpt(buildSourceExcerpt(article.getContent(), article.getTitle()))
                .summary(article.getSummary())
                .source(article.getSource())
                .url(article.getUrl())
                .imageUrl(article.getImageUrl())
                .category(article.getCategory())
                .sentiment(article.getSentiment())
                .publishedAt(article.getPublishedAt())
                .fetchedAt(article.getFetchedAt())
                .relevanceScore(article.getRelevanceScore())
                .processed(article.getProcessed())
                .build();
    }

    private NewsArticleDTO safeConvertToDTO(NewsArticle article) {
        try {
            return convertToDTO(article);
        } catch (Exception e) {
            log.warn("Failed to build full DTO for article id={}, returning minimal payload", article.getId(), e);
            return NewsArticleDTO.builder()
                    .id(article.getId())
                    .title(article.getTitle())
                    .content(article.getContent())
                    .summary(article.getSummary())
                    .source(article.getSource())
                    .url(article.getUrl())
                    .imageUrl(article.getImageUrl())
                    .category(article.getCategory())
                    .sentiment(article.getSentiment())
                    .publishedAt(article.getPublishedAt())
                    .fetchedAt(article.getFetchedAt())
                    .relevanceScore(article.getRelevanceScore())
                    .processed(article.getProcessed())
                    .build();
        }
    }

    private String buildCategorizationText(NewsArticle article) {
        String summary = article.getSummary() != null ? article.getSummary() : "";
        String content = article.getContent() != null ? article.getContent() : "";
        return (summary + " " + content).trim();
    }

    private String buildSourceExcerpt(String content, String title) {
        if (content == null || content.isBlank()) {
            return title;
        }

        String cleaned = content
                .replaceAll("(?im)^\\s*keywords:.*$", "")
                .replaceAll("(?im)^\\s*source link:.*$", "")
                .replaceAll("\\s+", " ")
                .trim();

        if (cleaned.isBlank()) {
            return title;
        }

        String[] sentences = SENTENCE_SPLIT.split(cleaned);
        if (sentences.length == 0) {
            return trimToExcerpt(cleaned);
        }

        List<SentenceScore> scored = new ArrayList<>();
        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (sentence.length() < 30) {
                continue;
            }
            scored.add(new SentenceScore(i, sentence, scoreExcerptSentence(sentence)));
        }

        if (scored.isEmpty()) {
            return trimToExcerpt(sentences[0].trim());
        }

        scored.sort(Comparator.comparingDouble(SentenceScore::score).reversed());
        List<SentenceScore> top = scored.stream().limit(3).toList();
        top.sort(Comparator.comparingInt(SentenceScore::index));

        String excerpt = top.stream()
                .map(SentenceScore::text)
                .collect(Collectors.joining(" "))
                .trim();

        if (excerpt.isBlank()) {
            excerpt = sentences[0].trim();
        }
        return trimToExcerpt(excerpt);
    }

    private double scoreExcerptSentence(String sentence) {
        double score = 1.0;
        if (sentence.matches(".*\\d+.*")) {
            score += 0.5;
        }
        if (sentence.matches(".*\\b[A-Z][a-z]+\\s+[A-Z][a-z]+.*")) {
            score += 0.2;
        }
        String lowered = sentence.toLowerCase();
        if (lowered.startsWith("headline:")) {
            score -= 0.6;
        }
        return score;
    }

    private String trimToExcerpt(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String cleaned = text.trim();
        return cleaned.length() > MAX_EXCERPT_CHARS
                ? cleaned.substring(0, MAX_EXCERPT_CHARS - 3).trim() + "..."
                : cleaned;
    }

    private record SentenceScore(int index, String text, double score) {
    }
}
