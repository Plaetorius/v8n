import { NextRequest, NextResponse } from 'next/server';
import { deployFlow, N8nFlow } from '@/lib/n8n-deploy-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const flow: N8nFlow = body.flow;
    
    if (!flow) {
      return NextResponse.json({ error: 'Missing flow data' }, { status: 400 });
    }

    // Deploy the flow using our utility
    const result = await deployFlow(flow);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        workflowId: result.workflowId,
        logs: result.logs,
        details: result.details
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.message,
        errorType: result.error,
        logs: result.logs
      }, { status: 500 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error',
              logs: [`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`]
    }, { status: 500 });
  }
} 