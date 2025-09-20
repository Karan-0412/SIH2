import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
const Assistant = React.lazy(() => import('@/components/ai/AssistantWidget'));

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      {user && <Navbar />}
      <Outlet />
      <div className="fixed bottom-0 right-0">
        <React.Suspense fallback={null}>
          <Assistant />
        </React.Suspense>
      </div>
    </div>
  );
}
