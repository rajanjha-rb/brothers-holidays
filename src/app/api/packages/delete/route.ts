import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Package ID is required" },
        { status: 400 }
      );
    }

    await databases.deleteDocument(
      db,
      packageCollection,
      id
    );

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete package" },
      { status: 500 }
    );
  }
}
