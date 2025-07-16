/**
 * User Display Component
 * 
 * A minimal component that displays the current user's email address with
 * a visual indicator when they are authenticated. Used to show authentication
 * status in the main application interface.
 */

'use client';

import { useSession } from "next-auth/react";

/**
 * Simple user indicator component
 * 
 * Displays a badge with the authenticated user's email address and a green
 * status indicator. Only renders when a user is signed in. Provides visual
 * confirmation of authentication state without taking up much UI space.
 * 
 * @returns JSX element with user email badge, or null if not authenticated
 */
export default function UserDisplay() {
  const { data: session } = useSession();

  // Don't render anything if user is not authenticated
  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200">
      {/* Green status indicator dot */}
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="font-medium">{session.user.email}</span>
    </div>
  );
}