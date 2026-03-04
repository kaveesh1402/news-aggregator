package com.newsagg.ai.summarizer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SummarizerService {

    public String summarizeArticle(String title, String content) {
        try {
            String truncatedContent = content.length() > 2000 ? 
                content.substring(0, 2000) + "..." : content;
            
            // Fallback: use first 200 characters + ellipsis
            int summaryLength = Math.min(truncatedContent.length(), 200);
            return truncatedContent.substring(0, summaryLength) + "...";
        } catch (Exception e) {
            log.warn("Failed to generate summary", e);
            return "Unable to generate summary";
        }
    }
}
