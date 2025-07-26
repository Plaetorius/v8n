// TypeScript types for n8n flow
export interface N8nNode {
  id: string;
  parameters: Record<string, string | number | boolean>;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  credentials?: Record<string, unknown>;
}

export interface N8nFlow {
  name: string;
  nodes: N8nNode[];
  connections: Record<string, {
    main: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  }>;
  active: boolean;
}

// Utility functions for n8n flow manipulation
export class N8nFlowManager {
  private flow: N8nFlow;

  constructor(flow: N8nFlow) {
    this.flow = { ...flow };
  }

  // Get current flow
  getFlow(): N8nFlow {
    return { ...this.flow };
  }

  // Add a new node
  addNode(node: Omit<N8nNode, 'id'>): N8nFlow {
    const newNode: N8nNode = {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.flow.nodes.push(newNode);
    return this.getFlow();
  }

  // Update a node
  updateNode(nodeId: string, updates: Partial<N8nNode>): N8nFlow {
    this.flow.nodes = this.flow.nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    );
    return this.getFlow();
  }

  // Remove a node
  removeNode(nodeId: string): N8nFlow {
    this.flow.nodes = this.flow.nodes.filter(node => node.id !== nodeId);
    
    // Remove connections to/from this node
    const nodeName = this.flow.nodes.find(n => n.id === nodeId)?.name;
    if (nodeName) {
      delete this.flow.connections[nodeName];
      
      // Remove connections that reference this node
      Object.keys(this.flow.connections).forEach(sourceNode => {
        this.flow.connections[sourceNode].main = this.flow.connections[sourceNode].main
          .map(connectionArray => 
            connectionArray.filter(connection => connection.node !== nodeName)
          )
          .filter(connectionArray => connectionArray.length > 0);
      });
    }
    
    return this.getFlow();
  }

  // Add a connection between nodes
  addConnection(fromNodeName: string, toNodeName: string): N8nFlow {
    if (!this.flow.connections[fromNodeName]) {
      this.flow.connections[fromNodeName] = { main: [] };
    }
    
    this.flow.connections[fromNodeName].main.push([{
      node: toNodeName,
      type: "main",
      index: 0
    }]);
    
    return this.getFlow();
  }

  // Remove a connection
  removeConnection(fromNodeName: string, toNodeName: string): N8nFlow {
    if (this.flow.connections[fromNodeName]) {
      this.flow.connections[fromNodeName].main = this.flow.connections[fromNodeName].main
        .map(connectionArray => 
          connectionArray.filter(connection => connection.node !== toNodeName)
        )
        .filter(connectionArray => connectionArray.length > 0);
    }
    
    return this.getFlow();
  }

  // Update flow name
  updateFlowName(name: string): N8nFlow {
    this.flow.name = name;
    return this.getFlow();
  }

  // Get node by name
  getNodeByName(name: string): N8nNode | undefined {
    return this.flow.nodes.find(node => node.name === name);
  }

  // Get node by ID
  getNodeById(id: string): N8nNode | undefined {
    return this.flow.nodes.find(node => node.id === id);
  }

  // Get all node names
  getNodeNames(): string[] {
    return this.flow.nodes.map(node => node.name);
  }

  // Get node types
  getNodeTypes(): string[] {
    return [...new Set(this.flow.nodes.map(node => node.type))];
  }

  // Validate flow structure
  validateFlow(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.flow.name) {
      errors.push("Flow name is required");
    }
    
    if (!this.flow.nodes || this.flow.nodes.length === 0) {
      errors.push("Flow must have at least one node");
    }
    
    // Check for orphaned connections
    Object.keys(this.flow.connections).forEach(sourceNode => {
      if (!this.flow.nodes.find(n => n.name === sourceNode)) {
        errors.push(`Connection references non-existent node: ${sourceNode}`);
      }
      
      this.flow.connections[sourceNode].main.forEach(connectionArray => {
        connectionArray.forEach(connection => {
          if (!this.flow.nodes.find(n => n.name === connection.node)) {
            errors.push(`Connection references non-existent target node: ${connection.node}`);
          }
        });
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export flow as JSON
  exportFlow(): string {
    return JSON.stringify(this.flow, null, 2);
  }

  // Create a webhook node
  createWebhookNode(name: string, path: string, method: string = "POST"): N8nNode {
    return {
      id: `webhook-${Date.now()}`,
      name,
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        httpMethod: method,
        path,
        responseMode: "onReceived"
      }
    };
  }

  // Create an email node
  createEmailNode(name: string, fromEmail: string, toEmail: string, subject: string, text: string): N8nNode {
    return {
      id: `email-${Date.now()}`,
      name,
      type: "n8n-nodes-base.emailSend",
      typeVersion: 1,
      position: [500, 300],
      parameters: {
        fromEmail,
        toEmail,
        subject,
        text
      }
    };
  }

  // Create a function node
  createFunctionNode(name: string, code: string): N8nNode {
    return {
      id: `function-${Date.now()}`,
      name,
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [400, 300],
      parameters: {
        functionCode: code
      }
    };
  }
}

// Helper function to create a flow manager from existing flow
export function createFlowManager(flow: N8nFlow): N8nFlowManager {
  return new N8nFlowManager(flow);
}

// Helper function to validate n8n JSON
export function validateN8nFlow(data: unknown): data is N8nFlow {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).name === 'string' &&
    Array.isArray((data as Record<string, unknown>).nodes) &&
    typeof (data as Record<string, unknown>).connections === 'object' &&
    typeof (data as Record<string, unknown>).active === 'boolean'
  );
}

// Helper function to parse n8n JSON string
export function parseN8nFlow(jsonString: string): N8nFlow | null {
  try {
    const parsed = JSON.parse(jsonString);
    return validateN8nFlow(parsed) ? parsed : null;
  } catch {
    return null;
  }
} 