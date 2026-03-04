package com.newsagg.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponseDTO {
    private List<NewsArticleDTO> articles;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}
