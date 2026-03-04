package com.newsagg.controller;

import com.newsagg.dto.NewsArticleDTO;
import com.newsagg.dto.SearchResponseDTO;
import com.newsagg.service.NewsArticleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewsController {
    
    private final NewsArticleService newsArticleService;

    public NewsController(NewsArticleService newsArticleService) {
        this.newsArticleService = newsArticleService;
    }

    @GetMapping
    public ResponseEntity<SearchResponseDTO> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SearchResponseDTO response = newsArticleService.getAllArticles(page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching articles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsArticleDTO> getArticleById(@PathVariable Long id) {
        try {
            NewsArticleDTO article = newsArticleService.getArticleById(id);
            return ResponseEntity.ok(article);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<SearchResponseDTO> searchArticles(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SearchResponseDTO response = newsArticleService.searchArticles(q, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching articles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/semantic-search")
    public ResponseEntity<SearchResponseDTO> semanticSearch(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SearchResponseDTO response = newsArticleService.semanticSearch(query, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error performing semantic search", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<SearchResponseDTO> getArticlesByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SearchResponseDTO response = newsArticleService.getArticlesByCategory(category, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching articles by category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sentiment/{sentiment}")
    public ResponseEntity<SearchResponseDTO> getArticlesBySentiment(
            @PathVariable String sentiment,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SearchResponseDTO response = newsArticleService.getArticlesBySentiment(sentiment, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching articles by sentiment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<SearchResponseDTO> getRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int size) {
        try {
            SearchResponseDTO response = newsArticleService.getRecommendations(id, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching recommendations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        try {
            newsArticleService.deleteArticle(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting article", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
