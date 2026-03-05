package com.newsagg.service;

import com.newsagg.config.NewsConfig;
import com.newsagg.entity.NewsArticle;
import com.newsagg.entity.SentimentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.time.OffsetDateTime;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class NewsFetcherService {
    
    private final NewsConfig newsConfig;
    private final NewsArticleService newsArticleService;
    private final RestTemplate restTemplate;

    public NewsFetcherService(
            NewsConfig newsConfig,
            NewsArticleService newsArticleService,
            RestTemplate restTemplate) {
        this.newsConfig = newsConfig;
        this.newsArticleService = newsArticleService;
        this.restTemplate = restTemplate;
    }

    @Scheduled(fixedDelayString = "3600000")
    public void fetchNewsFromRSSFeeds() {
        log.info("Starting scheduled news fetch");

        fetchFromConfiguredApi();
        processUnprocessedArticles();
        
        log.info("Completed scheduled news fetch");
    }

    public void manualFetchNews() {
        log.info("Manual news fetch triggered");
        fetchFromConfiguredApi();
        processUnprocessedArticles();
    }

    private void fetchFromConfiguredApi() {
        NewsConfig.Api api = newsConfig.getApi();
        if (api == null || !StringUtils.hasText(api.getProvider())) {
            log.warn("No news API provider configured. Skipping external fetch.");
            return;
        }

        if ("thenewsapi".equalsIgnoreCase(api.getProvider())) {
            fetchFromTheNewsApi(api);
            return;
        }

        log.warn("Unsupported news API provider '{}'. Skipping external fetch.", api.getProvider());
    }

    private void fetchFromTheNewsApi(NewsConfig.Api api) {
        if (!StringUtils.hasText(api.getToken())) {
            log.warn("THENEWSAPI token missing. Set THENEWSAPI_TOKEN to enable real news ingestion.");
            return;
        }

        try {
            int inserted = 0;
            int pagesToFetch = valueOrDefault(api.getPagesToFetch(), 3);

            for (int page = 1; page <= pagesToFetch; page++) {
                URI uri = UriComponentsBuilder
                        .fromUriString(api.getBaseUrl())
                        .queryParam("api_token", api.getToken())
                        .queryParam("locale", valueOrDefault(api.getLocale(), "us"))
                        .queryParam("language", valueOrDefault(api.getLanguage(), "en"))
                        .queryParam("categories", valueOrDefault(api.getCategories(), "tech"))
                        .queryParam("limit", valueOrDefault(newsConfig.getMaxArticlesPerFetch(), 20))
                        .queryParam("page", page)
                        .build(true)
                        .toUri();

                ResponseEntity<JsonNode> response = restTemplate.getForEntity(uri, JsonNode.class);
                JsonNode body = response.getBody();
                JsonNode data = body != null ? body.path("data") : null;

                if (data == null || !data.isArray() || data.isEmpty()) {
                    log.info("No more data from TheNewsAPI at page {}", page);
                    break;
                }

                for (JsonNode item : data) {
                    String url = textOrNull(item, "url");
                    if (!StringUtils.hasText(url) || newsArticleService.articleExistsByUrl(url)) {
                        continue;
                    }

                    String title = valueOrDefault(textOrNull(item, "title"), "Untitled");
                    String content = buildContent(item, title, url);
                    String source = extractSource(item);
                    String category = extractCategory(item);
                    String imageUrl = firstNonBlank(
                            textOrNull(item, "image_url"),
                            textOrNull(item, "imageUrl"));

                    NewsArticle article = NewsArticle.builder()
                            .title(title)
                            .content(content)
                            .url(url)
                            .source(valueOrDefault(source, "TheNewsAPI"))
                            .imageUrl(imageUrl)
                            .publishedAt(parsePublishedAt(textOrNull(item, "published_at")))
                            .sentiment(SentimentType.NEUTRAL)
                            .category(valueOrDefault(category, "General"))
                            .processed(false)
                            .build();

                    try {
                        newsArticleService.saveArticle(article);
                        inserted++;
                    } catch (Exception e) {
                        log.warn("Skipping article due to save failure. url={}", url, e);
                    }
                }
            }

            log.info("Fetched {} new articles from TheNewsAPI across {} pages", inserted, pagesToFetch);
        } catch (Exception e) {
            log.error("Failed to fetch articles from TheNewsAPI", e);
        }
    }

    private String extractSource(JsonNode item) {
        if (item == null) {
            return null;
        }
        JsonNode sourceNode = item.path("source");
        if (sourceNode.isTextual()) {
            return sourceNode.asText();
        }
        if (sourceNode.isObject()) {
            String sourceName = textOrNull(sourceNode, "name");
            if (StringUtils.hasText(sourceName)) {
                return sourceName;
            }
        }
        return textOrNull(item, "source_name");
    }

    private String extractCategory(JsonNode item) {
        if (item == null) {
            return null;
        }
        JsonNode categories = item.path("categories");
        if (categories.isArray() && !categories.isEmpty()) {
            return categories.get(0).asText();
        }
        return textOrNull(item, "category");
    }

    private LocalDateTime parsePublishedAt(String publishedAt) {
        if (!StringUtils.hasText(publishedAt)) {
            return LocalDateTime.now();
        }

        try {
            return OffsetDateTime.parse(publishedAt).toLocalDateTime();
        } catch (Exception ignored) {
            try {
                return LocalDateTime.parse(publishedAt);
            } catch (Exception ignoredAgain) {
                return LocalDateTime.now();
            }
        }
    }

    private String textOrNull(JsonNode node, String field) {
        if (node == null || !node.hasNonNull(field)) {
            return null;
        }
        String value = node.get(field).asText();
        return StringUtils.hasText(value) ? value : null;
    }

    private String buildContent(JsonNode item, String title, String url) {
        String description = textOrNull(item, "description");
        String snippet = textOrNull(item, "snippet");
        String keyword = textOrNull(item, "keywords");

        StringBuilder content = new StringBuilder();
        appendParagraph(content, description);
        appendParagraph(content, snippet);

        if (StringUtils.hasText(keyword)) {
            appendParagraph(content, "Keywords: " + keyword);
        }

        if (content.length() < 180) {
            appendParagraph(content, "Headline: " + valueOrDefault(title, "Untitled"));
            appendParagraph(content, "Source link: " + valueOrDefault(url, ""));
        }

        if (!StringUtils.hasText(content.toString())) {
            return "No content available.";
        }

        return content.toString().trim();
    }

    private void appendParagraph(StringBuilder builder, String paragraph) {
        if (!StringUtils.hasText(paragraph)) {
            return;
        }

        String cleaned = normalizeSnippet(paragraph);
        if (!StringUtils.hasText(cleaned)) {
            return;
        }

        String builderText = builder.toString().toLowerCase();
        String cleanedLower = cleaned.toLowerCase();
        if (builderText.contains(cleanedLower) || (builder.length() > 0 && cleanedLower.contains(builderText))) {
            return;
        }

        if (builder.length() > 0) {
            builder.append("\n\n");
        }
        builder.append(cleaned);
    }

    private String normalizeSnippet(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }

        String cleaned = raw.replaceAll("\\s+", " ").trim();
        if (!StringUtils.hasText(cleaned)) {
            return null;
        }

        // Avoid abrupt endings by trimming to the last complete sentence if available.
        int lastStop = Math.max(cleaned.lastIndexOf('.'),
                Math.max(cleaned.lastIndexOf('!'), cleaned.lastIndexOf('?')));

        if (cleaned.endsWith("...") || cleaned.endsWith("..")) {
            if (lastStop > 20 && lastStop < cleaned.length() - 1) {
                cleaned = cleaned.substring(0, lastStop + 1).trim();
            }
        }

        if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
            cleaned = cleaned + ".";
        }

        return cleaned;
    }

    private String valueOrDefault(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private int valueOrDefault(Integer value, int fallback) {
        return value != null ? value : fallback;
    }

    private void processUnprocessedArticles() {
        List<NewsArticle> unprocessed = newsArticleService.getUnprocessedArticles();
        log.info("Processing {} unprocessed articles", unprocessed.size());
        
        for (NewsArticle article : unprocessed) {
            try {
                newsArticleService.processArticle(article);
            } catch (Exception e) {
                log.warn("Error processing article: {}", article.getTitle(), e);
            }
        }
    }
}
