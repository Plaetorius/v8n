import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <p className="text-lg text-muted-foreground">
          Simple authentication with Supabase
        </p>
        <Button asChild>
          <Link href="/auth">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}

// TOMMMMMMMM