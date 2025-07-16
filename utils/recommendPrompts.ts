/**
 * TypeScript interfaces for prompt recommendation system
 * 
 * This file defines the shared type definitions used across the application
 * for handling prompt recommendations with similarity scores and explanations.
 */

export interface PromptRecommendation {
  prompt: string;
  similarity: number;
  explanation: string;
}

