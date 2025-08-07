import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";
import { ID } from "node-appwrite";
import createTripCollection from "@/models/server/trip.collection";

export async function POST(request: NextRequest) {
  try {
    const { name, slug, tags, featuredImage, featuredImageBucket, difficulty } = await request.json();

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Ensure the trip collection exists (without deleting/recreating)
    try {
      await databases.getCollection(db, tripCollection);
    } catch {
      await createTripCollection();
    }

    // Create the new trip
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

      const response = await databases.createDocument(
        db, 
        tripCollection, 
        ID.unique(), 
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
      console.error("Trip creation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create trip: ${error instanceof Error ? error.message : "Unknown error"}`,
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