import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { recommendationsService, Recommendation } from '../lib/supabase';

export default async function UserRecommendations() {
  // Get the current session
  const session = await getServerSession(authOptions);
  
  // If no session or no email, show login message
  if (!session?.user?.email) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Recommendations</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-lg text-gray-700 mb-2">Log in to see your previous recommendations</p>
          <p className="text-sm text-gray-500">Sign in with GitHub to view and manage your saved recommendations.</p>
        </div>
      </div>
    );
  }

  // Fetch user's recommendations from Supabase
  const recommendations = await recommendationsService.getByUserEmail(session.user.email);

  // If no recommendations, show empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Recommendations</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No recommendations yet</p>
          <p className="text-sm text-gray-400 mt-1">Generate some recommendations to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((rec: Recommendation, index: number) => (
          <div 
            key={rec.id || index} 
            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 leading-tight">{rec.prompt}</h3>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {(rec.similarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{rec.explanation}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">Domain: {rec.domain}</span>
              {rec.created_at && (
                <span>
                  {new Date(rec.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Showing {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}