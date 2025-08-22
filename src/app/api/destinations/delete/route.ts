import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    console.log('🔍 API: Deleting destination...', { id });
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Destination ID is required' },
        { status: 400 }
      );
    }

    // Delete only the destination document - DO NOT delete the featured image
    // Images should be reusable across multiple destinations and managed separately in media library
    await databases.deleteDocument(db, destinationCollection, id);
    console.log('✅ Destination deleted successfully (image preserved for reuse)');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Destination deleted successfully. Featured image preserved for reuse.' 
    });
  } catch (error) {
    console.error('API Error deleting destination:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete destination',
        details: error 
      },
      { status: 500 }
    );
  }
}
