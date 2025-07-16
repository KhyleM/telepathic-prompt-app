import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

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

export interface PromptRecommendation {
  prompt: string;
  similarity: number;
}

export async function getPromptRecommendations(
  domain: string,
  userPrompts: string[]
): Promise<PromptRecommendation[]> {
  try {
    // Get domain embedding
    const domainEmbedding = await getEmbedding(domain);
    
    // Filter out prompts already in user's list (case-insensitive)
    const userPromptsLower = userPrompts.map(p => p.toLowerCase().trim());
    const unusedPrompts = HIGH_POTENTIAL_PROMPTS.filter(
      prompt => !userPromptsLower.includes(prompt.toLowerCase().trim())
    );
    
    // Get embeddings for all unused prompts
    const promptEmbeddings = await Promise.all(
      unusedPrompts.map(prompt => getEmbedding(prompt))
    );
    
    // Calculate similarities and create recommendations
    const recommendations: PromptRecommendation[] = unusedPrompts.map((prompt, index) => ({
      prompt,
      similarity: cosineSimilarity(domainEmbedding, promptEmbeddings[index])
    }));
    
    // Sort by similarity (highest first) and return top 5
    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
      
  } catch (error) {
    console.error('Error getting prompt recommendations:', error);
    throw new Error('Failed to get prompt recommendations');
  }
}