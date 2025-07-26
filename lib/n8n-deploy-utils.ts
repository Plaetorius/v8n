// Configuration
const N8N_BASE_URL = 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const N8N_USER = process.env.N8N_USER || '';
const N8N_PASS = process.env.N8N_PASS || '';

export interface N8nFlow {
  name: string;
  nodes: any[];
  connections: Record<string, any>;
  settings?: Record<string, any>;
  active?: boolean;
}

export interface DeployResult {
  success: boolean;
  message: string;
  workflowId?: string;
  error?: string;
  logs: string[];
  details?: {
    flowName: string;
    nodeCount: number;
    connectionCount: number;
    authMethod: string;
    n8nStatus: boolean;
  };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_API_KEY;
  } else if (N8N_USER && N8N_PASS) {
    const basic = Buffer.from(`${N8N_USER}:${N8N_PASS}`).toString('base64');
    headers['Authorization'] = `Basic ${basic}`;
  }
  
  return headers;
}

export function validateFlow(flow: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = ['name', 'nodes', 'connections'];
  
  for (const field of requiredFields) {
    if (!flow[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (!Array.isArray(flow.nodes) || flow.nodes.length === 0) {
    errors.push('Flow must have at least one node');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function checkN8nStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/healthz`, {
      headers: getAuthHeaders()
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deployToN8n(flow: N8nFlow): Promise<DeployResult> {
  const logs: string[] = [];
  
  try {
    logs.push('🚀 Starting n8n flow deployment...');
    
    // Validate the flow structure
    logs.push('📋 Validating flow structure...');
    const validation = validateFlow(flow);
    if (!validation.isValid) {
      logs.push(`❌ Validation failed: ${validation.errors.join(', ')}`);
      return {
        success: false,
        message: `Invalid flow structure: ${validation.errors.join(', ')}`,
        error: 'invalid_flow',
        logs
      };
    }
    logs.push('✅ Flow validation passed');

    // Check if n8n is running
    logs.push('🔍 Checking n8n status...');
    const isRunning = await checkN8nStatus();
    if (!isRunning) {
      logs.push('❌ n8n is not running on localhost:5678');
      logs.push('💡 Please start your n8n instance first');
      return {
        success: false,
        message: 'n8n is not running on localhost:5678. Please start your n8n instance first.',
        error: 'n8n_not_running',
        logs
      };
    }
    logs.push('✅ n8n is running');

    // Check authentication
    logs.push('🔐 Checking authentication...');
    const authMethod = N8N_API_KEY ? 'API Key' : (N8N_USER && N8N_PASS ? 'Basic Auth' : 'None');
    logs.push(`📝 Using authentication: ${authMethod}`);

    // Prepare the workflow for n8n API
    logs.push('📦 Preparing workflow for deployment...');
    const workflow = {
      name: flow.name,
      nodes: flow.nodes,
      connections: flow.connections,
      settings: flow.settings || {},
    };

    // Deploy using n8n Public API
    logs.push(`📤 Sending workflow to: ${N8N_BASE_URL}/api/v1/workflows`);
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workflow)
    });

    logs.push(`📊 Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      logs.push(`✅ Workflow created with ID: ${result.id}`);
      
      // Optionally activate the workflow
      if (flow.active) {
        logs.push('🔄 Activating workflow...');
        await activateWorkflow(result.id);
        logs.push('✅ Workflow activated');
      }
      
      logs.push('🎉 Deployment completed successfully!');
      
      return {
        success: true,
        message: `Flow "${flow.name}" deployed successfully!`,
        workflowId: result.id,
        logs,
        details: {
          flowName: flow.name,
          nodeCount: flow.nodes.length,
          connectionCount: Object.keys(flow.connections).length,
          authMethod,
          n8nStatus: true
        }
      };
    } else {
      const error = await response.text();
      logs.push(`❌ API Error: ${error}`);
      logs.push('🔍 Response headers:');
      for (const [key, value] of response.headers.entries()) {
        logs.push(`   ${key}: ${value}`);
      }
      
      return {
        success: false,
        message: `API Error: ${error}`,
        error: 'api_error',
        logs
      };
    }

  } catch (error: any) {
    logs.push(`❌ Network Error: ${error.message}`);
    return {
      success: false,
      message: `Network Error: ${error.message}`,
      error: 'network_error',
      logs
    };
  }
}

async function activateWorkflow(workflowId: string): Promise<void> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Could not activate workflow');
    }
  } catch (error) {
    console.warn('Error activating workflow:', error);
  }
}

export async function deployFlow(flow: N8nFlow): Promise<DeployResult> {
  return await deployToN8n(flow);
} 