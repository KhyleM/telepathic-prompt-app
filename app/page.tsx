/**
 * Main Application Page - Search Prompt Recommender
 * 
 * This is the primary interface for the prompt recommendation system. Users can input
 * their existing prompts and domain to receive AI-powered recommendations for new
 * prompts that might be relevant to their business or project.
 */

'use client';

import { useState } from 'react';
import { getPromptRecommendations, PromptRecommendation } from '../utils/recommendPrompts';
import AuthButton from '../components/AuthButton';
import UserDisplay from '../components/UserDisplay';
import Link from 'next/link';

/**
 * Home page component providing the main user interface
 * 
 * Features:
 * - Form for entering user prompts and domain
 * - Authentication status display
 * - Real-time API integration for recommendations
 * - Loading states and error handling
 * - Responsive design with Tailwind CSS
 */
export default function Home() {
  // Form state management
  const [prompts, setPrompts] = useState('');                              // Raw textarea input from user
  const [domain, setDomain] = useState('');                               // User's business domain/focus area
  const [submittedPrompts, setSubmittedPrompts] = useState<string[]>([]);  // Processed array of user prompts
  
  // UI state management
  const [showResults, setShowResults] = useState(false);                  // Whether to display results section
  const [recommendations, setRecommendations] = useState<PromptRecommendation[]>([]);  // API response data
  const [isLoading, setIsLoading] = useState(false);                      // Loading state for API calls

  /**
   * Handles the recommendation generation process
   * 
   * Process:
   * 1. Parses user input (splits by lines, trims whitespace)
   * 2. Updates UI state to show loading
   * 3. Makes API call to /api/recommend endpoint
   * 4. Updates UI with results or handles errors
   * 
   * @returns Promise that resolves when API call completes
   */
  const handleGetRecommendations = async () => {
    // Parse user input: split by newlines, trim whitespace, filter empty lines
    const userPromptList = prompts
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Update UI state for results display
    setSubmittedPrompts(userPromptList);
    setShowResults(true);
    setIsLoading(true);
    setRecommendations([]);  // Clear previous results

    try {
      // Call recommendation API with user data
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domain.trim(),
          prompts: userPromptList,
        }),
      });

      // Parse response and update UI with recommendations
      const data = await response.json();
      console.log(data);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href="/my-recommendations"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Recommendations
            </Link>
            <AuthButton />
          </div>
          
          <h1 className="text-3xl font-semibold text-gray-900 text-center mb-8">
            Search Prompt Recommender
          </h1>

          <div className="flex justify-center mb-6">
            <UserDisplay />
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="prompts" className="block text-sm font-medium text-gray-700 mb-2">
                Search Prompts (one per line)
              </label>
              <textarea
                id="prompts"
                value={prompts}
                onChange={(e) => setPrompts(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter your search prompts here, one per line..."
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., itstelepathic.com"
              />
            </div>

            <button
              onClick={handleGetRecommendations}
              disabled={!prompts.trim() || !domain.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>

          {showResults && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Search Prompts</h2>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prompt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submittedPrompts.map((prompt, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{prompt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading recommendations...</span>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-gray-900 mb-2">{rec.prompt}</h3>
                        <p className="text-sm text-gray-600">{rec.explanation || "Highly relevant to your domain"}</p>
                        <p className="text-xs text-gray-400 mt-1">Similarity: {(rec.similarity * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                    {recommendations.length === 0 && !isLoading && (
                      <p className="text-gray-500 text-center py-4">No recommendations found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}