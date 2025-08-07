import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/featuredImage/files/test/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
    
    console.log('🔍 Testing image URL:', imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      env: {
        hostUrl: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      }
    });
  } catch (error) {
    console.error('Error testing image URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 