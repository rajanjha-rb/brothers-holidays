import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";

export async function PUT(request: NextRequest) {
  try {
    const { id, name, slug, tags, featuredImage, featuredImageBucket, difficulty } = await request.json();

    // Validate required fields
    if (!id || !name || !slug) {
      return NextResponse.json(
        { success: false, message: "ID, name, and slug are required" },
        { status: 400 }
      );
    }

    // Update the trip
    try {
      const tripData = {
        name,
        slug,
        tags: tags || [],
        featuredImage: featuredImage || "",
        featuredImageBucket: featuredImageBucket || "",
        difficulty: difficulty || "Easy",
        type: 'trip',
      };

      const response = await databases.updateDocument(
        db, 
        tripCollection, 
        id, 
        tripData
      );

      return NextResponse.json({
        success: true,
        trip: {
          $id: response.$id,
          name: response.name,
          slug: response.slug,
          tags: response.tags,
          featuredImage: response.featuredImage,
          featuredImageBucket: response.featuredImageBucket,
          difficulty: response.difficulty,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Trip update error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update trip: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
