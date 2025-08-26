import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, metaDescription } = body;

    if (!title || !slug || !metaDescription) {
      return NextResponse.json(
        { success: false, message: "Title, slug, and metaDescription are required" },
        { status: 400 }
      );
    }

    // Create a test destination
    const destination = await databases.createDocument(db, destinationCollection, "unique()", {
      title,
      slug,
      metaDescription,
      type: "destination",
      featuredImage: "",
      tags: []
    });

    return NextResponse.json({
      success: true,
      destination: {
        $id: destination.$id,
        title: destination.title,
        slug: destination.slug,
        metaDescription: destination.metaDescription,
        type: destination.type,
        $createdAt: destination.$createdAt,
        $updatedAt: destination.$updatedAt
      }
    });
  } catch (error) {
    console.error("Error creating test destination:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create test destination" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // List all destinations
    const response = await databases.listDocuments(db, destinationCollection);
    
    return NextResponse.json({
      success: true,
      destinations: response.documents,
      total: response.total
    });
  } catch (error) {
    console.error("Error listing destinations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list destinations" },
      { status: 500 }
    );
  }
}
