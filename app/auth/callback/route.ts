import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  console.log('🔄 OAuth callback route handler called');
  console.log('📍 Origin:', origin);
  console.log('📋 Search params:', Object.fromEntries(searchParams.entries()));
  
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/projects'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/projects'
  }

  // Handle OAuth errors
  if (error) {
    console.error('❌ OAuth error from GitHub:', error, error_description);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    console.log('🔑 Exchanging code for session...');
    
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('📦 Code exchange result:');
    console.log('  - Success:', !exchangeError);
    console.log('  - Error:', exchangeError);
    console.log('  - Session:', data.session ? 'Present' : 'None');
    console.log('  - User ID:', data.session?.user?.id);
    
    if (!exchangeError && data.session) {
      console.log('✅ Session established successfully');
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        console.log('🚀 Redirecting to:', `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        console.log('🚀 Redirecting to:', `https://${forwardedHost}${next}`);
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        console.log('🚀 Redirecting to:', `${origin}${next}`);
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('❌ Failed to exchange code for session:', exchangeError);
    }
  }

  // return the user to an error page with instructions
  console.warn('⚠️ No code found or exchange failed, redirecting to auth with error');
  return NextResponse.redirect(`${origin}/auth?error=Authentication failed`)
} 