import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/models/server/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const id = searchParams.get("id");
  
  if (!bucket || !id) {
    console.error('Missing required parameters:', { bucket, id });
    return new NextResponse("Missing bucket or id parameters", { status: 400 });
  }
  
  try {
    console.log('Fetching image preview:', { bucket, id });
    // Get the file preview URL from Appwrite
    const url = await storage.getFilePreview(bucket, id, 800, 600);
    
    if (!url) {
      console.error('Received empty URL from getFilePreview');
      return new NextResponse("Failed to generate image URL", { status: 500 });
    }
    
    console.log('Redirecting to image URL:', url);
    return NextResponse.redirect(url.toString(), 302);
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse("Failed to load image", { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}