import { NextRequest, NextResponse } from "next/server";
import createActivityCollection from "@/models/server/activity.collection";

export async function POST(_request: NextRequest) {
  try {
    console.log('🔧 Initializing activities collection...');
    
    // Create the activities collection with proper schema
    await createActivityCollection();
    
    console.log('✅ Activities collection initialized successfully');
    
    return NextResponse.json({
      success: true,
      message: "Activities collection initialized successfully",
    });
  } catch (error) {
    console.error("Activities collection initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to initialize activities collection: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
