import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Package ID is required" },
        { status: 400 }
      );
    }

    const result = await databases.getDocument(
      db,
      packageCollection,
      id
    );

    // Parse the package data to handle JSON strings properly
    const packageData = {
      $id: result.$id,
      name: result.name,
      overview: result.overview,
      costInclude: result.costInclude || [],
      costExclude: result.costExclude || [],
      // Parse itinerary from JSON string back to array
      itinerary: (() => {
        try {
          if (typeof result.itinerary === 'string') {
            return JSON.parse(result.itinerary);
          }
          return Array.isArray(result.itinerary) ? result.itinerary : [];
        } catch {
          return [];
        }
      })(),
      featuredImage: result.featuredImage,
      featuredImageBucket: result.featuredImageBucket,
      galleryImages: result.galleryImages || [],
      // Parse FAQ from JSON string back to array
      faq: (() => {
        try {
          if (typeof result.faq === 'string') {
            return JSON.parse(result.faq);
          }
          return Array.isArray(result.faq) ? result.faq : [];
        } catch {
          return [];
        }
      })(),
      tags: result.tags || [],
      duration: result.duration,
      location: result.location,
      price: result.price,
      $createdAt: result.$createdAt,
      $updatedAt: result.$updatedAt
    };

    return NextResponse.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    
    if (error instanceof Error && error.message.includes('Document not found')) {
      return NextResponse.json(
        { success: false, message: "Package not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch package" },
      { status: 500 }
    );
  }
}
