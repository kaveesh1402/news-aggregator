package com.newsagg.ai.sentiment;

import com.newsagg.entity.SentimentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SentimentAnalysisService {

    public SentimentType analyzeSentiment(String title, String content) {
        try {
            String fullText = (title + " " + content).toLowerCase();
            
            int positiveCount = countOccurrences(fullText, new String[]{"positive", "good", "excellent", "great", "amazing", "breakthrough", "success"});
            int negativeCount = countOccurrences(fullText, new String[]{"negative", "bad", "poor", "worse", "decline", "failure", "concerned", "risk"});
            
            if (positiveCount > negativeCount) {
                return SentimentType.POSITIVE;
            } else if (negativeCount > positiveCount) {
                return SentimentType.NEGATIVE;
            }
            
            return SentimentType.NEUTRAL;
        } catch (Exception e) {
            log.warn("Failed to analyze sentiment", e);
            return SentimentType.NEUTRAL;
        }
    }

    private int countOccurrences(String text, String[] keywords) {
        int count = 0;
        for (String keyword : keywords) {
            count += (text.split(keyword, -1).length - 1);
        }
        return count;
    }
}
