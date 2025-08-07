import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/models/server/config";
import { featuredImageBucket, mediaCollection, db } from "@/models/name";

interface MediaDocument {
  $id: string;
  fileId: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Delete file from storage
    await storage.deleteFile(featuredImageBucket, fileId);

    // Delete metadata from database
    try {
      const metadataList = await databases.listDocuments(db, mediaCollection);
      const metadataDoc = metadataList.documents.find((doc) => (doc as unknown as MediaDocument).fileId === fileId);
      
      if (metadataDoc) {
        await databases.deleteDocument(db, mediaCollection, metadataDoc.$id);
      }
    } catch (error) {
      console.error('Error deleting metadata:', error);
      // Continue even if metadata deletion fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 