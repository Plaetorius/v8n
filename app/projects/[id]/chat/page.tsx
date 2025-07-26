"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User, Settings, Webhook, Mail, Plus, Upload, FileJson, Rocket, Save, FileText, Settings as Gear } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { N8nFlow, N8nNode, validateN8nFlow } from "@/lib/n8n-utils";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { DeploymentLog } from "@/components/ui/deployment-log";
import ReactMarkdown from 'react-markdown';

// Mock project data - removed unused variable

// Initial empty messages array
const initialMessages: Array<{ id: string; type: string; content: string; timestamp: string }> = [];

// Mock n8n flow data
const mockFlow: N8nFlow = {
  name: "Webhook → Send Email",
  nodes: [
    {
      id: uuidv4(),
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
      id: uuidv4(),
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

export default function ChatPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(30); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [flow, setFlow] = useState<N8nFlow>(mockFlow);
  const [selectedNode, setSelectedNode] = useState<N8nNode | null>(null);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nodeSettings, setNodeSettings] = useState<N8nNode | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [project, setProject] = useState<{
    id: string;
    name: string;
    workflow_json?: N8nFlow;
  }>({
    id: projectId,
    name: "Project " + projectId,
  });

  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowTags, setWorkflowTags] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Load project data and workflow from database
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
          
          // Load saved workflow if it exists
          if (projectData.workflow_json) {
            setFlow(projectData.workflow_json);
            // Initialize settings with current workflow data
            setWorkflowName(projectData.workflow_json.name || "");
            setWorkflowDescription(projectData.workflow_json.description || "");
            setWorkflowTags(projectData.workflow_json.tags?.join(", ") || "");
            // Add a message about loading the saved workflow
            const loadMessage = {
              id: uuidv4(),
              type: "bot" as const,
              content: `Loaded saved workflow "${projectData.workflow_json.name}" with ${projectData.workflow_json.nodes.length} nodes. I can help you modify or extend this workflow. What would you like to do?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [loadMessage, ...prev]);
          } else {
            // Add welcome message for new projects
            const welcomeMessage = {
              id: uuidv4(),
              type: "bot" as const,
              content: "Hello! I'm your AI assistant for creating and managing n8n workflows. I can help you build automation workflows, add nodes, configure connections, and deploy to n8n. What kind of workflow would you like to create?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [welcomeMessage, ...prev]);
          }
        } else {
          console.error('Failed to load project');
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleSaveWorkflow = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_json: flow,
        }),
      });
      
      if (response.ok) {
        toast.success('Workflow saved successfully');
      } else {
        toast.error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Update the flow with new metadata including the name
      const updatedFlow = {
        ...flow,
        name: workflowName,
        description: workflowDescription,
        tags: workflowTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      
      setFlow(updatedFlow);
      
      // Save to database
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_json: updatedFlow,
        }),
      });
      
      if (response.ok) {
        toast.success('Workflow settings saved successfully');
        setIsSettingsOpen(false);
      } else {
        toast.error('Failed to save workflow settings');
      }
    } catch (error) {
      console.error('Error saving workflow settings:', error);
      toast.error('Failed to save workflow settings');
    } finally {
      setSavingSettings(false);
    }
  };



  const normalizeImportedFlow = (flow: unknown): N8nFlow => {
    const flowData = flow as Record<string, unknown>;
    // Ensure all nodes have unique IDs and proper structure
    const normalizedNodes = ((flowData.nodes as unknown[]) || []).map((node: unknown) => {
      const nodeData = node as Record<string, unknown>;
      return {
        id: (nodeData.id as string) || uuidv4(),
        parameters: (nodeData.parameters as Record<string, string | number | boolean>) || {},
        name: (nodeData.name as string) || 'Unnamed Node',
        type: (nodeData.type as string) || 'n8n-nodes-base.stub',
        typeVersion: (nodeData.typeVersion as number) || 1,
        position: (nodeData.position as [number, number]) || [0, 0],
        credentials: (nodeData.credentials as Record<string, unknown>) || {},
      } as N8nNode;
    });
    
    return {
      name: (flowData.name as string) || 'Imported Flow',
      nodes: normalizedNodes,
      connections: (flowData.connections as Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }>) || {},
      active: (flowData.active as boolean) || false,
    } as N8nFlow;
  };

  const generateFollowUpQuestions = (workflow: N8nFlow): string => {
    const nodeTypes = workflow.nodes.map(node => node.type);
    const hasWebhook = nodeTypes.some(type => type.includes('webhook'));
    const hasEmail = nodeTypes.some(type => type.includes('email'));
    const hasHttp = nodeTypes.some(type => type.includes('http'));
    const hasFunction = nodeTypes.some(type => type.includes('function'));
    
    const questions = [];
    
    // General workflow questions
    if (workflow.nodes.length === 1) {
      questions.push("Would you like to add more nodes to complete the workflow?");
    }
    
    if (workflow.nodes.length > 1 && Object.keys(workflow.connections).length === 0) {
      questions.push("Should I connect the nodes in sequence?");
    }
    
    // Specific node type questions
    if (hasWebhook) {
      questions.push("Do you want to configure the webhook endpoint or add authentication?");
    }
    
    if (hasEmail) {
      questions.push("Would you like to set up email templates or add conditional email sending?");
    }
    
    if (hasHttp) {
      questions.push("Should I add error handling for the HTTP requests?");
    }
    
    if (hasFunction) {
      questions.push("Do you need help with the function code or want to add more logic?");
    }
    
    // Deployment questions
    if (workflow.nodes.length > 0) {
      questions.push("Would you like to deploy this workflow to n8n now?");
    }
    
    // If no specific questions, provide general guidance
    if (questions.length === 0) {
      questions.push("What would you like to do next? I can help you add more nodes, configure existing ones, or deploy the workflow.");
    }
    
    return questions.length > 0 ? `\n\n${questions.join(' ')}` : '';
  };

  const ensureWorkflowConnections = (flow: N8nFlow): N8nFlow => {
    // Ensure all nodes have proper connections
    const validatedConnections: Record<string, { main: Array<Array<{ node: string; type: string; index: number }>> }> = {};
    
    // Preserve existing connections if they're valid
    if (flow.connections) {
      Object.entries(flow.connections).forEach(([sourceNode, connections]) => {
        const source = flow.nodes.find(n => n.name === sourceNode);
        if (source && connections.main) {
          validatedConnections[sourceNode] = connections;
        }
      });
    }
    
    // Process each node and ensure it has proper connections
    flow.nodes.forEach((node, index) => {
      // If this node doesn't have a connection and there's a next node, create one
      if (index < flow.nodes.length - 1 && !validatedConnections[node.name]) {
        const nextNode = flow.nodes[index + 1];
        
        validatedConnections[node.name] = {
          main: [
            [
              {
                node: nextNode.name,
                type: "main",
                index: 0
              }
            ]
          ]
        };
      }
    });
    
    // Ensure all nodes have unique names for proper connections
    const nodesWithUniqueNames = flow.nodes.map((node, index) => ({
      ...node,
      name: node.name || `Node ${index + 1}`,
    }));
    
    return {
      ...flow,
      nodes: nodesWithUniqueNames,
      connections: validatedConnections,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const parsedFlow = JSON.parse(jsonContent);
        
        if (validateN8nFlow(parsedFlow)) {
          const normalizedFlow = normalizeImportedFlow(parsedFlow);
          setFlow(normalizedFlow);
          setUploadSuccess(`Successfully loaded flow: ${normalizedFlow.name}`);
          
          // Add a bot message about the upload with follow-up questions
          const followUpQuestions = generateFollowUpQuestions(normalizedFlow);
          const uploadMessage = {
            id: uuidv4(),
            type: "bot" as const,
            content: `I've loaded your n8n flow "${normalizedFlow.name}" with ${normalizedFlow.nodes.length} nodes. I can help you modify it through our chat!${followUpQuestions}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, uploadMessage]);
        } else {
          setUploadError("Invalid n8n flow format. Please check your JSON structure.");
        }
      } catch {
        setUploadError("Failed to parse JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleJsonPaste = (jsonString: string) => {
    try {
      const parsedFlow = JSON.parse(jsonString);
      
      if (validateN8nFlow(parsedFlow)) {
        const normalizedFlow = normalizeImportedFlow(parsedFlow);
        setFlow(normalizedFlow);
        setUploadSuccess(`Successfully loaded flow: ${normalizedFlow.name}`);
        
        // Add a bot message about the upload with follow-up questions
        const followUpQuestions = generateFollowUpQuestions(normalizedFlow);
        const uploadMessage = {
          id: uuidv4(),
          type: "bot" as const,
          content: `I've loaded your n8n flow "${normalizedFlow.name}" with ${normalizedFlow.nodes.length} nodes. I can help you modify it through our chat!${followUpQuestions}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, uploadMessage]);
      } else {
        setUploadError("Invalid n8n flow format. Please check your JSON structure.");
      }
    } catch {
      setUploadError("Failed to parse JSON. Please check the format.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue.trim();
    const newMessage = {
      id: uuidv4(),
      type: "user" as const,
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setAiLoading(true);
    setAiError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch("/api/claude-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          workflow_json: flow,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
              if (data.workflow_json) {
          try {
            // Validate and normalize the workflow before setting it
            const normalizedWorkflow = normalizeImportedFlow(data.workflow_json);
            
            // Ensure all nodes have proper connections
            const validatedWorkflow = ensureWorkflowConnections(normalizedWorkflow);
            
            setFlow(validatedWorkflow);
            
            // Use the conversation message from Claude if available, otherwise generate follow-up questions
            const conversationMessage = data.conversation_message || `I've updated your workflow with ${validatedWorkflow.nodes.length} nodes and ${Object.keys(validatedWorkflow.connections).length} connections.`;
            
            const botResponse = {
              id: uuidv4(),
              type: "bot" as const,
              content: conversationMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, botResponse]);
          } catch (validationError) {
          console.error('Workflow validation error:', validationError);
          const botResponse = {
            id: uuidv4(),
            type: "bot" as const,
            content: "I received an invalid workflow format from the AI. This might be due to a parsing issue. Could you please try rephrasing your request or ask me to make a specific change to the workflow?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, botResponse]);
        }
              } else {
          const errorMessage = data.error || "No workflow data received from Claude.";
          setAiError(errorMessage);
          const botResponse = {
            id: uuidv4(),
            type: "bot" as const,
            content: `I apologize, but I encountered an issue: ${errorMessage}. Could you please try rephrasing your request or let me know what specific changes you'd like to make to the workflow?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, botResponse]);
        }
          } catch (err: unknown) {
        const errorMessage = err instanceof Error && err.name === 'AbortError' 
          ? 'Request timed out. Please try again.' 
          : (err instanceof Error ? err.message : 'An unexpected error occurred.');
        
        setAiError(errorMessage);
        const botResponse = {
          id: uuidv4(),
          type: "bot" as const,
          content: `I apologize, but I encountered a technical issue: ${errorMessage}. Please try again in a moment, or let me know if you'd like to try a different approach.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botResponse]);
      } finally {
      setAiLoading(false);
    }
  };

  /*
  const processAIRequest = (userMessage: string): string => {
    const flowManager = createFlowManager(flow);
    const lowerMessage = userMessage.toLowerCase();
    
    // AI can understand and modify the flow based on user requests
    if (lowerMessage.includes("add webhook") || lowerMessage.includes("create webhook")) {
      const webhookName = "New Webhook";
      const webhookNode = flowManager.createWebhookNode(webhookName, "new-webhook");
      const updatedFlow = flowManager.addNode(webhookNode);
      setFlow(updatedFlow);
      return `I've added a new webhook node "${webhookName}" to your flow. You can now configure it by clicking on the node.`;
    }
    
    if (lowerMessage.includes("add email") || lowerMessage.includes("create email")) {
      const emailName = "Send Email";
      const emailNode = flowManager.createEmailNode(emailName, "from@example.com", "to@example.com", "Subject", "Email content");
      const updatedFlow = flowManager.addNode(emailNode);
      setFlow(updatedFlow);
      return `I've added a new email node "${emailName}" to your flow. You can configure the email settings by clicking on the node.`;
    }
    
    if (lowerMessage.includes("rename") && lowerMessage.includes("flow")) {
      const newName = userMessage.match(/rename.*flow.*to\s+["']?([^"']+)["']?/i)?.[1] || "Updated Flow";
      const updatedFlow = flowManager.updateFlowName(newName);
      setFlow(updatedFlow);
      return `I've renamed your flow to "${newName}".`;
    }
    
    if (lowerMessage.includes("list nodes") || lowerMessage.includes("show nodes")) {
      const nodeNames = flowManager.getNodeNames();
      return `Your flow contains these nodes: ${nodeNames.join(", ")}.`;
    }
    
    if (lowerMessage.includes("export") || lowerMessage.includes("download")) {
      // In a real app, you'd trigger a download here
      return `I've prepared your flow for export. The JSON contains ${flow.nodes.length} nodes and ${Object.keys(flow.connections).length} connections.`;
    }
    
    if (lowerMessage.includes("validate") || lowerMessage.includes("check")) {
      const validation = flowManager.validateFlow();
      if (validation.isValid) {
        return "Your flow is valid! All nodes and connections are properly configured.";
      } else {
        return `I found some issues with your flow: ${validation.errors.join(", ")}`;
      }
    }
    
    // Default response
    return "I understand your request. I can help you modify your n8n flow. Try asking me to 'add webhook', 'add email', 'rename flow', 'list nodes', or 'validate flow'.";
  };
  */

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Limit the width between 30% and 70%
    const clampedWidth = Math.max(30, Math.min(70, newWidth));
    setLeftPanelWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /*
  const handleNodeClick = (node: N8nNode) => {
    setSelectedNode(node);
    setIsNodeDialogOpen(true);
  };
  */

  const handleNodeUpdate = (updatedNode: N8nNode) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      )
    }));
    setIsNodeDialogOpen(false);
    setSelectedNode(null);
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case "n8n-nodes-base.webhook":
        return <Webhook className="h-4 w-4" />;
      case "n8n-nodes-base.emailSend":
        return <Mail className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case "n8n-nodes-base.webhook":
        return "bg-blue-600 text-white";
      case "n8n-nodes-base.emailSend":
        return "bg-green-600 text-white";
      case "n8n-nodes-base.function":
        return "bg-purple-600 text-white";
      case "n8n-nodes-base.httpRequest":
        return "bg-orange-600 text-white";
      case "n8n-nodes-base.if":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeploymentResult(null);
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flow }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Save the workflow to database after successful deployment
        try {
          const saveResponse = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflow_json: flow,
            }),
          });
          
          if (saveResponse.ok) {
            toast.success(`${data.message} and saved to database`);
          } else {
            toast.success(data.message);
            toast.warning('Deployment successful but failed to save to database');
            // Add error log for database save failure
            setDeploymentResult({
              success: true,
              logs: [
                ...(data.logs || []),
                '💾 Saving workflow to database...',
                '❌ Failed to save workflow to database'
              ],
              details: {
                ...data.details,
                workflowId: data.workflowId
              }
            });
            return; // Exit early to avoid overwriting logs
          }
        } catch (saveError) {
          console.error('Error saving workflow after deployment:', saveError);
          toast.success(data.message);
          toast.warning('Deployment successful but failed to save to database');
          // Add error log for database save failure
          setDeploymentResult({
            success: true,
            logs: [
              ...(data.logs || []),
              '💾 Saving workflow to database...',
              '❌ Failed to save workflow to database'
            ],
            details: {
              ...(data.details as {
                flowName: string;
                nodeCount: number;
                connectionCount: number;
                authMethod: string;
                n8nStatus: boolean;
              }),
              workflowId: data.workflowId
            }
          });
          return; // Exit early to avoid overwriting logs
        }
        
        setDeploymentResult({
          success: true,
          logs: [
            ...(data.logs || []),
            '💾 Saving workflow to database...',
            '✅ Workflow saved to database successfully'
          ],
          details: {
            ...(data.details as {
              flowName: string;
              nodeCount: number;
              connectionCount: number;
              authMethod: string;
              n8nStatus: boolean;
            }),
            workflowId: data.workflowId
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

  // Multiplicative zoom factor
  const ZOOM_STEP = 1.1;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 2.0;

  // Mouse-centered zoom
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { x, y, scale } = canvasTransform;
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    let newScale = scale * factor;
    newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
    // Adjust pan so zoom is centered on mouse
    const wx = (mouseX - x) / scale;
    const wy = (mouseY - y) / scale;
    const newX = mouseX - wx * newScale;
    const newY = mouseY - wy * newScale;
    setCanvasTransform({ x: newX, y: newY, scale: newScale });
  }, [canvasTransform]);

  // Canvas pan
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start canvas dragging if clicking on the canvas background, not on nodes
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      setIsDraggingCanvas(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      setCanvasTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDraggingCanvas]);
  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
  }, []);

  // Node drag
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    // Only drag if not clicking gear
    if ((e.target as HTMLElement).closest('.node-gear')) return;
    e.stopPropagation();
    setDraggedNode(nodeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);
  const handleNodeMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode) {
      e.preventDefault();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Transform mouse coordinates to canvas coordinates accounting for transform
      const { x, y, scale } = canvasTransform;
      const mouseX = (e.clientX - canvasRect.left - x) / scale;
      const mouseY = (e.clientY - canvasRect.top - y) / scale;
      
      // Calculate new position by subtracting the drag offset
      const newX = mouseX - dragOffset.x / scale;
      const newY = mouseY - dragOffset.y / scale;
      
      // Clamp to canvas bounds (infinite, but keep nodes visible)
      const clampedX = Math.max(0, Math.min(2000 - 192, newX));
      const clampedY = Math.max(0, Math.min(2000 - 80, newY));
      
      setFlow(prev => ({
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === draggedNode
            ? { ...node, position: [clampedX, clampedY] }
            : node
        )
      }));
    }
  }, [draggedNode, dragOffset, canvasTransform]);

  // Node gear/settings
  const handleNodeGearClick = (e: React.MouseEvent, node: N8nNode) => {
    e.stopPropagation();
    setNodeSettings(node);
  };
  const handleNodeSettingsSave = (updatedNode: N8nNode) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    }));
    setNodeSettings(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we load your workflow</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${projectId}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">Chat Interface</p>
            </div>
          </div>
                          <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Flow
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSaveWorkflow}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Workflow"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <div className="flex items-center gap-1 border rounded px-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCanvasTransform(prev => ({ ...prev, scale: Math.min(MAX_ZOOM, prev.scale * ZOOM_STEP) }))}
                    >
                      +
                    </Button>
                    <span className="text-xs w-12 text-center">
                      {Math.round(canvasTransform.scale * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCanvasTransform(prev => ({ ...prev, scale: Math.max(MIN_ZOOM, prev.scale / ZOOM_STEP) }))}
                    >
                      -
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCanvasTransform({ x: 0, y: 0, scale: 1 })}
                  >
                    Reset View
                  </Button>
                </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div 
          className="flex flex-col border-r bg-background"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.type === "bot" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600 animate-bounce" />
                </div>
                <div className="max-w-[70%] rounded-lg p-3 bg-muted">
                  <p className="text-sm text-muted-foreground">Claude is thinking...</p>
                </div>
              </div>
            )}
            {aiError && (
              <div className="text-xs text-red-600 mt-2">{aiError}</div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or paste n8n JSON..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {inputValue.trim().startsWith('{') && inputValue.trim().endsWith('}') && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleJsonPaste(inputValue)}
                  className="text-xs"
                >
                  <FileJson className="h-3 w-3 mr-1" />
                  Load as n8n Flow
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Canvas */}
        <div 
          className="flex-1 bg-gray-50"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="h-full flex flex-col">
            {/* Canvas Header */}
            <div className="border-b bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">n8n Flow</h2>
                  <p className="text-sm text-muted-foreground">
                    {flow.name}
                  </p>
                  {uploadSuccess && (
                    <p className="text-xs text-green-600 mt-1">{uploadSuccess}</p>
                  )}
                  {uploadError && (
                    <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDeploy} disabled={deploying}>
                    <Rocket className="h-4 w-4 mr-2" />
                    {
                      deploying ? "Deploying..." : "Deploy to n8n"
                    }
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Node
                  </Button>
                </div>
              </div>
              
              {/* Deployment Log */}
              {deploymentResult && (
                <div className="mt-4">
                  <DeploymentLog
                    logs={deploymentResult.logs}
                    success={deploymentResult.success}
                    details={deploymentResult.details}
                    onClose={() => setDeploymentResult(null)}
                  />
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div 
              className="flex-1 p-4 overflow-hidden relative"
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={e => { handleCanvasMouseMove(e); handleNodeMouseMove(e); }}
              onMouseUp={handleCanvasMouseUp}
              onWheel={handleCanvasWheel}
              style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
            >
              {/* Infinite Canvas Container with Transform */}
              <div
                className="absolute inset-0"
                style={{
                  width: '2000px',
                  height: '2000px',
                  minWidth: '2000px',
                  minHeight: '2000px',
                  transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                  transformOrigin: '0 0',
                }}
              >
                {/* Canvas Background for pan detection */}
                <div 
                  className="absolute inset-0 canvas-background"
                  style={{ 
                    pointerEvents: 'auto',
                    backgroundImage: `
                      radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                />
                {/* SVG overlay for all connections */}
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  width="2000"
                  height="2000"
                  style={{
                    zIndex: 1,
                  }}
                >
                  {Object.entries(flow.connections).map(([sourceNode, connections]) => {
                    const source = flow.nodes.find(n => n.name === sourceNode);
                    if (!source) return null;
                    
                    const mainConnections = Array.isArray(connections.main) ? connections.main : [];
                    return mainConnections.map((connArr, idx) => {
                      if (!Array.isArray(connArr) || connArr.length === 0) return null;
                      
                      const firstConnection = connArr[0];
                      const targetNodeName = firstConnection?.node;
                      const target = flow.nodes.find(n => n.name === targetNodeName);
                      
                      if (!target) return null;
                      
                      // Calculate connection points
                      const sourceX = source.position[0] + 192; // Right edge of source node
                      const sourceY = source.position[1] + 40;  // Middle of source node
                      const targetX = target.position[0];        // Left edge of target node
                      const targetY = target.position[1] + 40;  // Middle of target node
                      
                      return (
                        <g key={`${sourceNode}-${target.name}-${idx}`}>
                          {/* Connection line */}
                          <line
                            x1={sourceX}
                            y1={sourceY}
                            x2={targetX}
                            y2={targetY}
                            stroke="#374151"
                            strokeWidth={3}
                            markerEnd="url(#arrowhead)"
                            className="connection-line"
                          />
                        </g>
                      );
                    });
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth={10}
                      markerHeight={7}
                      refX={9}
                      refY={3.5}
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                    </marker>
                  </defs>
                </svg>
                
                {/* Flow Nodes */}
                {flow.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute group"
                    style={{
                      left: node.position[0],
                      top: node.position[1],
                      width: 192,
                      height: 80,
                      pointerEvents: 'auto',
                      zIndex: 2,
                      userSelect: 'none',
                    }}
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                  >
                    <div className="w-48 p-3 rounded-lg border-2 shadow-lg bg-white hover:shadow-xl transition-all duration-200 hover:border-blue-300 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNodeColor(node.type)}`}>
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {node.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {node.type.replace('n8n-nodes-base.', '')}
                        </div>
                      </div>
                      <button
                        className="node-gear opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:bg-gray-100 rounded p-1"
                        style={{ pointerEvents: 'auto' }}
                        onClick={e => handleNodeGearClick(e, node)}
                        tabIndex={-1}
                        type="button"
                        title="Edit node settings"
                      >
                        <Gear className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      {Object.keys(node.parameters || {}).length} parameters
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node Edit Dialog */}
      <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Node: {selectedNode?.name}</DialogTitle>
            <DialogDescription>
              Modify the node parameters and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-name">Node Name</Label>
                <Input
                  id="node-name"
                  value={selectedNode.name}
                  onChange={(e) => setSelectedNode({
                    ...selectedNode,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="node-type">Node Type</Label>
                <Input
                  id="node-type"
                  value={selectedNode.type}
                  disabled
                />
              </div>

              <div>
                <Label>Parameters</Label>
                <div className="space-y-2">
                  {Object.entries(selectedNode.parameters || {}).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`param-${key}`} className="text-xs">
                        {key}
                      </Label>
                      {typeof value === 'string' && value.includes('\n') ? (
                        <Textarea
                          id={`param-${key}`}
                          value={value as string}
                          onChange={(e) => setSelectedNode({
                            ...selectedNode,
                            parameters: {
                              ...selectedNode.parameters,
                              [key]: e.target.value
                            }
                          })}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`param-${key}`}
                          value={value as string}
                          onChange={(e) => setSelectedNode({
                            ...selectedNode,
                            parameters: {
                              ...selectedNode.parameters,
                              [key]: e.target.value
                            }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedNode && handleNodeUpdate(selectedNode)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Node Settings Dialog */}
      <Dialog open={!!nodeSettings} onOpenChange={open => !open && setNodeSettings(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Node: {nodeSettings?.name}</DialogTitle>
            <DialogDescription>
              Modify the node parameters and configuration
            </DialogDescription>
          </DialogHeader>
          {nodeSettings && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-name">Node Name</Label>
                <Input
                  id="node-name"
                  value={nodeSettings.name}
                  onChange={(e) => setNodeSettings({
                    ...nodeSettings,
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="node-type">Node Type</Label>
                <Input
                  id="node-type"
                  value={nodeSettings.type}
                  disabled
                />
              </div>
              <div>
                <Label>Parameters</Label>
                <div className="space-y-2">
                  {Object.entries(nodeSettings.parameters || {}).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={`param-${key}`} className="text-xs">
                        {key}
                      </Label>
                      {typeof value === 'string' && value.includes('\n') ? (
                        <Textarea
                          id={`param-${key}`}
                          value={value as string}
                          onChange={(e) => setNodeSettings({
                            ...nodeSettings,
                            parameters: {
                              ...nodeSettings.parameters,
                              [key]: e.target.value
                            }
                          })}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`param-${key}`}
                          value={value as string}
                          onChange={(e) => setNodeSettings({
                            ...nodeSettings,
                            parameters: {
                              ...nodeSettings.parameters,
                              [key]: e.target.value
                            }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNodeSettings(null)}>
              Cancel
            </Button>
            <Button onClick={() => nodeSettings && handleNodeSettingsSave(nodeSettings)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Workflow Settings
            </DialogTitle>
            <DialogDescription>
              Edit the workflow name, description, and tags. These will be saved with your workflow.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                This name will be used in n8n and when deploying the workflow
              </p>
            </div>
            
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="workflow-tags">Tags</Label>
              <Input
                id="workflow-tags"
                value={workflowTags}
                onChange={(e) => setWorkflowTags(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., email, automation, webhook)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tags help organize and find your workflows
              </p>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Workflow Info</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Nodes: {flow.nodes.length}</div>
                <div>Connections: {Object.keys(flow.connections).length}</div>
                <div>Last Modified: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 