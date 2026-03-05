package com.newsagg.ai.sentiment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newsagg.config.OllamaConfig;
import com.newsagg.entity.SentimentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
public class SentimentAnalysisService {

    private static final int MAX_INPUT_CHARS = 3500;

    private static final Map<String, Integer> POSITIVE_LEXICON = Map.ofEntries(
            Map.entry("breakthrough", 3), Map.entry("surge", 2), Map.entry("improve", 2),
            Map.entry("growth", 2), Map.entry("gains", 2), Map.entry("successful", 3),
            Map.entry("record", 2), Map.entry("optimistic", 2), Map.entry("accelerate", 2),
            Map.entry("strong", 2), Map.entry("innovation", 1), Map.entry("win", 2)
    );
    private static final Map<String, Integer> NEGATIVE_LEXICON = Map.ofEntries(
            Map.entry("risk", 2), Map.entry("concern", 2), Map.entry("decline", 3),
            Map.entry("drop", 2), Map.entry("loss", 3), Map.entry("fail", 3),
            Map.entry("lawsuit", 2), Map.entry("ban", 2), Map.entry("delay", 2),
            Map.entry("crisis", 3), Map.entry("threat", 2), Map.entry("warning", 2)
    );
    private static final Set<String> NEGATIONS = Set.of("not", "never", "no", "without", "hardly");

    private final RestTemplate restTemplate;
    private final OllamaConfig ollamaConfig;
    private final ObjectMapper objectMapper;

    public SentimentAnalysisService(RestTemplate restTemplate, OllamaConfig ollamaConfig, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.ollamaConfig = ollamaConfig;
        this.objectMapper = objectMapper;
    }

    public SentimentType analyzeSentiment(String title, String content) {
        try {
            String safeTitle = StringUtils.hasText(title) ? title.trim() : "";
            String safeContent = StringUtils.hasText(content) ? content.trim() : "";
            String fullText = (safeTitle + " " + safeContent).trim();

            SentimentType llmSentiment = classifyWithLlm(safeTitle, truncate(fullText, MAX_INPUT_CHARS));
            if (llmSentiment != null) {
                return llmSentiment;
            }

            return classifyWithLexicon(fullText.toLowerCase());
        } catch (Exception e) {
            log.warn("Failed to analyze sentiment", e);
            return SentimentType.NEUTRAL;
        }
    }

    private SentimentType classifyWithLlm(String title, String content) {
        try {
            String prompt = """
                    You are classifying sentiment in a news article.
                    Return exactly one label: POSITIVE, NEUTRAL, or NEGATIVE.
                    Use NEUTRAL unless the article has clearly positive or clearly negative tone.

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
            String label = root.path("response").asText("").toUpperCase();
            if (label.contains("POSITIVE")) {
                return SentimentType.POSITIVE;
            }
            if (label.contains("NEGATIVE")) {
                return SentimentType.NEGATIVE;
            }
            if (label.contains("NEUTRAL")) {
                return SentimentType.NEUTRAL;
            }
            return null;
        } catch (Exception e) {
            log.debug("Ollama sentiment failed, fallback to lexicon model", e);
            return null;
        }
    }

    private SentimentType classifyWithLexicon(String text) {
        if (!StringUtils.hasText(text)) {
            return SentimentType.NEUTRAL;
        }

        String[] tokens = text.split("[^a-z0-9]+");
        int positiveScore = 0;
        int negativeScore = 0;

        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (!StringUtils.hasText(token)) {
                continue;
            }

            boolean negated = i > 0 && NEGATIONS.contains(tokens[i - 1]);
            Integer pos = POSITIVE_LEXICON.get(token);
            Integer neg = NEGATIVE_LEXICON.get(token);

            if (pos != null) {
                if (negated) {
                    negativeScore += Math.max(1, pos - 1);
                } else {
                    positiveScore += pos;
                }
            }
            if (neg != null) {
                if (negated) {
                    positiveScore += Math.max(1, neg - 1);
                } else {
                    negativeScore += neg;
                }
            }
        }

        int delta = positiveScore - negativeScore;
        if (delta >= 3 && positiveScore >= 3) {
            return SentimentType.POSITIVE;
        }
        if (delta <= -3 && negativeScore >= 3) {
            return SentimentType.NEGATIVE;
        }
        return SentimentType.NEUTRAL;
    }

    private String truncate(String text, int maxChars) {
        if (!StringUtils.hasText(text) || text.length() <= maxChars) {
            return text;
        }
        return text.substring(0, maxChars);
    }
}
