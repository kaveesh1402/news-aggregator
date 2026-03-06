package com.newsagg.ai.categorizer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class CategorizerService {

    private static final String GENERAL = "General";
    private static final String LLM = "LLM";
    private static final String AI_STARTUPS = "AI Startups";
    private static final String ROBOTICS = "Robotics";
    private static final String AI_RESEARCH = "AI Research";
    private static final String AI_POLICY = "AI Policy";
    private static final String AI_TOOLS = "AI Tools";

    private static final List<String> AI_SIGNALS = List.of(
            "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
            "neural network", "generative ai", "genai", "openai", "anthropic",
            "deepmind", "chatgpt", "gpt", "llm", "language model", "gemini",
            "copilot", "claude", "mistral", "llama"
    );

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = buildCategoryKeywords();

    public String categorizeArticle(String title, String content) {
        try {
            return categorizeByKeyword(title, content);
        } catch (Exception e) {
            log.warn("Failed to categorize article", e);
            return GENERAL;
        }
    }

    private String categorizeByKeyword(String title, String content) {
        String normalizedTitle = normalize(title);
        String normalizedContent = normalize(content);

        int aiSignalScore = scoreMatches(normalizedTitle, normalizedContent, AI_SIGNALS, 3, 1);
        if (aiSignalScore == 0) {
            return GENERAL;
        }

        String bestCategory = GENERAL;
        int bestScore = 0;
        for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = scoreMatches(normalizedTitle, normalizedContent, entry.getValue(), 3, 1);
            if (score > bestScore) {
                bestScore = score;
                bestCategory = entry.getKey();
            }
        }

        if (bestScore > 0) {
            return bestCategory;
        }

        // Clear AI signal but no specific bucket matched.
        return AI_RESEARCH;
    }

    private int scoreMatches(
            String normalizedTitle,
            String normalizedContent,
            List<String> keywords,
            int titleWeight,
            int contentWeight) {
        int score = 0;
        for (String keyword : keywords) {
            if (normalizedTitle.contains(keyword)) {
                score += titleWeight;
            }
            if (normalizedContent.contains(keyword)) {
                score += contentWeight;
            }
        }
        return score;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase();
    }

    private static Map<String, List<String>> buildCategoryKeywords() {
        Map<String, List<String>> categoryKeywords = new LinkedHashMap<>();

        categoryKeywords.put(LLM, List.of(
                "llm", "large language model", "language model", "foundation model", "gpt",
                "chatgpt", "claude", "gemini", "llama", "mistral", "prompt", "token",
                "context window", "fine-tun", "inference model"
        ));

        categoryKeywords.put(AI_STARTUPS, List.of(
                "startup", "start-up", "funding", "seed round", "series a", "series b",
                "series c", "venture capital", "vc", "valuation", "raised", "acquisition",
                "merger", "ipo", "founder"
        ));

        categoryKeywords.put(ROBOTICS, List.of(
                "robot", "robotics", "humanoid", "automation", "cobot", "autonomous system",
                "drone", "warehouse robot", "self-driving", "autonomous vehicle", "industrial robot"
        ));

        categoryKeywords.put(AI_RESEARCH, List.of(
                "research", "study", "paper", "arxiv", "benchmark", "dataset", "experiment",
                "peer-reviewed", "state of the art", "sota", "evaluation", "model card"
        ));

        categoryKeywords.put(AI_POLICY, List.of(
                "regulation", "policy", "governance", "compliance", "eu ai act", "lawmakers",
                "legislation", "government", "ethics", "safety standard", "framework"
        ));

        categoryKeywords.put(AI_TOOLS, List.of(
                "tool", "software", "assistant", "platform", "copilot", "api", "sdk",
                "product launch", "feature release", "integration", "workflow", "plugin"
        ));

        return categoryKeywords;
    }
}
