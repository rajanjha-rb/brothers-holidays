import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_APPWRITE_HOST_URL: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      APPWRITE_API_KEY_LENGTH: process.env.APPWRITE_API_KEY?.length || 0,
      APPWRITE_API_KEY_START: process.env.APPWRITE_API_KEY?.substring(0, 20) || 'N/A',
      APPWRITE_API_KEY_END: process.env.APPWRITE_API_KEY?.substring(-20) || 'N/A'
    };

    const hasAllRequired = !!(
      envVars.NEXT_PUBLIC_APPWRITE_HOST_URL &&
      envVars.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
      envVars.APPWRITE_API_KEY !== 'NOT SET' &&
      envVars.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    );

    return NextResponse.json({
      success: true,
      environment: envVars,
      hasAllRequired,
      message: hasAllRequired ? 'All required environment variables are set' : 'Missing required environment variables'
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
} 