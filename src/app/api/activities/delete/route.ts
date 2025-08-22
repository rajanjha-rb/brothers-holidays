import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, activityCollection } from "@/models/name";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Activity ID is required" },
        { status: 400 }
      );
    }

    try {
      await databases.deleteDocument(db, activityCollection, id);

      return NextResponse.json({
        success: true,
        message: "Activity deleted successfully",
      });
    } catch (error) {
      console.error("Activity deletion error:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to delete activity: ${error instanceof Error ? error.message : "Unknown error"}`,
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
