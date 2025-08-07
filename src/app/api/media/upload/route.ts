import { NextRequest, NextResponse } from "next/server";
import { storage, databases } from "@/models/server/config";
import { featuredImageBucket, mediaCollection, db } from "@/models/name";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const title = formData.get('title') as string;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!alt || alt.trim() === '') {
      return NextResponse.json({ success: false, error: "Alt text is required" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 });
    }

    // Upload file to Appwrite storage
    const uploadedFile = await storage.createFile(
      featuredImageBucket,
      'unique()',
      file
    );

    // Generate file URL with cache-busting
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${featuredImageBucket}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${uploadedFile.$createdAt}`;

    // Save metadata to database
    const metadata = {
      fileId: uploadedFile.$id,
      fileName: uploadedFile.name,
      fileUrl: fileUrl,
      mimeType: uploadedFile.mimeType,
      alt: alt.trim(),
      description: description?.trim() || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      title: title?.trim() || '',
      caption: caption?.trim() || ''
    };

    // Save to media collection
    const savedMetadata = await databases.createDocument(
      db,
      mediaCollection,
      'unique()',
      metadata
    );

    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.$id,
        name: uploadedFile.name,
        createdAt: uploadedFile.$createdAt,
        ...metadata,
        metadataId: savedMetadata.$id
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to upload file" 
    }, { status: 500 });
  }
} 