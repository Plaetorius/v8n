import { NextRequest, NextResponse } from 'next/server';
import { createPreRegistration } from '@/lib/database';
import { CreatePreRegistrationData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreatePreRegistrationData = await request.json();
    
    console.log('Received pre-registration data:', body);
    
    // Basic validation
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }
    
    const preRegistration = await createPreRegistration(body);
    
    console.log('Pre-registration created successfully:', preRegistration);
    
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
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.error('Detailed error information:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit pre-registration',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 