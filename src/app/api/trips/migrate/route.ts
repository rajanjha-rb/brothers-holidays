import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";
import createTripCollection from "@/models/server/trip.collection";

export async function POST(_request: NextRequest) {
  try {
    // Check if collection exists and get its current structure
    let existingCollection;
    try {
      existingCollection = await databases.getCollection(db, tripCollection);
      console.log("Existing collection found:", existingCollection);
    } catch {
      console.log("No existing collection found, creating new one");
      await createTripCollection();
      return NextResponse.json({
        success: true,
        message: "Trip collection created successfully",
      });
    }

    // If collection exists, check if it has unwanted attributes
    const attributes = existingCollection.attributes || [];
    const hasContentAttribute = attributes.some((attr: { key: string }) => attr.key === "content");
    const hasDescriptionAttribute = attributes.some((attr: { key: string }) => attr.key === "description");
    const hasTitleAttribute = attributes.some((attr: { key: string }) => attr.key === "title");
    
    if (hasContentAttribute || hasDescriptionAttribute || hasTitleAttribute) {
      console.log("Collection has old attributes, recreating...");
      
      // Get all existing documents first
      const existingDocs = await databases.listDocuments(db, tripCollection);
      console.log(`Found ${existingDocs.documents.length} existing documents`);
      
      // Delete the old collection
      await databases.deleteCollection(db, tripCollection);
      console.log("Old collection deleted");
      
      // Create new collection with correct structure
      await createTripCollection();
      console.log("New collection created");
      
      // Migrate existing documents to new structure
      for (const doc of existingDocs.documents) {
        const docData = doc as unknown as { 
          title?: string; 
          name?: string; 
          slug?: string; 
          tags?: string[]; 
          featuredImage?: string; 
          featuredImageBucket?: string; 
          difficulty?: string; 
        };
        
        const migratedData = {
          name: docData.title || docData.name || "Untitled Trip",
          slug: docData.slug || "",
          tags: docData.tags || [],
          featuredImage: docData.featuredImage || "",
          featuredImageBucket: docData.featuredImageBucket || "",
          difficulty: docData.difficulty || "Easy",
        };
        
        try {
          await databases.createDocument(db, tripCollection, doc.$id, migratedData);
          console.log(`Migrated document: ${doc.$id}`);
        } catch (error) {
          console.error(`Failed to migrate document ${doc.$id}:`, error);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Trip collection migrated successfully. ${existingDocs.documents.length} documents migrated.`,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Trip collection is already up to date",
      });
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
} 