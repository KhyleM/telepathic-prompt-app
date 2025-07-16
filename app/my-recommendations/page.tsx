/**
 * My Recommendations Page
 * 
 * A dedicated page for users to view their previously generated recommendations.
 * This page provides a clean interface to browse recommendation history and navigate
 * back to the main generator.
 */

import UserRecommendations from '../../components/UserRecommendations';
import Link from 'next/link';

/**
 * Page component for displaying user's recommendation history
 * 
 * Features:
 * - Navigation back to main generator
 * - Full-width layout for recommendation display
 * - Responsive design with consistent styling
 * - Server-side rendering for optimal performance
 * 
 * @returns JSX element containing the recommendations page layout
 */
export default function MyRecommendationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Generator
          </Link>
        </div>
        
        <UserRecommendations />
      </div>
    </div>
  );
}