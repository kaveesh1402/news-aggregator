package com.newsagg.ai.categorizer;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CategorizerServiceTest {

    private final CategorizerService categorizerService = new CategorizerService();

    @Test
    void shouldClassifyLlmArticles() {
        String category = categorizerService.categorizeArticle(
                "OpenAI releases new GPT model with longer context window",
                "The language model improves inference speed and token efficiency."
        );

        assertEquals("LLM", category);
    }

    @Test
    void shouldClassifyAiStartupArticles() {
        String category = categorizerService.categorizeArticle(
                "AI startup raises Series B funding",
                "The founder said the company secured venture capital for expansion."
        );

        assertEquals("AI Startups", category);
    }

    @Test
    void shouldClassifyRoboticsArticles() {
        String category = categorizerService.categorizeArticle(
                "Humanoid robot launches for warehouse automation",
                "The robotics platform uses AI for autonomous system navigation."
        );

        assertEquals("Robotics", category);
    }

    @Test
    void shouldClassifyAiResearchArticles() {
        String category = categorizerService.categorizeArticle(
                "New machine learning research paper improves benchmark scores",
                "Researchers released a dataset and evaluation details on arXiv."
        );

        assertEquals("AI Research", category);
    }

    @Test
    void shouldClassifyAiPolicyArticles() {
        String category = categorizerService.categorizeArticle(
                "EU lawmakers finalize AI regulation framework",
                "The policy adds compliance requirements for high-risk systems."
        );

        assertEquals("AI Policy", category);
    }

    @Test
    void shouldClassifyAiToolsArticles() {
        String category = categorizerService.categorizeArticle(
                "New AI coding assistant API launched for developers",
                "The software platform ships SDK integration for enterprise workflows."
        );

        assertEquals("AI Tools", category);
    }

    @Test
    void shouldFallbackToGeneralForNonAiArticles() {
        String category = categorizerService.categorizeArticle(
                "Finland considers lifting nuclear weapons ban",
                "Government discussions focus on wartime defense policy."
        );

        assertEquals("General", category);
    }
}
