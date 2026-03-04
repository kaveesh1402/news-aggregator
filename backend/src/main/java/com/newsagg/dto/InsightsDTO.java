package com.newsagg.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightsDTO {
    private Long totalArticles;
    private Long processedArticles;
    private Long unprocessedArticles;
    private List<CategoryCountDTO> categoryCounts;
    private List<SentimentCountDTO> sentimentCounts;
    private String topCategory;
    private String dominantSentiment;
}
