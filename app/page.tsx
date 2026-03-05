"use client";

import { useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import MindMap from '@/components/mind-map';
import LandingPage from '@/components/landing-page';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

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
