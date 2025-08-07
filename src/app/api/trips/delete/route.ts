import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    console.log('🔍 API: Deleting trip...', { id });
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Delete only the trip document - DO NOT delete the featured image
    // Images should be reusable across multiple trips and managed separately in media library
    await databases.deleteDocument(db, tripCollection, id);
    console.log('✅ Trip deleted successfully (image preserved for reuse)');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trip deleted successfully. Featured image preserved for reuse.' 
    });
  } catch (error) {
    console.error('API Error deleting trip:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete trip',
        details: error 
      },
      { status: 500 }
    );
  }
} 