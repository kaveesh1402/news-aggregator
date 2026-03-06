package com.newsagg.controller;

import com.newsagg.dto.InsightsDTO;
import com.newsagg.service.NewsArticleService;
import com.newsagg.service.NewsFetcherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
public class InsightsController {
    
    private final NewsArticleService newsArticleService;
    private final NewsFetcherService newsFetcherService;

    public InsightsController(NewsArticleService newsArticleService, NewsFetcherService newsFetcherService) {
        this.newsArticleService = newsArticleService;
        this.newsFetcherService = newsFetcherService;
    }

    @GetMapping("/insights")
    public ResponseEntity<InsightsDTO> getInsights() {
        try {
            InsightsDTO insights = newsArticleService.getInsights();
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            log.error("Error fetching insights", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/fetch-news")
    public ResponseEntity<String> triggerNewsFetch() {
        try {
            newsFetcherService.manualFetchNews();
            return ResponseEntity.ok("News fetch triggered successfully");
        } catch (Exception e) {
            log.error("Error triggering news fetch", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error triggering news fetch: " + e.getMessage());
        }
    }

    @PostMapping("/recategorize")
    public ResponseEntity<String> recategorizeArticles() {
        try {
            int updated = newsArticleService.recategorizeAllArticles();
            return ResponseEntity.ok("Recategorization completed. Updated articles: " + updated);
        } catch (Exception e) {
            log.error("Error recategorizing articles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error recategorizing articles: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("News Aggregator API is running");
    }
}
