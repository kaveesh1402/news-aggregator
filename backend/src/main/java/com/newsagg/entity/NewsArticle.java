package com.newsagg.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(columnDefinition = "LONGTEXT")
    private String summary;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SentimentType sentiment;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private LocalDateTime publishedAt;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    @Column(columnDefinition = "LONGTEXT")
    private String embedding;

    @Column(name = "embedding_id")
    private String embeddingId;

    @Column(nullable = false)
    private Boolean processed = false;

    @Column
    private Double relevanceScore;

    @PrePersist
    protected void onCreate() {
        if (fetchedAt == null) {
            fetchedAt = LocalDateTime.now();
        }
    }
}
