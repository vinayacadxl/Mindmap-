"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import MindMap from '@/components/mind-map';
import LandingPage from '@/components/landing-page';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  // Automatically show dashboard if logged in
  if (!isLoading && user) {
    return (
      <AuthGuard>
        <>
          <MindMap />
          <Toaster />
        </>
      </AuthGuard>
    );
  }

  if (!showDashboard) {
    return <LandingPage onGetStarted={() => setShowDashboard(true)} />;
  }



  return (
    <AuthGuard>
      <>
        <MindMap />
        <Toaster />
      </>
    </AuthGuard>
  );
}
