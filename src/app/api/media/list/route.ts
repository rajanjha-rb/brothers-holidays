import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/models/server/config";
import { featuredImageBucket, mediaCollection, db } from "@/models/name";

interface MediaDocument {
  $id: string;
  fileId: string;
  alt: string;
  description: string;
  tags: string[];
  title: string;
  caption: string;
  fileUrl: string;
}

export async function GET(_request: NextRequest) {
  try {
    // Get files from storage
    const files = await storage.listFiles(featuredImageBucket);
    
    // Get metadata from database
    const metadataList = await databases.listDocuments(db, mediaCollection);
    
    // Combine storage files with metadata
    const mediaFiles = files.files.map(file => {
      const metadata = metadataList.documents.find(
        (doc) => (doc as unknown as MediaDocument).fileId === file.$id
      ) as MediaDocument | undefined;
      
      return {
        id: file.$id,
        name: file.name,
        mimeType: file.mimeType,
        createdAt: file.$createdAt,
        updatedAt: file.$updatedAt,
        alt: metadata?.alt || '',
        description: metadata?.description || '',
        tags: metadata?.tags || [],
        title: metadata?.title || '',
        caption: metadata?.caption || '',
        fileUrl: metadata?.fileUrl || `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${featuredImageBucket}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${file.$updatedAt}`,
        metadataId: metadata?.$id || null
      };
    });

    return NextResponse.json({ 
      success: true, 
      files: mediaFiles 
    });
  } catch (error) {
    console.error('Error listing media files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list media files' },
      { status: 500 }
    );
  }
} 