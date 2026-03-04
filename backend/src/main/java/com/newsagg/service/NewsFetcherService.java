package com.newsagg.service;

import com.newsagg.config.NewsConfig;
import com.newsagg.entity.NewsArticle;
import com.newsagg.entity.SentimentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class NewsFetcherService {
    
    private final NewsConfig newsConfig;
    private final NewsArticleService newsArticleService;

    public NewsFetcherService(NewsConfig newsConfig, NewsArticleService newsArticleService) {
        this.newsConfig = newsConfig;
        this.newsArticleService = newsArticleService;
    }

    @Scheduled(fixedDelayString = "3600000")
    @Transactional
    public void fetchNewsFromRSSFeeds() {
        log.info("Starting scheduled news fetch");
        
        // Create some sample articles for testing
        createSampleArticles();
        
        processUnprocessedArticles();
        
        log.info("Completed scheduled news fetch");
    }

    @Transactional
    public void manualFetchNews() {
        log.info("Manual news fetch triggered");
        createSampleArticles();
        processUnprocessedArticles();
    }

    private void createSampleArticles() {
        String[] titles = {
            "GPT-4 Shows Breakthrough Performance in Complex Reasoning Tasks",
            "New AI Startup Raises $100M for Language Model Development",
            "Researchers Develop Advanced Robotics System Using Deep Learning",
            "EU Implements New AI Regulation Framework",
            "Open Source Tool Makes AI Development Accessible to Everyone"
        };
        
        String[] contents = {
            "OpenAI's latest GPT-4 model demonstrates unprecedented performance in complex reasoning and problem-solving tasks. The model shows significant improvements in code generation, mathematical reasoning, and cross-domain knowledge application.",
            "A new AI startup has successfully raised $100 million in Series B funding to develop next-generation language models. The company aims to create more efficient and practical AI solutions for enterprise applications.",
            "Researchers at leading universities have developed a new robotics system that leverages deep learning and computer vision to perform complex manipulation tasks with human-like precision and adaptability.",
            "The European Union has finalized its comprehensive AI regulation framework, setting new standards for AI safety, transparency, and accountability. Companies must comply with these regulations by the end of the year.",
            "A new open-source tool has been released that significantly lowers the barriers to entry for AI development. The tool abstracts complex machine learning concepts and provides user-friendly interfaces for model training and deployment."
        };
        
        String[] sources = {
            "TechCrunch AI",
            "The Verge AI",
            "Wired AI",
            "TechCrunch AI",
            "The Verge AI"
        };
        
        for (int i = 0; i < titles.length; i++) {
            NewsArticle article = NewsArticle.builder()
                    .title(titles[i])
                    .content(contents[i])
                    .url("https://example.com/article-" + i)
                    .source(sources[i])
                    .publishedAt(LocalDateTime.now().minusHours(i))
                    .sentiment(SentimentType.NEUTRAL)
                    .category("General")
                    .processed(false)
                    .build();
            
            try {
                newsArticleService.saveArticle(article);
            } catch (Exception e) {
                log.debug("Article already exists or error occurred", e);
            }
        }
    }

    private void processUnprocessedArticles() {
        List<NewsArticle> unprocessed = newsArticleService.getUnprocessedArticles();
        log.info("Processing {} unprocessed articles", unprocessed.size());
        
        for (NewsArticle article : unprocessed) {
            try {
                newsArticleService.processArticle(article);
            } catch (Exception e) {
                log.warn("Error processing article: {}", article.getTitle(), e);
            }
        }
    }
}
