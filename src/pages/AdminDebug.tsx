import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDebug = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch } = useProfile();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Debug Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
                {user && (
                  <>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {profileLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {profileError ? 'Yes' : 'No'}</p>
                {profileError && (
                  <p><strong>Error Message:</strong> {profileError.message}</p>
                )}
                <p><strong>Profile:</strong> {profile ? 'Loaded' : 'Not loaded'}</p>
                {profile && (
                  <>
                    <p><strong>Role:</strong> {profile.role}</p>
                    <p><strong>Full Name:</strong> {profile.full_name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Access Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Has User:</strong> {user ? '✅' : '❌'}</p>
                <p><strong>Has Profile:</strong> {profile ? '✅' : '❌'}</p>
                <p><strong>Role is Admin:</strong> {profile?.role === 'admin' ? '✅' : '❌'}</p>
                <p><strong>Can Access Admin:</strong> {user && profile?.role === 'admin' ? '✅' : '❌'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={refetch} className="w-full">
                  Refresh Profile
                </Button>
                <Button onClick={handleRefresh} variant="outline" className="w-full">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Make sure you're logged in with an admin account</p>
              <p>2. Check if your profile loaded correctly</p>
              <p>3. Verify your role is set to 'admin'</p>
              <p>4. If you see errors, check the database migrations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDebug;
