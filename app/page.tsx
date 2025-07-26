import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to v8n</h1>
        <p className="text-lg text-muted-foreground">
          Build AI-powered projects with natural language
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/projects">View Projects</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}