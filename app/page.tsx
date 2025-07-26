"use client"
import { useRouter } from 'next/navigation'
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

import {
  Github,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Code,
  Rocket,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Shield,
  Users,
  Palette,
  Database,
  Globe,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react"


// Types
interface WorkflowStep {
  id: number
  title: string
  color: string
  description: string
}

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
  gradient: string
}

const Autom8LandingPage: React.FC = () => {
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)

  // Workflow steps data
  const workflowSteps: WorkflowStep[] = [
    { id: 1, title: "Idea Input", color: "from-violet-500 to-purple-600", description: "Describe your automation" },
    { id: 2, title: "AI Processing", color: "from-purple-500 to-pink-600", description: "Smart workflow analysis" },
    { id: 3, title: "Code Generation", color: "from-pink-500 to-rose-600", description: "Automated development" },
    { id: 4, title: "Deployment", color: "from-rose-500 to-orange-600", description: "Live automation" },
  ]

  // Stats data
  const stats: Stat[] = [
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      value: "10x",
      label: "Faster Automation",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: <Code className="w-6 h-6 text-white" />,
      value: "500+",
      label: "Pre-built Workflows",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: <Rocket className="w-6 h-6 text-white" />,
      value: "24h",
      label: "From Idea to Automation",
      gradient: "from-orange-500 to-amber-600",
    },
  ]

  // Features data
  const features: Feature[] = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Automation",
      description:
        "Advanced machine learning algorithms that understand your processes and generate intelligent automation workflows.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Build and deploy automations in minutes, not months. Optimized for speed and efficiency.",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Smart Workflow Builder",
      description: "Generate clean, maintainable automation workflows across multiple platforms automatically.",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Real-time collaboration tools designed for teams building automation solutions together.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance standards for your automations.",
      gradient: "from-red-500 to-pink-600",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "One-Click Deploy",
      description: "Deploy automations to any platform with a single click. AWS, Azure, GCP, and more.",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Visual Designer",
      description: "Beautiful, intuitive visual designer for creating complex automation workflows with ease.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Smart Integrations",
      description: "Automatic integration setup and data mapping based on your automation requirements.",
      gradient: "from-teal-500 to-cyan-600",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Execution",
      description: "Run your automations globally with automatic scaling and regional optimization.",
      gradient: "from-indigo-500 to-blue-600",
    },
  ]

  // Workflow animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % workflowSteps.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, workflowSteps.length])

  // Event handlers
  const handlePlay = (): void => setIsPlaying(!isPlaying)
  const handleReset = (): void => {
    setIsPlaying(false)
    setActiveStep(0)
  }

  const handleEmailSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log("Email submitted:", email)
    // Handle email submission logic here
  }

  // Header Component
  const Header: React.FC = () => (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A8</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              autom8
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Features
            </a>
            <a href="#workflow" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Workflow
            </a>
            <a href="#demo" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Demo
            </a>
            <a href="#team" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">
              Team
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="https://github.com/Plaetorius/v8n/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-violet-600"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Button>
              </Link>
              <Link href="/auth">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg">
              Get Started
            </Button>
            </Link>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )

  // Hero Section Component
  const HeroSection: React.FC = () => (
    <section className="container mx-auto px-6 py-20 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">Hackathon Project 2025</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight text-black">
            Build the{" "}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              future
            </span>
            <br/>
            <h1>with {" "}<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              autom8
            </span></h1>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            The next-generation automation platform that transforms manual processes into intelligent workflows through
            AI-powered automation.
          </p>

          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
          >
            <div className="flex-1 max-w-md">
              <Input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg border-2 border-gray-200 focus:border-violet-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
            >
              Join Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  // Workflow Demo Component
  const WorkflowDemo: React.FC = () => (
    <section id="workflow" className="container mx-auto px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-black">
            See autom8 in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Action</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how autom8 transforms your manual processes into intelligent automation workflows
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12">
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Button
              onClick={handlePlay}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"} Demo
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="relative">
                <Card
                  className={`transition-all duration-500 ${
                    activeStep === index
                      ? "scale-105 shadow-lg border-violet-200"
                      : "scale-100 shadow-sm border-gray-100"
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
                        activeStep === index ? "animate-pulse" : ""
                      }`}
                    >
                      <span className="text-white font-bold text-xl">{step.id}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>

                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <div
                      className={`w-6 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-500 ${
                        activeStep > index ? "from-violet-500 to-purple-600" : ""
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Step:</h4>
              <p className="text-violet-600 font-medium">{workflowSteps[activeStep].title}</p>
              <p className="text-gray-600 text-sm mt-1">{workflowSteps[activeStep].description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  // Feature Grid Component
  const FeatureGrid: React.FC = () => (
    <section id="features" className="container mx-auto px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-black">
            Powerful{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Automation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your automation workflows with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-violet-200 bg-white"
            >
              <CardContent className="p-6">
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )

  // Footer Component
  const Footer: React.FC = () => (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">A8</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                autom8
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-6 max-w-md">
              Transforming manual processes into intelligent automation workflows. Built for the future of productivity
              and efficiency.
            </p>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-violet-500 hover:text-violet-600 bg-transparent"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-violet-500 hover:text-violet-600 bg-transparent"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-violet-500 hover:text-violet-600 bg-transparent"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Hackathon</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  About autom8
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Team
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Pitch Deck
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-600 mb-4 md:mb-0">© 2025 autom8. Built with ❤️ for the hackathon community.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors text-sm">
                Terms of Service
              </a>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-violet-600">
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />
      <HeroSection />
      <WorkflowDemo />
      <FeatureGrid />
      <Footer />
    </div>
  )
}

export default Autom8LandingPage
