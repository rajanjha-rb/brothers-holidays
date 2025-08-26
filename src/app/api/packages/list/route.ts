import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 API: Fetching packages...');
    
    const result = await databases.listDocuments(
      db,
      packageCollection,
      []
    );

    console.log('API Response total:', result.total);
    console.log('API Response documents:', result.documents.length);
    
    const packages = result.documents.map((doc, index) => {
      try {
        console.log(`Processing package ${index + 1}:`, doc.$id);
        
        // Parse itinerary from JSON string back to array
        let itinerary = [];
        try {
          if (typeof doc.itinerary === 'string') {
            itinerary = JSON.parse(doc.itinerary);
          } else if (Array.isArray(doc.itinerary)) {
            itinerary = doc.itinerary;
          }
        } catch (parseError) {
          console.error(`Error parsing itinerary for package ${doc.$id}:`, parseError);
          itinerary = [];
        }

        // Parse FAQ from JSON string back to array
        let faq = [];
        try {
          if (typeof doc.faq === 'string') {
            faq = JSON.parse(doc.faq);
          } else if (Array.isArray(doc.faq)) {
            faq = doc.faq;
          }
        } catch (parseError) {
          console.error(`Error parsing FAQ for package ${doc.$id}:`, parseError);
          faq = [];
        }

        return {
          $id: doc.$id || `package-${index}`,
          name: doc.name || "",
          overview: doc.overview || "",
          costInclude: Array.isArray(doc.costInclude) ? doc.costInclude : [],
          costExclude: Array.isArray(doc.costExclude) ? doc.costExclude : [],
          itinerary: itinerary,
          featuredImage: doc.featuredImage || "",
          featuredImageBucket: doc.featuredImageBucket || "",
          galleryImages: Array.isArray(doc.galleryImages) ? doc.galleryImages : [],
          faq: faq,
          tags: Array.isArray(doc.tags) ? doc.tags : [],
          days: doc.days || null,
          nights: doc.nights || null,
          location: doc.location || "",
          destinationId: doc.destinationId || "",
          price: doc.price || "",
          bestMonths: Array.isArray(doc.bestMonths) ? doc.bestMonths : [],
          $createdAt: doc.$createdAt || new Date().toISOString(),
          $updatedAt: doc.$updatedAt || new Date().toISOString()
        };
      } catch (packageError) {
        console.error(`Error processing package ${doc.$id}:`, packageError);
        // Return a minimal package object to prevent complete failure
        return {
          $id: doc.$id || `package-${index}`,
          name: doc.name || "Error Loading Package",
          overview: "Error loading package details",
          costInclude: [],
          costExclude: [],
          itinerary: [],
          featuredImage: "",
          featuredImageBucket: "",
          galleryImages: [],
          faq: [],
          tags: [],
          days: null,
          nights: null,
          location: "",
          destinationId: "",
          price: "",
          bestMonths: [],
          $createdAt: doc.$createdAt || new Date().toISOString(),
          $updatedAt: doc.$updatedAt || new Date().toISOString()
        };
      }
    });

    console.log('API Mapped packages:', packages.length);
    
    return NextResponse.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
