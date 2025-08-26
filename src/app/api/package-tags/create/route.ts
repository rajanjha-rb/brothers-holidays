import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageTagCollection } from "@/models/name";
import { ID } from "node-appwrite";
import slugify from "@/app/utils/slugify";

export async function POST(request: NextRequest) {
  try {
    console.log("=== PACKAGE TAG CREATION DEBUG START ===");
    
    // Ensure the packageTag collection exists
    try {
      await databases.getCollection(db, packageTagCollection);
      console.log("PackageTag collection exists, proceeding...");
    } catch {
      console.log("PackageTag collection not found, creating it...");
      const createPackageTagCollection = await import("@/models/server/packageTag.collection");
      await createPackageTagCollection.default();
      console.log("PackageTag collection created successfully");
    }
    
    const requestBody = await request.json();
    console.log("Request body:", requestBody);
    
    const {
      name,
      description,
      category,
      color,
      icon,
      createdBy
    } = requestBody;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Tag name is required" },
        { status: 400 }
      );
    }

    // Check if tag already exists
    try {
      const existingTags = await databases.listDocuments(db, packageTagCollection, [
        `name = "${name.trim()}"`
      ]);
      
      if (existingTags.documents.length > 0) {
        return NextResponse.json(
          { success: false, message: "Tag with this name already exists" },
          { status: 409 }
        );
      }
    } catch {
      console.log("No existing tags found, proceeding...");
    }

    const tagData = {
      name: name.trim(),
      slug: slugify(name.trim()),
      description: description?.trim() || "",
      usageCount: 0,
      category: category || "general",
      color: color || "#3B82F6", // Default blue color
      icon: icon || "tag",
      isActive: true,
      createdBy: createdBy || "system"
    };

    console.log("Tag data prepared:", tagData);

    const result = await databases.createDocument(
      db,
      packageTagCollection,
      ID.unique(),
      tagData
    );

    console.log("Tag created successfully:", result.$id);
    
    const responseData = {
      success: true,
      message: "Package tag created successfully",
      tag: {
        $id: result.$id,
        name: result.name,
        slug: result.slug,
        description: result.description,
        usageCount: result.usageCount,
        category: result.category,
        color: result.color,
        icon: result.icon,
        isActive: result.isActive,
        createdBy: result.createdBy,
        $createdAt: result.$createdAt,
        $updatedAt: result.$updatedAt
      }
    };

    console.log("=== PACKAGE TAG CREATION DEBUG END ===");
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("=== PACKAGE TAG CREATION ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to create package tag" },
      { status: 500 }
    );
  }
}
