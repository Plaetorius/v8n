"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Settings, Calendar, Rocket, Edit, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { DeploymentLog } from "@/components/ui/deployment-log";
import { Project } from "@/lib/types";

// Mock n8n flow data (reuse from chat page for now)
const mockFlow = {
  name: "Webhook → Send Email",
  nodes: [
    {
      id: "webhook-1",
      parameters: {
        httpMethod: "POST",
        path: "welcome-user",
        responseMode: "onReceived"
      },
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300]
    },
    {
      id: "email-1",
      parameters: {
        fromEmail: "your@email.com",
        toEmail: "={{$json[\"email\"]}}",
        subject: "Welcome to our app!",
        text: "Hi {{$json[\"name\"]}},\n\nThanks for signing up. We're excited to have you!"
      },
      name: "Send Email",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [500, 300],
      credentials: {
        smtp: {
          id: "your-smtp-credential-id",
          name: "Your SMTP Credentials"
        }
      }
    }
  ],
  connections: {
    "Webhook": {
      main: [
        [
          {
            node: "Send Email",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  },
  active: false
};

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
        setEditName(data.name);
        setEditDescription(data.description || "");
      } else {
        toast.error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSaveProject = async () => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });
      
      if (response.ok) {
        const updatedProject = await response.json();
        setProject(updatedProject);
        setEditing(false);
        toast.success('Project updated successfully');
      } else {
        toast.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const [deploying, setDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean;
    logs: string[];
    details?: {
      flowName: string;
      nodeCount: number;
      connectionCount: number;
      authMethod: string;
      n8nStatus: boolean;
      workflowId?: string;
    };
  } | null>(null);
  const handleDeploy = async () => {
    setDeploying(true);
    setDeploymentResult(null);
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow: mockFlow }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message);
        setDeploymentResult({
          success: true,
          logs: data.logs || [],
          details: data.details as {
            flowName: string;
            nodeCount: number;
            connectionCount: number;
            authMethod: string;
            n8nStatus: boolean;
            workflowId?: string;
          }
        });
      } else {
        toast.error(data.error || "Deployment failed");
        setDeploymentResult({
          success: false,
          logs: data.logs || [],
          details: data.details as {
            flowName: string;
            nodeCount: number;
            connectionCount: number;
            authMethod: string;
            n8nStatus: boolean;
            workflowId?: string;
          }
        });
      }
    } catch (err: unknown) {
      toast.error("Deployment error: " + (err instanceof Error ? err.message : 'Unknown error'));
      setDeploymentResult({
        success: false,
        logs: [`❌ Network error: ${err instanceof Error ? err.message : 'Unknown error'}`]
      });
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-8"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project not found</h1>
            <Button asChild>
              <Link href="/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/projects" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-4xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <Button size="sm" onClick={handleSaveProject}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">{project.name}</h1>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {project.status}
                </div>
              </div>
              {editing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-xl text-muted-foreground max-w-3xl bg-transparent border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-xl text-muted-foreground max-w-3xl">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Project ID: {project.id}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href={`/projects/${project.id}/chat`}>
                <MessageSquare className="h-5 w-5" />
                Start Chat
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
            <Button variant="default" size="lg" onClick={handleDeploy} disabled={deploying}>
              <Rocket className="h-5 w-5 mr-2" />
              {
                deploying
                  ? "Deploying..."
                  : "Deploy to n8n"
              }
            </Button>
          </div>
          
          {/* Deployment Log */}
          {deploymentResult && (
            <div className="mt-6">
              <DeploymentLog
                logs={deploymentResult.logs}
                success={deploymentResult.success}
                details={deploymentResult.details}
                onClose={() => setDeploymentResult(null)}
              />
            </div>
          )}
        </div>

        {/* Project Overview Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Chat Sessions</h3>
                  <p className="text-sm text-muted-foreground">0 conversations</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Start a conversation with your AI assistant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Configuration</h3>
                  <p className="text-sm text-muted-foreground">Default settings</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize your AI assistant&apos;s behavior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Activity</h3>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                View your project&apos;s usage and analytics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 