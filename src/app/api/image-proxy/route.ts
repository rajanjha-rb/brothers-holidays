import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/models/client/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const fileId = searchParams.get('fileId');

    if (!bucket || !fileId) {
      return NextResponse.json({ error: 'Missing bucket or fileId parameter' }, { status: 400 });
    }

    // Get the file view URL
    const fileView = storage.getFileView(bucket, fileId);
    
    // Fetch the image
    const response = await fetch(fileView.toString());
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
} 