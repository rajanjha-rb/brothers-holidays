import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageTagCollection } from "@/models/name";

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Fetching package tags...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const queries = [];
    
    // Filter by category if specified
    if (category) {
      queries.push(`category = "${category}"`);
    }
    
    // Filter by active status if specified
    if (activeOnly) {
      queries.push('isActive = true');
    }
    
    const result = await databases.listDocuments(
      db,
      packageTagCollection,
      queries
    );

    console.log('API Response total:', result.total);
    console.log('API Response documents:', result.documents.length);
    
    const tags = result.documents.map((doc) => ({
      $id: doc.$id,
      name: doc.name || "",
      slug: doc.slug || "",
      description: doc.description || "",
      usageCount: doc.usageCount || 0,
      category: doc.category || "general",
      color: doc.color || "#3B82F6",
      icon: doc.icon || "tag",
      isActive: doc.isActive !== false,
      createdBy: doc.createdBy || "system",
      $createdAt: doc.$createdAt || new Date().toISOString(),
      $updatedAt: doc.$updatedAt || new Date().toISOString()
    }));

    // Sort by usage count (most used first) and then by name
    tags.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return a.name.localeCompare(b.name);
    });

    console.log('API Mapped tags:', tags.length);
    
    return NextResponse.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error("Error fetching package tags:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch package tags", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
