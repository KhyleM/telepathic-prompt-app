/**
 * Recommendation API Route
 * 
 * This API endpoint generates personalized prompt recommendations using OpenAI embeddings
 * and semantic similarity. It compares a user's domain against a curated list of high-potential
 * prompts, returns the top 5 matches, and generates custom explanations for each.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { recommendationsService, RecommendationInsert } from '../../../lib/supabase';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Curated list of 100 high-potential prompts covering various business domains
 * These prompts are used as candidates for recommendation to users
 */
const HIGH_POTENTIAL_PROMPTS = [
  "Best practices for user experience design",
  "How to optimize website performance",
  "Effective content marketing strategies",
  "Mobile-first design principles",
  "SEO optimization techniques",
  "Customer retention strategies",
  "A/B testing methodologies",
  "Conversion rate optimization",
  "Social media engagement tactics",
  "Email marketing best practices",
  "Data analytics and insights",
  "Brand identity development",
  "User interface design trends",
  "Customer feedback collection methods",
  "Product launch strategies",
  "Digital marketing automation",
  "Website accessibility standards",
  "E-commerce optimization",
  "Content creation workflows",
  "Lead generation techniques",
  "Customer journey mapping",
  "Competitive analysis methods",
  "Growth hacking strategies",
  "User onboarding optimization",
  "Cross-platform integration",
  "Performance monitoring tools",
  "Security best practices",
  "API design principles",
  "Database optimization",
  "Cloud infrastructure setup",
  "DevOps implementation",
  "Agile development methodologies",
  "Code review processes",
  "Testing automation strategies",
  "Documentation best practices",
  "Team collaboration tools",
  "Project management techniques",
  "Quality assurance processes",
  "Continuous integration setup",
  "Deployment strategies",
  "Monitoring and alerting",
  "Scalability planning",
  "Backup and recovery",
  "Incident response procedures",
  "Technical debt management",
  "Code refactoring techniques",
  "Performance profiling",
  "Security vulnerability assessment",
  "User authentication systems",
  "Data privacy compliance",
  "GDPR implementation",
  "Cookie policy management",
  "Terms of service optimization",
  "Privacy policy creation",
  "Legal compliance checking",
  "Risk assessment procedures",
  "Business continuity planning",
  "Disaster recovery strategies",
  "Vendor management processes",
  "Contract negotiation tactics",
  "Budget planning methods",
  "Financial forecasting",
  "Revenue optimization",
  "Cost reduction strategies",
  "Profit margin analysis",
  "Investment decision making",
  "Market research techniques",
  "Customer segmentation",
  "Persona development",
  "Value proposition design",
  "Pricing strategy optimization",
  "Sales funnel optimization",
  "Customer support automation",
  "Help desk implementation",
  "Knowledge base creation",
  "FAQ optimization",
  "Chatbot development",
  "Live chat integration",
  "Community building strategies",
  "User-generated content",
  "Influencer marketing",
  "Partnership development",
  "Affiliate program setup",
  "Referral system design",
  "Loyalty program creation",
  "Reward system implementation",
  "Gamification strategies",
  "User engagement metrics",
  "Retention rate optimization",
  "Churn reduction techniques",
  "Customer lifetime value",
  "Revenue per user optimization",
  "Market penetration strategies",
  "Brand awareness campaigns",
  "Thought leadership content",
  "Industry trend analysis",
  "Innovation management",
  "Technology adoption",
  "Digital transformation",
  "Process automation",
  "Workflow optimization",
  "Resource allocation",
  "Time management strategies",
  "Productivity enhancement",
  "Remote work optimization",
  "Team building activities"
];

/**
 * Calculates cosine similarity between two vectors
 * 
 * Cosine similarity measures the cosine of the angle between two vectors
 * and determines how similar they are regardless of their magnitude.
 * Values range from -1 (completely opposite) to 1 (identical direction).
 * 
 * @param vecA - First vector (embedding)
 * @param vecB - Second vector (embedding)
 * @returns Similarity score between 0 and 1
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // Calculate dot product (sum of element-wise multiplication)
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  
  // Calculate magnitude (length) of each vector
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  // Handle edge case where one vector has zero magnitude
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  // Return cosine similarity: dot product divided by product of magnitudes
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates an embedding vector for text using OpenAI's text-embedding-3-small model
 * 
 * Embeddings are numerical representations of text that capture semantic meaning.
 * Similar texts will have similar embeddings, enabling semantic search and comparison.
 * 
 * @param text - Text to generate embedding for
 * @returns Promise resolving to embedding vector (array of numbers)
 * @throws Error if OpenAI API call fails
 */
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw new Error('Failed to get embedding from OpenAI');
  }
}

/**
 * Generates a custom explanation for why a prompt is relevant to a specific domain
 * 
 * Uses OpenAI's chat completion to create contextual explanations that help users
 * understand the connection between recommended prompts and their domain.
 * 
 * @param prompt - The recommended prompt text
 * @param domain - The user's domain/business area
 * @returns Promise resolving to explanation string
 */
async function generateExplanation(prompt: string, domain: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "You're a helpful AI assistant. For the given prompt and domain, generate a concise one-sentence explanation of why the prompt is relevant to that domain."
        },
        {
          role: 'user',
          content: `Prompt: ${prompt}\nDomain: ${domain}`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || 'Highly relevant to your domain';
  } catch (error) {
    console.error('Error generating explanation:', error);
    // Return fallback explanation if OpenAI call fails
    return 'Highly relevant to your domain';
  }
}

// TypeScript interfaces for request/response data structures

/** Request body structure for the recommendation API */
interface RecommendRequest {
  domain: string;           // User's business domain or focus area
  prompts: string[];        // Array of user's existing prompts
}

/** Structure for prompt recommendations with similarity scores */
interface PromptRecommendation {
  prompt: string;           // The recommended prompt text
  similarity: number;       // Cosine similarity score (0-1)
  explanation: string;      // Custom explanation for relevance
}

/**
 * POST /api/recommend
 * 
 * Main API handler that processes recommendation requests.
 * 
 * Process:
 * 1. Validates input (domain and prompts array)
 * 2. Gets user session for personalization
 * 3. Generates embedding for user's domain
 * 4. Filters out prompts user already has
 * 5. Generates embeddings for remaining candidate prompts
 * 6. Calculates similarity scores using cosine similarity
 * 7. Selects top 5 most relevant prompts
 * 8. Generates custom explanations for each recommendation
 * 9. Saves recommendations to database
 * 10. Returns recommendations with explanations
 * 
 * @param request - Next.js request object containing JSON body
 * @returns JSON response with recommendations or error
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Parse and validate request body
    const body: RecommendRequest = await request.json();
    const { domain, prompts } = body;
    console.log('Request body parsed:', { domain, promptCount: prompts?.length });

    // Input validation
    if (!domain || !Array.isArray(prompts)) {
      console.log('Validation failed:', { domain: !!domain, isArray: Array.isArray(prompts) });
      return NextResponse.json(
        { error: 'Invalid request. Domain and prompts array are required.' },
        { status: 400 }
      );
    }

    // Get authenticated user for personalization and tracking
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "anonymous";
    console.log('User email:', userEmail);

    // Step 1: Generate embedding for user's domain
    console.log('Generating domain embedding...');
    const domainEmbedding = await getEmbedding(domain);
    console.log('Domain embedding completed');
    
    // Step 2: Filter out prompts user already has (case-insensitive comparison)
    const userPromptsLower = prompts.map(p => p.toLowerCase().trim());
    const unusedPrompts = HIGH_POTENTIAL_PROMPTS.filter(
      prompt => !userPromptsLower.includes(prompt.toLowerCase().trim())
    );
    
    // Step 3: Generate embeddings for all candidate prompts (parallel processing)
    console.log(`Generating embeddings for ${unusedPrompts.length} candidate prompts...`);
    const promptEmbeddings = await Promise.all(
      unusedPrompts.map(prompt => getEmbedding(prompt))
    );
    
    // Step 4: Calculate similarity scores for each prompt
    console.log('Calculating similarity scores...');
    const recommendations = unusedPrompts.map((prompt, index) => ({
      prompt,
      similarity: cosineSimilarity(domainEmbedding, promptEmbeddings[index])
    }));
    
    // Step 5: Sort by similarity and select top 5 recommendations
    const topRecommendations = recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    // Step 6: Generate custom explanations for each recommendation (parallel processing)
    console.log('Generating custom explanations for top recommendations...');
    const explanationPromises = topRecommendations.map(rec => 
      generateExplanation(rec.prompt, domain)
    );
    
    const explanations = await Promise.all(explanationPromises);
    
    // Step 7: Combine recommendations with their explanations
    const recommendationsWithExplanations: PromptRecommendation[] = topRecommendations.map((rec, index) => ({
      ...rec,
      explanation: explanations[index]
    }));
    
    console.log('Explanations generated successfully');

    // Step 8: Save recommendations to database for user history
    try {
      const recommendationsToSave: RecommendationInsert[] = recommendationsWithExplanations.map(rec => ({
        domain: domain.trim(),
        prompt: rec.prompt,
        explanation: rec.explanation || "Highly relevant to your domain",
        similarity: rec.similarity,
        user_email: userEmail
      }));

      const savedRecommendations = await recommendationsService.createMany(recommendationsToSave);
      
      if (savedRecommendations) {
        console.log(`Successfully saved ${savedRecommendations.length} recommendations to database`);
      } else {
        console.warn('Failed to save recommendations to database, but continuing with response');
      }
    } catch (dbError) {
      console.error('Database save error (non-critical):', dbError);
      // Continue with response even if database save fails
    }
      
    // Step 9: Return recommendations to client
    return NextResponse.json({ recommendations: recommendationsWithExplanations });
    
  } catch (error) {
    console.error('Error in recommend API:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}