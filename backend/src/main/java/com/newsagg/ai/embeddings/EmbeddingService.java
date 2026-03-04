package com.newsagg.ai.embeddings;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;

@Slf4j
@Service
public class EmbeddingService {
    
    private static final int EMBEDDING_DIMENSION = 384;

    public double[] generateEmbedding(String text) {
        return generateMockEmbedding(text);
    }

    public double cosineSimilarity(double[] embedding1, double[] embedding2) {
        if (embedding1 == null || embedding2 == null || embedding1.length != embedding2.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            normA += Math.pow(embedding1[i], 2);
            normB += Math.pow(embedding2[i], 2);
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private double[] generateMockEmbedding(String text) {
        double[] embedding = new double[EMBEDDING_DIMENSION];
        Random random = new Random(text.hashCode());
        
        for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
            embedding[i] = random.nextGaussian();
        }
        
        double norm = 0.0;
        for (double v : embedding) {
            norm += v * v;
        }
        norm = Math.sqrt(norm);
        
        for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
            embedding[i] /= norm;
        }
        
        return embedding;
    }

    public String serializeEmbedding(double[] embedding) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < embedding.length; i++) {
            sb.append(embedding[i]);
            if (i < embedding.length - 1) {
                sb.append(",");
            }
        }
        return sb.toString();
    }

    public double[] deserializeEmbedding(String embeddingStr) {
        if (embeddingStr == null || embeddingStr.isEmpty()) {
            return generateMockEmbedding("");
        }
        
        String[] parts = embeddingStr.split(",");
        double[] embedding = new double[parts.length];
        
        try {
            for (int i = 0; i < parts.length; i++) {
                embedding[i] = Double.parseDouble(parts[i].trim());
            }
        } catch (NumberFormatException e) {
            return generateMockEmbedding("");
        }
        
        return embedding;
    }
}
