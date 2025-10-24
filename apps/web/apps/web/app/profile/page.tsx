'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {session.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{session.user?.name}</h2>
              <p className="text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-lg">
                {session.user?.createdAt 
                  ? format(new Date(session.user.createdAt), 'MMMM d, yyyy')
                  : 'Recently joined'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Account ID</label>
              <p className="text-sm font-mono">{session.user?.id}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <Button variant="destructive" disabled>
              Delete Account (Demo - Disabled)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
