import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, activityCollection } from "@/models/name";

export async function PUT(request: NextRequest) {
  try {
    const { 
      id, 
      name, 
      slug, 
      description,
      tags, 
      featuredImage, 
      featuredImageBucket, 
      category,
      duration,
      location,
      price
    } = await request.json();

    // Validate required fields
    if (!id || !name || !slug) {
      return NextResponse.json(
        { success: false, message: "ID, name, and slug are required" },
        { status: 400 }
      );
    }

    // Update the activity
    try {
      const activityData = {
        name,
        slug,
        description: description || "",
        tags: tags || [],
        featuredImage: featuredImage || "",
        featuredImageBucket: featuredImageBucket || "",
        category: category || "",
        duration: duration || "",
        location: location || "",
        price: price || "",
        type: 'activity',
      };

      const response = await databases.updateDocument(
        db, 
        activityCollection, 
        id, 
        activityData
      );

      return NextResponse.json({
        success: true,
        activity: {
          $id: response.$id,
          name: response.name,
          slug: response.slug,
          description: response.description,
          tags: response.tags,
          featuredImage: response.featuredImage,
          featuredImageBucket: response.featuredImageBucket,
          category: response.category,
          duration: response.duration,
          location: response.location,
          price: response.price,
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Activity update error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update activity: ${error instanceof Error ? error.message : "Unknown error"}`,
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
