"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Github } from "lucide-react";

export default function AuthPageWrapper() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}

function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleGitHubLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Determine the correct redirect URL
      let redirectUrl;
      if (process.env.NODE_ENV === 'production') {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v8n-beta.vercel.app';
        redirectUrl = `${siteUrl}/auth/callback`;
      } else {
        redirectUrl = `${window.location.origin}/auth/callback`;
      }

      console.log('🔐 Starting GitHub OAuth login...');
      console.log('📍 Redirect URL:', redirectUrl);
      console.log('🌍 Environment:', process.env.NODE_ENV);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      console.log('📦 OAuth response data:', data);
      
      if (error) {
        console.error('❌ OAuth error:', error);
        throw error;
      }
      
      console.log('✅ OAuth request initiated successfully');
    } catch (error: unknown) {
      console.error('💥 GitHub login error:', error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Welcome to v8n
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your GitHub account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button 
            onClick={handleGitHubLogin} 
            className="w-full" 
            disabled={isLoading}
            variant="outline"
          >
            <Github className="mr-2 h-4 w-4" />
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </Button>

          <div className="text-center">
            <Button variant="link" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 