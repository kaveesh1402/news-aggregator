package com.newsagg.dto;

import com.newsagg.entity.SentimentType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsArticleDTO {
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String category;
    private SentimentType sentiment;
    private String url;
    private String source;
    private String imageUrl;
    private LocalDateTime publishedAt;
    private LocalDateTime fetchedAt;
    private Double relevanceScore;
    private Boolean processed;
}
