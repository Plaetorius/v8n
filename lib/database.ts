import { createClient } from '@/lib/supabase/server';
import { Project, CreateProjectData, UpdateProjectData } from './types';

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
  
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  
  return data;
}

export async function createProject(projectData: CreateProjectData): Promise<Project> {
  const supabase = await createClient();
  
  console.log('Attempting to create project with data:', projectData);
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Test the connection first
  const { error: testError } = await supabase
    .from('projects')
    .select('count')
    .limit(1);
  
  if (testError) {
    console.error('Connection test failed:', testError);
    throw new Error(`Database connection failed: ${testError.message}`);
  }
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      status: projectData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Failed to create project: ${error.message}`);
  }
  
  console.log('Project created successfully:', data);
  return data;
}

export async function updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
  
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
} 