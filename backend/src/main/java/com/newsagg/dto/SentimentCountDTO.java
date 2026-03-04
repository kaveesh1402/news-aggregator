package com.newsagg.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentimentCountDTO {
    private String sentiment;
    private Long count;
}
