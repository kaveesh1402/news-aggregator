package com.newsagg.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.*;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "news")
@Getter
@Setter
public class NewsConfig {
    private Integer fetchIntervalHours;
    private Integer maxArticlesPerFetch;
    private List<RssFeed> rssFeeds;
    private Api api;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RssFeed {
        private String name;
        private String url;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Api {
        private String provider;
        private String baseUrl;
        private String token;
        private String locale;
        private String language;
        private String categories;
        private Integer pagesToFetch;
    }
}
