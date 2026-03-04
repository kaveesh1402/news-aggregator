#!/bin/bash

# AI News Aggregator - Complete Implementation Script
# This script generates all remaining source files needed for the project

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🚀 Generating complete AI News Aggregator implementation..."
echo "📁 Working directory: $PROJECT_DIR"
echo ""

# Create all necessary directories
echo "📂 Creating directory structure..."
mkdir -p "$PROJECT_DIR/backend/src/main/java/com/newsagg/{controller,service,entity,repository,ai/{summarizer,sentiment,categorizer,embeddings},dto,config}"
mkdir -p "$PROJECT_DIR/backend/src/main/resources"
mkdir -p "$PROJECT_DIR/backend/src/test/java/com/newsagg"
mkdir -p "$PROJECT_DIR/frontend/src/{components,pages,api}"
mkdir -p "$PROJECT_DIR/.github/workflows"

echo "✅ Directories created"
echo ""

# Backend controller files
echo "📝 Generating backend controllers..."

# NewsController
cat > "$PROJECT_DIR/backend/src/main/java/com/newsagg/controller/NewsController.java" << 'CONTROLLER'
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
        } catch (RuntimeException e) {
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
CONTROLLER

echo "✅ NewsController created"

# Repository files
echo "📝 Generating repositories..."

cat > "$PROJECT_DIR/backend/src/main/java/com/newsagg/repository/NewsArticleRepository.java" << 'REPO'
package com.newsagg.repository;

import com.newsagg.entity.NewsArticle;
import com.newsagg.entity.SentimentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {
    
    Optional<NewsArticle> findByUrl(String url);
    
    Page<NewsArticle> findByCategory(String category, Pageable pageable);
    
    Page<NewsArticle> findBySentiment(SentimentType sentiment, Pageable pageable);
    
    @Query("SELECT a FROM NewsArticle a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<NewsArticle> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT a FROM NewsArticle a WHERE a.publishedAt >= :startDate ORDER BY a.publishedAt DESC")
    List<NewsArticle> findRecentArticles(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT a FROM NewsArticle a WHERE a.processed = false ORDER BY a.fetchedAt ASC")
    List<NewsArticle> findUnprocessedArticles();
    
    @Query("SELECT a.category, COUNT(a) FROM NewsArticle a GROUP BY a.category")
    List<Object[]> getCategoryCounts();
    
    @Query("SELECT a.sentiment, COUNT(a) FROM NewsArticle a GROUP BY a.sentiment")
    List<Object[]> getSentimentCounts();
    
    Long countByProcessedFalse();
    
    Long countByCategory(String category);
}
REPO

echo "✅ NewsArticleRepository created"

# Configuration files
echo "📝 Generating configuration files..."

cat > "$PROJECT_DIR/backend/src/main/java/com/newsagg/config/WebConfig.java" << 'CONFIG
