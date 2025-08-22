import { NextRequest, NextResponse } from "next/server";
import getOrCreateDB from "@/models/server/dbSetup";

export async function POST(_request: NextRequest) {
  try {
    console.log("=== DATABASE INITIALIZATION START ===");
    
    // Initialize database and collections
    await getOrCreateDB();
    
    console.log("=== DATABASE INITIALIZATION COMPLETE ===");
    
    return NextResponse.json({
      success: true,
      message: "Database and collections initialized successfully",
      result: "Database setup completed"
    });
  } catch (error) {
    console.error("=== DATABASE INITIALIZATION ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to initialize database. Some collections may not be available.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("=== DATABASE STATUS CHECK ===");
    
    // Initialize database and collections
    await getOrCreateDB();
    
    console.log("=== DATABASE STATUS CHECK COMPLETE ===");
    
    return NextResponse.json({
      success: true,
      message: "Database and collections are ready",
      status: "healthy"
    });
  } catch (error) {
    console.error("=== DATABASE STATUS CHECK ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Database has issues. Some collections may not be available.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 

export async function DELETE() {
  try {
    console.log("=== FORCE DATABASE REINITIALIZATION START ===");
    
    // Import the package collection creator directly
    const { databases } = await import("@/models/server/config");
    const { db, packageCollection } = await import("@/models/name");
    
    // Try to delete the existing package collection
    try {
      console.log("Attempting to delete existing package collection...");
      await databases.deleteCollection(db, packageCollection);
      console.log("Successfully deleted existing package collection");
    } catch (deleteError) {
      console.log("Package collection doesn't exist or couldn't be deleted:", deleteError);
    }
    
    // Wait a moment for the deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reinitialize database and collections
    console.log("Reinitializing database with new schema...");
    await getOrCreateDB();
    
    console.log("=== FORCE DATABASE REINITIALIZATION COMPLETE ===");
    
    return NextResponse.json({
      success: true,
      message: "Database and collections force reinitialized successfully",
      result: "Database setup completed with fresh collections"
    });
  } catch (error) {
    console.error("=== FORCE DATABASE REINITIALIZATION ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to force reinitialize database.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 