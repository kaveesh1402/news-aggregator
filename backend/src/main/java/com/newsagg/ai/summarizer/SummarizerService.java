package com.newsagg.ai.summarizer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsagg.config.OllamaConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
public class SummarizerService {

    private static final int MAX_INPUT_CHARS = 5000;
    private static final int MAX_SUMMARY_CHARS = 420;
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");
    private static final Pattern VAGUE_SUMMARY_PATTERN = Pattern.compile(
            "\\b(the article|this article|the piece|this piece|in summary|overall|various|several|"
                    + "recent developments|it discusses|it highlights|it covers)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Set<String> STOPWORDS = Set.of(
            "the", "and", "for", "that", "with", "from", "this", "have", "has", "were", "was", "are", "their",
            "about", "into", "after", "before", "over", "under", "while", "than", "also", "but", "not", "they",
            "them", "been", "being", "will", "would", "could", "should", "your", "you", "our", "its", "his", "her");

    private final RestTemplate restTemplate;
    private final OllamaConfig ollamaConfig;
    private final ObjectMapper objectMapper;

    public SummarizerService(RestTemplate restTemplate, OllamaConfig ollamaConfig, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.ollamaConfig = ollamaConfig;
        this.objectMapper = objectMapper;
    }

    public String summarizeArticle(String title, String content) {
        String safeTitle = StringUtils.hasText(title) ? title.trim() : "Untitled";
        String safeContent = StringUtils.hasText(content) ? content.trim() : "";
        try {
            String normalizedContent = sanitizeContentForSummary(safeContent);
            String clippedContent = normalizedContent.length() > MAX_INPUT_CHARS
                    ? normalizedContent.substring(0, MAX_INPUT_CHARS)
                    : normalizedContent;

            String llmSummary = generateLlmSummary(safeTitle, clippedContent);
            if (StringUtils.hasText(llmSummary)) {
                return llmSummary;
            }

            String extractive = generateExtractiveSummary(safeTitle, clippedContent);
            return StringUtils.hasText(extractive) ? extractive : safeTitle;
        } catch (Exception e) {
            log.warn("Failed to generate summary", e);
            String fallback = generateExtractiveSummary(safeTitle, safeContent);
            return StringUtils.hasText(fallback) ? fallback : safeTitle;
        }
    }

    private String generateLlmSummary(String title, String content) {
        try {
            String prompt = """
                    You are a precise news editor.
                    Write exactly 2 factual sentences.
                    Rules:
                    - Stay factual and neutral.
                    - Include named entities, concrete actions, and outcomes.
                    - Include at least one concrete detail (number, percentage, date, amount, or location) if present.
                    - Do not use generic phrases like "the article discusses" or "this piece highlights".
                    - No bullet points, no markdown, no intro text.
                    - Target 55-90 words.

                    Title: %s
                    Content: %s
                    """.formatted(title, content);

            Map<String, Object> body = new HashMap<>();
            body.put("model", ollamaConfig.getModel());
            body.put("prompt", prompt);
            body.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String response = restTemplate.postForObject(
                    ollamaConfig.getApiUrl() + "/api/generate",
                    new HttpEntity<>(body, headers),
                    String.class);

            if (!StringUtils.hasText(response)) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response);
            String summary = root.path("response").asText(null);
            String normalized = normalizeSummary(summary);
            return isVagueSummary(normalized) ? null : normalized;
        } catch (Exception e) {
            log.debug("Ollama summary failed, fallback to extractive summary", e);
            return null;
        }
    }

    private String generateExtractiveSummary(String title, String content) {
        if (!StringUtils.hasText(content)) {
            return title;
        }

        String[] sentences = SENTENCE_SPLIT.split(content.replaceAll("\\s+", " ").trim());
        if (sentences.length == 0) {
            return trimToMax(content);
        }

        Map<String, Integer> frequency = buildWordFrequency(content);
        List<SentenceScore> scored = new ArrayList<>();

        for (int i = 0; i < sentences.length; i++) {
            String sentence = sentences[i].trim();
            if (!StringUtils.hasText(sentence)) {
                continue;
            }
            double score = scoreSentence(sentence, frequency);
            scored.add(new SentenceScore(i, sentence, score));
        }

        scored.sort(Comparator.comparingDouble(SentenceScore::score).reversed());
        List<SentenceScore> top = scored.stream().limit(3).toList();
        top.sort(Comparator.comparingInt(SentenceScore::index));

        StringBuilder summary = new StringBuilder();
        for (SentenceScore s : top) {
            if (summary.length() > 0) {
                summary.append(" ");
            }
            summary.append(s.text());
        }

        String merged = summary.toString().trim();
        if (!StringUtils.hasText(merged)) {
            merged = sentences[0].trim();
        }
        return isVagueSummary(merged) ? trimToMax(sentences[0].trim()) : trimToMax(merged);
    }

    private Map<String, Integer> buildWordFrequency(String content) {
        Map<String, Integer> frequency = new HashMap<>();
        for (String token : content.toLowerCase().split("[^a-z0-9]+")) {
            if (token.length() < 4) {
                continue;
            }
            frequency.put(token, frequency.getOrDefault(token, 0) + 1);
        }
        return frequency;
    }

    private double scoreSentence(String sentence, Map<String, Integer> frequency) {
        double score = 0.0;
        int terms = 0;
        for (String token : sentence.toLowerCase().split("[^a-z0-9]+")) {
            if (token.length() < 4) {
                continue;
            }
            score += frequency.getOrDefault(token, 0);
            terms++;
        }

        if (terms == 0) {
            return 0.0;
        }

        double normalized = score / terms;
        if (sentence.matches(".*\\d+.*")) {
            normalized += 0.45;
        }
        if (sentence.matches(".*\\b[A-Z][a-z]+\\s+[A-Z][a-z]+.*")) {
            normalized += 0.2;
        }

        String lowered = sentence.toLowerCase();
        if (lowered.startsWith("keywords:") || lowered.startsWith("source link:") || lowered.startsWith("headline:")) {
            normalized -= 0.75;
        }

        return normalized;
    }

    private String normalizeSummary(String summary) {
        if (!StringUtils.hasText(summary)) {
            return null;
        }

        String cleaned = summary
                .replaceAll("\\s+", " ")
                .replaceAll("^[-*\\s]+", "")
                .trim();

        if (!StringUtils.hasText(cleaned)) {
            return null;
        }
        return trimToMax(cleaned);
    }

    private String sanitizeContentForSummary(String content) {
        if (!StringUtils.hasText(content)) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        for (String line : content.split("\\R+")) {
            String cleaned = line == null ? "" : line.trim();
            if (!StringUtils.hasText(cleaned)) {
                continue;
            }
            String lower = cleaned.toLowerCase();
            if (lower.startsWith("keywords:") || lower.startsWith("source link:")) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(cleaned);
        }

        return builder.toString().replaceAll("\\s+", " ").trim();
    }

    private boolean isVagueSummary(String summary) {
        if (!StringUtils.hasText(summary)) {
            return true;
        }

        String normalized = summary.trim();
        if (VAGUE_SUMMARY_PATTERN.matcher(normalized).find()) {
            return true;
        }

        Set<String> tokens = new HashSet<>();
        for (String token : normalized.toLowerCase().split("[^a-z0-9]+")) {
            if (token.length() < 4 || STOPWORDS.contains(token)) {
                continue;
            }
            tokens.add(token);
        }

        boolean hasConcreteDetail = normalized.matches(".*\\d+.*")
                || normalized.matches(".*\\b(USD|EUR|INR|GBP|%|million|billion|trillion)\\b.*");
        return tokens.size() < 8 && !hasConcreteDetail;
    }

    private String trimToMax(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String cleaned = text.trim();
        return cleaned.length() > MAX_SUMMARY_CHARS
                ? cleaned.substring(0, MAX_SUMMARY_CHARS - 3).trim() + "..."
                : cleaned;
    }

    private record SentenceScore(int index, String text, double score) {
    }
}
