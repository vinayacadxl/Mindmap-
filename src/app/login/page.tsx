"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Chrome, Terminal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Error signing in with Google: ", error);
      }
    }
  };
  
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/50 to-accent/50 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-[spin_20s_linear_infinite]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      
      <div className="mx-auto max-w-2xl py-8">
        {!isFirebaseConfigured && (
          <Alert variant="destructive" className="mb-8 text-left">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Firebase Not Configured</AlertTitle>
            <AlertDescription>
              Your API keys are missing or invalid. Please add your Firebase configuration to the <code>.env</code> file to enable login and data saving.
            </AlertDescription>
          </Alert>
        )}
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl opacity-0 animate-reveal [animation-delay:200ms]">
          Welcome to a New World of <span className="text-primary">Thought</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground opacity-0 animate-reveal [animation-delay:400ms]">
          MindTask Navigator helps you visualize, organize, and connect your ideas like never before.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6 opacity-0 animate-reveal [animation-delay:600ms]">
          <Button onClick={handleGoogleSignIn} size="lg" disabled={!isFirebaseConfigured}>
            <Chrome className="mr-2 h-5 w-5" />
            Sign in to Get Started
          </Button>
        </div>
      </div>

      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 to-accent/30 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-[spin_25s_linear_infinite_reverse]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
