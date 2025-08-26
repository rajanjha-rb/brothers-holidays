import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Destination ID is required" },
        { status: 400 }
      );
    }

    // Fetch destination from database
    const destination = await databases.getDocument(db, destinationCollection, id);

    if (!destination) {
      return NextResponse.json(
        { success: false, message: "Destination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      destination: {
        $id: destination.$id,
        title: destination.title || destination.name || "",
        slug: destination.slug || "",
        metaDescription: destination.metaDescription || destination.description || "",
        featuredImage: destination.featuredImage || "",
        tags: Array.isArray(destination.tags) ? destination.tags : [],
        $createdAt: destination.$createdAt || "",
        $updatedAt: destination.$updatedAt || ""
      }
    });
  } catch (error) {
    console.error("Error fetching destination:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('collection')) {
        return NextResponse.json(
          { success: false, message: "Destination collection not found" },
          { status: 500 }
        );
      } else if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, message: "Destination not found" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch destination" },
      { status: 500 }
    );
  }
}
