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
      
      {/* Hero Section with Asymmetric Layout */}
      <section className="relative min-h-screen flex items-center px-8 py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Hero Content */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-8">
              {/* Logo and Tagline */}
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none">
                  v8n
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-lg">
                  Build AI-powered applications with natural language.
                </p>
              </div>

              {/* Coming Soon Section */}
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Coming Soon</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Be among the first to experience the future of AI development
                </h2>
                
                <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                  Join our exclusive early access program and shape the future of AI-powered application development.
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <PreRegisterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}