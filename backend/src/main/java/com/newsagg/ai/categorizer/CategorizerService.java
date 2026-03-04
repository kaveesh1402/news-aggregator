package com.newsagg.ai.categorizer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CategorizerService {
    
    private static final String[] CATEGORIES = {
        "LLM",
        "AI Startups",
        "Robotics",
        "AI Research",
        "AI Policy",
        "AI Tools",
        "General"
    };

    public String categorizeArticle(String title, String content) {
        try {
            return categorizeByKeyword(title, content);
        } catch (Exception e) {
            log.warn("Failed to categorize article", e);
            return "General";
        }
    }

    private String categorizeByKeyword(String title, String content) {
        String fullText = (title + " " + content).toLowerCase();
        
        if (fullText.contains("startup") || fullText.contains("founded") || fullText.contains("funding")) {
            return "AI Startups";
        } else if (fullText.contains("robot") || fullText.contains("automation")) {
            return "Robotics";
        } else if (fullText.contains("research") || fullText.contains("study") || fullText.contains("paper")) {
            return "AI Research";
        } else if (fullText.contains("regulation") || fullText.contains("policy") || fullText.contains("government")) {
            return "AI Policy";
        } else if (fullText.contains("tool") || fullText.contains("software") || fullText.contains("application")) {
            return "AI Tools";
        } else if (fullText.contains("llm") || fullText.contains("language model") || fullText.contains("gpt")) {
            return "LLM";
        }
        
        return "General";
    }
}
