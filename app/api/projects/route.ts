import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/database';
import { CreateProjectData } from '@/lib/types';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectData = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 