"use client";

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import MindMap from '@/components/mind-map';
import LandingPage from '@/components/landing-page';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  // Apply dark class to <html> for dashboard, remove for landing page
  useEffect(() => {
    const html = document.documentElement;
    if (showDashboard) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [showDashboard]);

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
