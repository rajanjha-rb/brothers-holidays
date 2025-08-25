import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      name,
      metaDescription,
      overview,
      costInclude,
      costExclude,
      itinerary,
      featuredImage,
      featuredImageBucket,
      galleryImages,
      faq,
      tags,
      days,
      nights,
      location,
      destinationId,
      price,
      bestMonths
    } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "Package ID and name are required" },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      metaDescription: metaDescription || "",
      overview: overview || "",
      costInclude: Array.isArray(costInclude) ? costInclude : [],
      costExclude: Array.isArray(costExclude) ? costExclude : [],
      // Store itinerary as JSON string since Appwrite doesn't support complex objects directly
      itinerary: Array.isArray(itinerary) ? JSON.stringify(itinerary) : "[]",
      featuredImage: featuredImage || "",
      featuredImageBucket: featuredImageBucket || "",
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      // Store FAQ as JSON string since Appwrite doesn't support complex objects directly
      faq: Array.isArray(faq) ? JSON.stringify(faq) : "[]",
      tags: Array.isArray(tags) ? tags : [],
      days: days || null,
      nights: nights || null,
      location: location || "",
      destinationId: destinationId || "",
      price: price || "",
      bestMonths: Array.isArray(bestMonths) ? bestMonths : []
    };

    const result = await databases.updateDocument(
      db,
      packageCollection,
      id,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: "Package updated successfully",
      package: {
        $id: result.$id,
        name: result.name,
        metaDescription: result.metaDescription,
        overview: result.overview,
        costInclude: result.costInclude,
        costExclude: result.costExclude,
        // Parse itinerary back to array for frontend
        itinerary: typeof result.itinerary === 'string' ? JSON.parse(result.itinerary) : result.itinerary,
        featuredImage: result.featuredImage,
        featuredImageBucket: result.featuredImageBucket,
        galleryImages: result.galleryImages,
        // Parse FAQ back to array for frontend
        faq: typeof result.faq === 'string' ? JSON.parse(result.faq) : result.faq,
        tags: result.tags,
        days: result.days,
        nights: result.nights,
        location: result.location,
        destinationId: result.destinationId,
        price: result.price,
        bestMonths: result.bestMonths || [],
        $createdAt: result.$createdAt,
        $updatedAt: result.$updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update package" },
      { status: 500 }
    );
  }
}
