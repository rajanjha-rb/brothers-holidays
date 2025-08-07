import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    console.log('🔍 API: Deleting blog...', { id });
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Delete only the blog document - DO NOT delete the featured image
    // Images should be reusable across multiple blogs and managed separately in media library
    await databases.deleteDocument(db, blogCollection, id);
    console.log('✅ Blog deleted successfully (image preserved for reuse)');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Blog deleted successfully. Featured image preserved for reuse.' 
    });
  } catch (error) {
    console.error('API Error deleting blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete blog',
        details: error 
      },
      { status: 500 }
    );
  }
} 