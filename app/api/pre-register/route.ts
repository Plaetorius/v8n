import { NextRequest, NextResponse } from 'next/server';
import { createPreRegistration } from '@/lib/database';
import { CreatePreRegistrationData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePreRegistrationData = await request.json();
    
    // Basic validation
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    const preRegistration = await createPreRegistration(body);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Pre-registration submitted successfully!',
        data: preRegistration 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Pre-registration error:', error);
    return NextResponse.json(
      { error: 'Failed to submit pre-registration' },
      { status: 500 }
    );
  }
} 