import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(_request: NextRequest) {
  try {
    // Revalidate the blogs page
    revalidatePath('/blogs');
    
    return NextResponse.json({
      success: true,
      message: 'Blogs page revalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error revalidating blogs page:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to revalidate blogs page' 
      },
      { status: 500 }
    );
  }
} 