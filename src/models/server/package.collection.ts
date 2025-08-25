import { IndexType, Permission } from "node-appwrite";
import { db, packageCollection } from "../name";
import { databases } from "./config";

export default async function createPackageCollection() {
  try {
    // Check if collection exists (same pattern as blogs)
    try {
      await databases.getCollection(db, packageCollection);
      // Package collection already exists
      console.log("Package collection already exists");
      return;
    } catch {
      // Create collection if it does not exist
      console.log("Creating new package collection...");
      await databases.createCollection(db, packageCollection, "Packages", [
        Permission.read("any"),
        Permission.create("any"),
        Permission.update("any"),
        Permission.delete("any"),
      ]);
      console.log("Package collection created successfully");
    }



    // Create attributes (same pattern as blogs)
    try {
      await Promise.all([
        databases.createStringAttribute(db, packageCollection, "name", 255, true),
        databases.createStringAttribute(db, packageCollection, "slug", 255, true),
        databases.createStringAttribute(db, packageCollection, "metaDescription", 160, false), // SEO meta description

        databases.createIntegerAttribute(db, packageCollection, "days", false),
        databases.createIntegerAttribute(db, packageCollection, "nights", false),
        databases.createStringAttribute(db, packageCollection, "location", 255, false),
        databases.createStringAttribute(db, packageCollection, "destinationId", 255, false),
        databases.createStringAttribute(db, packageCollection, "price", 100, false),
        databases.createStringAttribute(db, packageCollection, "overview", 65535, false),
        databases.createStringAttribute(db, packageCollection, "costInclude", 500, false, undefined, true),
        databases.createStringAttribute(db, packageCollection, "costExclude", 500, false, undefined, true),
        databases.createStringAttribute(db, packageCollection, "itinerary", 65535, false),
        databases.createStringAttribute(db, packageCollection, "featuredImage", 255, false),
        databases.createStringAttribute(db, packageCollection, "featuredImageBucket", 100, false),
        databases.createStringAttribute(db, packageCollection, "galleryImages", 255, false, undefined, true),
        databases.createStringAttribute(db, packageCollection, "tags", 100, false, undefined, true),
        databases.createStringAttribute(db, packageCollection, "faq", 65535, false),
        databases.createStringAttribute(db, packageCollection, "bestMonths", 100, false, undefined, true), // New field for best months
      ]);
      console.log("Package collection attributes created successfully");
    } catch {
      // Error creating package collection attributes silently
    }

    // Create indexes (same pattern as blogs)
    try {
      await Promise.all([
        databases.createIndex(
          db,
          packageCollection,
          "name_index",
          IndexType.Fulltext,
          ["name"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "slug_index",
          IndexType.Unique,
          ["slug"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "metaDescription_index",
          IndexType.Fulltext,
          ["metaDescription"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "tags_index",
          IndexType.Key,
          ["tags"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "destinationId_index",
          IndexType.Key,
          ["destinationId"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "days_index",
          IndexType.Key,
          ["days"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "nights_index",
          IndexType.Key,
          ["nights"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "bestMonths_index",
          IndexType.Key,
          ["bestMonths"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "created_at_index",
          IndexType.Key,
          ["$createdAt"]
        ),
        databases.createIndex(
          db,
          packageCollection,
          "updated_at_index",
          IndexType.Key,
          ["$updatedAt"]
        ),
      ]);
      console.log("Package collection indexes created successfully");
    } catch {
      // Error creating package collection indexes silently
    }

    return;
  } catch (error) {
    console.error("Error creating package collection:", error);
    // Error creating package collection silently
    return;
  }
}
