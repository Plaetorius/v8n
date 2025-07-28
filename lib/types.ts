export interface Project {
  id: string;
  name: string;
  description?: string;
  workflow_json?: unknown;
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
  workflow_json?: unknown;
  prompt?: string;
  status?: 'draft' | 'deployed' | 'archived';
  deployed_webhook_url?: string;
}

export interface PreRegistration {
  id: string;
  email: string;
  name?: string;
  company?: string;
  use_case?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CreatePreRegistrationData {
  email: string;
  name?: string;
  company?: string;
  use_case?: string;
} 