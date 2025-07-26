"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          router.push("/auth?error=Authentication failed");
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to projects
          router.push("/projects");
        } else {
          // No session found, redirect back to auth
          router.push("/auth");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/auth?error=Authentication failed");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Completing authentication...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please wait while we complete your sign-in.
          </p>
        </CardContent>
      </Card>
    </main>
  );
} 