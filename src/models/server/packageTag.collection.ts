import { IndexType, Permission } from "node-appwrite";
import { db, packageTagCollection } from "../name";
import { databases } from "./config";

export default async function createPackageTagCollection() {
  try {
    // Check if collection exists
    try {
      await databases.getCollection(db, packageTagCollection);
      console.log("PackageTag collection already exists");
      return;
    } catch {
      // Create collection if it does not exist
      console.log("Creating new PackageTag collection...");
      await databases.createCollection(db, packageTagCollection, "PackageTags", [
        Permission.read("any"),
        Permission.create("any"),
        Permission.update("any"),
        Permission.delete("any"),
      ]);
      console.log("PackageTag collection created successfully");
    }

    // Create attributes
    try {
      await Promise.all([
        databases.createStringAttribute(db, packageTagCollection, "name", 255, true), // Tag name
        databases.createStringAttribute(db, packageTagCollection, "slug", 255, true), // URL-friendly tag name
        databases.createStringAttribute(db, packageTagCollection, "description", 500, false), // Tag description
        databases.createIntegerAttribute(db, packageTagCollection, "usageCount", false), // How many packages use this tag
        databases.createStringAttribute(db, packageTagCollection, "category", 100, false), // Tag category (e.g., "activity", "destination", "theme")
        databases.createStringAttribute(db, packageTagCollection, "color", 7, false), // Hex color for UI display
        databases.createStringAttribute(db, packageTagCollection, "icon", 50, false), // Icon name for UI display
        databases.createBooleanAttribute(db, packageTagCollection, "isActive", false), // Whether tag is active
        databases.createStringAttribute(db, packageTagCollection, "createdBy", 255, false), // Who created the tag
      ]);
      console.log("PackageTag collection attributes created successfully");
    } catch {
      // Error creating packageTag collection attributes silently
    }

    // Create indexes
    try {
      await Promise.all([
        databases.createIndex(
          db,
          packageTagCollection,
          "name_index",
          IndexType.Unique,
          ["name"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "slug_index",
          IndexType.Unique,
          ["slug"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "usageCount_index",
          IndexType.Key,
          ["usageCount"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "category_index",
          IndexType.Key,
          ["category"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "isActive_index",
          IndexType.Key,
          ["isActive"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "created_at_index",
          IndexType.Key,
          ["$createdAt"]
        ),
        databases.createIndex(
          db,
          packageTagCollection,
          "updated_at_index",
          IndexType.Key,
          ["$updatedAt"]
        ),
      ]);
      console.log("PackageTag collection indexes created successfully");
    } catch {
      // Error creating packageTag collection indexes silently
    }

    return;
  } catch (error) {
    console.error("Error creating PackageTag collection:", error);
    return;
  }
}


