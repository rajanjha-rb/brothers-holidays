import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    const result = await databases.listDocuments(
      db,
      packageCollection,
      []
    );

    const packages = result.documents.map((doc) => ({
      $id: doc.$id,
      name: doc.name,
      overview: doc.overview,
      costInclude: doc.costInclude || [], // Already an array
      costExclude: doc.costExclude || [], // Already an array
      // Parse itinerary from JSON string back to array
      itinerary: typeof doc.itinerary === 'string' ? JSON.parse(doc.itinerary) : (doc.itinerary || []),
      featuredImage: doc.featuredImage,
      featuredImageBucket: doc.featuredImageBucket,
      galleryImages: doc.galleryImages || [], // Already an array
      // Parse FAQ from JSON string back to array
      faq: typeof doc.faq === 'string' ? JSON.parse(doc.faq) : (doc.faq || []),
      tags: doc.tags || [], // Already an array
      duration: doc.duration,
      location: doc.location,
      price: doc.price,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));

    return NextResponse.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
