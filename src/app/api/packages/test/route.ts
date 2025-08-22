import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log("=== PACKAGE COLLECTION TEST START ===");
    
    // Test if collection exists
    try {
      const collection = await databases.getCollection(db, packageCollection);
      console.log("Package collection found:", collection.$id);
      
      // Test if we can list documents
      const documents = await databases.listDocuments(db, packageCollection);
      console.log("Can list documents:", documents.documents.length, "found");
      
      return NextResponse.json({
        success: true,
        message: "Package collection is accessible",
        collection: {
          id: collection.$id,
          name: collection.name,
          documentCount: documents.total
        }
      });
    } catch (collectionError) {
      console.error("Package collection test failed:", collectionError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Package collection not accessible",
          error: collectionError instanceof Error ? collectionError.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("=== PACKAGE COLLECTION TEST ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to test package collection",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
