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
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
public class SummarizerService {

    private static final int MAX_INPUT_CHARS = 4000;
    private static final int MAX_SUMMARY_CHARS = 420;
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+");

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
            String clippedContent = safeContent.length() > MAX_INPUT_CHARS
                    ? safeContent.substring(0, MAX_INPUT_CHARS)
                    : safeContent;

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
                    You are a news summarizer.
                    Summarize the article below in 2-3 concise sentences.
                    Rules:
                    - Stay factual and neutral.
                    - Include key entities and outcomes.
                    - No bullet points, no markdown, no intro text.
                    - Max 70 words.

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
            return normalizeSummary(summary);
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
        List<SentenceScore> top = scored.stream().limit(2).toList();
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
        return trimToMax(merged);
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
            normalized += 0.3;
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
