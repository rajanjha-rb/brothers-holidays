import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";
import { ID } from "node-appwrite";
import createDestinationCollection from "@/models/server/destination.collection";

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      slug, 
      metaDescription, 
      featuredImage, 
      featuredImageBucket,
      associatedTrip,
      tags
    } = await request.json();

    // Validate required fields
    if (!title || !slug || !metaDescription) {
      return NextResponse.json(
        { success: false, message: "Title, slug, and meta description are required" },
        { status: 400 }
      );
    }

    // Ensure the destination collection exists (without deleting/recreating)
    try {
      await databases.getCollection(db, destinationCollection);
    } catch {
      await createDestinationCollection();
    }

    // Create the new destination
    try {
      const destinationData = {
        title,
        slug,
        metaDescription,
        featuredImage: featuredImage || "",
        featuredImageBucket: featuredImageBucket || "",
        associatedTrips: associatedTrip ? [associatedTrip] : [], // Convert single trip to array for DB compatibility
        tags: tags || [], // Add the required tags field
        type: 'destination',
        // Add legacy fields for backward compatibility
        name: title, // Map title to name for backward compatibility
        description: metaDescription, // Map metaDescription to description
        content: metaDescription, // Use metaDescription as content fallback
        country: "", // Add empty country field
      };

      const response = await databases.createDocument(
        db, 
        destinationCollection, 
        ID.unique(), 
        destinationData
      );

      return NextResponse.json({
        success: true,
        destination: {
          $id: response.$id,
          title: response.title,
          slug: response.slug,
          metaDescription: response.metaDescription,
          featuredImage: featuredImage || "",
          featuredImageBucket: featuredImageBucket || "",
          $createdAt: response.$createdAt,
          $updatedAt: response.$updatedAt,
        },
      });
    } catch (error) {
      console.error("Destination creation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create destination: ${error instanceof Error ? error.message : "Unknown error"}`,
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
