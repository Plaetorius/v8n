export interface Project {
  id: string;
  name: string;
  description?: string;
  workflow_json?: any;
  created_at: string;
  updated_at: string;
  prompt?: string;
  status: 'draft' | 'deployed' | 'archived';
  deployed_webhook_url?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  prompt?: string;
  status?: 'draft' | 'deployed' | 'archived';
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  workflow_json?: any;
  prompt?: string;
  status?: 'draft' | 'deployed' | 'archived';
  deployed_webhook_url?: string;
} 