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
