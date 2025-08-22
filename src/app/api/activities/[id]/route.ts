import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, activityCollection } from "@/models/name";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Activity ID is required" },
        { status: 400 }
      );
    }

    try {
      const response = await databases.getDocument(db, activityCollection, id);

      return NextResponse.json({
        success: true,
        activity: {
          $id: response.$id,
          name: response.name,
          slug: response.slug,
          description: response.description,
          featuredImage: response.featuredImage,
          tags: response.tags,
          category: response.category,
          duration: response.duration,
          location: response.location,
          price: response.price,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Activity fetch error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch activity: ${error instanceof Error ? error.message : "Unknown error"}`,
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
