"use client";

import { AuthGuard } from '@/components/auth-guard';
import MindMap from '@/components/mind-map';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <AuthGuard>
      <>
        <MindMap />
        <Toaster />
      </>
    </AuthGuard>
  );
}
