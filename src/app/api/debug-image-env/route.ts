import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_APPWRITE_HOST_URL: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    };
    
    const sampleImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/sample/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    
    console.log('🔍 Debug Image Environment:', {
      envVars,
      sampleImageUrl
    });
    
    return NextResponse.json({ 
      success: true, 
      environment: envVars,
      sampleImageUrl,
      hasAllRequired: !!(envVars.NEXT_PUBLIC_APPWRITE_HOST_URL && envVars.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    });
  } catch (error) {
    console.error('Debug image environment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 