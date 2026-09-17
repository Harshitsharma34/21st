'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user?.first_name || user?.email}!
            </h1>
            <p className="mt-2 text-gray-600">
              You're logged in to MeetSync
            </p>
          </div>
          <Button onClick={() => logout()} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Profile</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>Email: {user?.email}</p>
              <p>
                Verified:{' '}
                {user?.email_verified ? '✓ Yes' : '✗ No'}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Upload Transcript</h2>
            <p className="mt-2 text-sm text-gray-600">
              Paste a meeting transcript to extract insights
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Your Cases</h2>
            <p className="mt-2 text-sm text-gray-600">
              View all extracted work items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
