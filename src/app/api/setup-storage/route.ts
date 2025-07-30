import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/models/server/config';
import { featuredImageBucket } from '@/models/name';
import { Permission } from 'node-appwrite';

export async function POST(_request: NextRequest) {
  try {
    console.log('Attempting to create storage bucket:', featuredImageBucket);
    
    // Try to create the bucket
    const bucket = await storage.createBucket(
      featuredImageBucket,
      featuredImageBucket,
      [
        Permission.create("users"),
        Permission.read("any"),
        Permission.update("users"),
        Permission.delete("users"),
      ],
      false,
      undefined,
      undefined,
      ["jpg", "png", "gif", "jpeg", "webp", "heic"]
    );

    console.log('Storage bucket created successfully:', bucket.$id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket created successfully',
      bucketId: bucket.$id 
    });
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    
    // Check if bucket already exists
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Storage bucket already exists' 
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      },
      { status: 500 }
    );
  }
} 