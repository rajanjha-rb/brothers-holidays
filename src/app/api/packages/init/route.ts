import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";
import createPackageCollection from "@/models/server/package.collection";

export async function POST(_request: NextRequest) {
  try {
    console.log("=== FORCE PACKAGE COLLECTION RECREATION START ===");
    
    // Try to delete the existing package collection
    try {
      console.log("Attempting to delete existing package collection...");
      await databases.deleteCollection(db, packageCollection);
      console.log("Successfully deleted existing package collection");
    } catch (deleteError) {
      console.log("Package collection doesn't exist or couldn't be deleted:", deleteError);
    }
    
    // Wait a moment for the deletion to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create the package collection with new schema
    console.log("Creating package collection with new schema...");
    await createPackageCollection();
    
    console.log("=== FORCE PACKAGE COLLECTION RECREATION COMPLETE ===");
    
    return NextResponse.json({
      success: true,
      message: "Package collection recreated successfully with new schema"
    });
  } catch (error) {
    console.error("=== FORCE PACKAGE COLLECTION RECREATION ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to recreate package collection.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
