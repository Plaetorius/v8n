import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Dither from "@/components/backgrounds/Dither/Dither";
import { PreRegisterForm } from "@/components/ui/pre-register-form";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Dither Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <Dither 
          waveSpeed={0.02}
          waveFrequency={2}
          waveAmplitude={0.2}
          waveColor={[0.1, 0.1, 0.1]}
          colorNum={2}
          pixelSize={3}
          disableAnimation={false}
          enableMouseInteraction={false}
        />
      </div>
      
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Glassmorphism Card */}
        <div className="relative z-10 text-center px-8 py-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 shadow-2xl">
            {/* Main Heading */}
            <h1 className="text-8xl md:text-9xl font-bold mb-8 text-white drop-shadow-lg">
              v8n
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Build AI-powered applications with natural language.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-medium shadow-xl border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                asChild
              >
                <Link href="/projects" className="flex items-center gap-2" aria-label="Get started with autom8 projects">
                  Get Started
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-registration Section */}
      <section className="relative py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Coming Soon
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              v8n is currently in development. Pre-register to be among the first to experience 
              the future of AI-powered application building.
            </p>
          </div>
          
          <div className="flex justify-center">
            <PreRegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}