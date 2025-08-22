import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";

export async function PUT(request: NextRequest) {
  try {
    const { 
      id,
      title, 
      slug, 
      metaDescription, 
      featuredImage, 
      featuredImageBucket
    } = await request.json();

    // Validate required fields
    if (!id || !title || !slug || !metaDescription) {
      return NextResponse.json(
        { success: false, message: "ID, title, slug, and meta description are required" },
        { status: 400 }
      );
    }

    // Update the destination
    try {
      const destinationData = {
        title,
        slug,
        metaDescription,
        featuredImage: featuredImage || "",
        featuredImageBucket: featuredImageBucket || "",
        type: 'destination',
      };

      const response = await databases.updateDocument(
        db, 
        destinationCollection, 
        id, 
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
      console.error("Destination update error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to update destination: ${error instanceof Error ? error.message : "Unknown error"}`,
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
