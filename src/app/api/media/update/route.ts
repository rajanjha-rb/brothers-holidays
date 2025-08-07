import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { mediaCollection, db } from "@/models/name";

interface MediaDocument {
  $id: string;
  fileId: string;
  alt: string;
  description: string;
  tags: string[];
  title: string;
  caption: string;
}

export async function PUT(request: NextRequest) {
  try {
    const { fileId, alt, description, tags, title, caption } = await request.json();

    if (!fileId) {
      return NextResponse.json({ success: false, error: "File ID is required" }, { status: 400 });
    }

    if (!alt || alt.trim() === '') {
      return NextResponse.json({ success: false, error: "Alt text is required" }, { status: 400 });
    }

    // Find the metadata document for this file
    const metadataList = await databases.listDocuments(db, mediaCollection);
    const metadataDoc = metadataList.documents.find((doc) => (doc as unknown as MediaDocument).fileId === fileId);

    if (!metadataDoc) {
      return NextResponse.json({ success: false, error: "Metadata not found for this file" }, { status: 404 });
    }

    // Update the metadata
    const updatedMetadata = {
      alt: alt.trim(),
      description: description?.trim() || '',
      tags: tags || [],
      title: title?.trim() || '',
      caption: caption?.trim() || ''
    };

    const updatedDoc = await databases.updateDocument(
      db,
      mediaCollection,
      metadataDoc.$id,
      updatedMetadata
    );

    return NextResponse.json({
      success: true,
      message: "File metadata updated successfully",
      metadata: updatedDoc
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update file metadata" 
    }, { status: 500 });
  }
} 