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
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class NewsArticleService {

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
                .map(this::convertToDTO)
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
        List<NewsArticleDTO> dtos = pagedArticles.stream().map(this::convertToDTO).collect(Collectors.toList());

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

        List<NewsArticleDTO> dtos = recommendations.stream().map(this::convertToDTO).collect(Collectors.toList());

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
            String summary = summarizerService.summarizeArticle(article.getTitle(), article.getContent());
            article.setSummary(summary);

            SentimentType sentiment = sentimentAnalysisService.analyzeSentiment(article.getTitle(),
                    article.getContent());
            article.setSentiment(sentiment);

            String category = categorizerService.categorizeArticle(article.getTitle(), article.getContent());
            article.setCategory(category);

            String fullText = article.getTitle() + " " + article.getSummary();
            double[] articleEmbedding = embeddingService.generateEmbedding(fullText);
            article.setEmbedding(embeddingService.serializeEmbedding(articleEmbedding));

            article.setProcessed(true);
            newsArticleRepository.save(article);

            return convertToDTO(article);
        } catch (Exception e) {
            log.error("Error processing article: {}", article.getTitle(), e);
            article.setProcessed(true);
            newsArticleRepository.save(article);
            return convertToDTO(article);
        }
    }

    public void saveArticle(NewsArticle article) {
        newsArticleRepository.save(article);
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

        return InsightsDTO.builder()
                .totalArticles(total)
                .processedArticles(processed)
                .unprocessedArticles(unprocessed)
                .categoryCounts(categoryList)
                .sentimentCounts(sentimentList)
                .topCategory(topCategory)
                .dominantSentiment(dominantSentiment)
                .build();
    }

    public void deleteArticle(Long id) {
        newsArticleRepository.deleteById(id);
    }

    private SearchResponseDTO buildSearchResponse(Page<NewsArticle> articles, int page, int size) {
        List<NewsArticleDTO> dtos = articles.getContent().stream()
                .map(this::convertToDTO)
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
                .summary(article.getSummary())
                .source(article.getSource())
                .url(article.getUrl())
                .category(article.getCategory())
                .sentiment(article.getSentiment())
                .publishedAt(article.getPublishedAt())
                .fetchedAt(article.getFetchedAt())
                .relevanceScore(article.getRelevanceScore())
                .processed(article.getProcessed())
                .build();
    }
}