import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_APPWRITE_HOST_URL: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY ? 'SET' : 'NOT SET',
    };
    
    console.log('🔍 Environment Test:', envVars);
    
    return NextResponse.json({ 
      success: true, 
      environment: envVars,
      hasAllRequired: !!(envVars.NEXT_PUBLIC_APPWRITE_HOST_URL && envVars.NEXT_PUBLIC_APPWRITE_PROJECT_ID && envVars.APPWRITE_API_KEY !== 'NOT SET')
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 