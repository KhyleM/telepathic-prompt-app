/**
 * Authentication Button Component
 * 
 * A responsive authentication UI component that handles user sign-in/sign-out
 * functionality using NextAuth.js with GitHub OAuth provider. Displays different
 * states based on authentication status and provides a clean, accessible interface.
 */

'use client';

import { useSession, signIn, signOut } from "next-auth/react";

/**
 * Authentication button component with conditional rendering
 * 
 * Renders different UI states based on authentication status:
 * - Loading spinner during session check
 * - User profile with sign-out button when authenticated
 * - GitHub sign-in button when not authenticated
 * 
 * @returns JSX element containing the appropriate authentication UI
 */
export default function AuthButton() {
  const { data: session, status } = useSession();

  // Show loading spinner while session is being checked
  if (status === "loading") {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show user profile and sign-out button when authenticated
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Display user avatar if available */}
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-700">
            Signed in as <strong>{session.user?.name}</strong>
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Show GitHub sign-in button when not authenticated
  return (
    <button
      onClick={() => signIn("github")}
      className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
    >
      {/* GitHub icon SVG */}
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
      </svg>
      Sign in with GitHub
    </button>
  );
}