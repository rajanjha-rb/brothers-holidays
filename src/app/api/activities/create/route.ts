import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, activityCollection } from "@/models/name";
import { ID } from "node-appwrite";
import createActivityCollection from "@/models/server/activity.collection";

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      slug, 
      description,
      tags
    } = await request.json();

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Ensure the activity collection exists (without deleting/recreating)
    try {
      await databases.getCollection(db, activityCollection);
    } catch {
      await createActivityCollection();
    }

    // Create the new activity
    try {
      const activityData = {
        name,
        slug,
        description: description || "",
        tags: tags || [],
        type: 'activity',
      };

      const response = await databases.createDocument(
        db, 
        activityCollection, 
        ID.unique(), 
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
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Activity creation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create activity: ${error instanceof Error ? error.message : "Unknown error"}`,
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
