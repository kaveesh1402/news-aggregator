package com.newsagg.entity;

public enum SentimentType {
    POSITIVE("Positive"),
    NEUTRAL("Neutral"),
    NEGATIVE("Negative");

    private final String displayName;

    SentimentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
