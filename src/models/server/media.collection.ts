import { IndexType, Permission } from "node-appwrite";
import { db, mediaCollection } from "../name";
import { databases } from "./config";

export default async function createMediaCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, mediaCollection);
    // Media collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, mediaCollection, mediaCollection, [
        Permission.read("any"),
        Permission.create("any"), // Allow any user to create
        Permission.update("any"), // Allow any user to update
        Permission.delete("any"), // Allow any user to delete
      ]);
    // Media collection created successfully
    } catch {
      // Error creating media collection silently
      return;
    }
  }

  // Create attributes for SEO metadata
  try {
    await Promise.all([
      databases.createStringAttribute(db, mediaCollection, "fileId", 50, true),
      databases.createStringAttribute(db, mediaCollection, "fileName", 200, true),
      databases.createStringAttribute(db, mediaCollection, "fileUrl", 500, true),
      databases.createStringAttribute(db, mediaCollection, "mimeType", 100, true),
      databases.createStringAttribute(db, mediaCollection, "alt", 300, true),
      databases.createStringAttribute(db, mediaCollection, "description", 1000, false),
      databases.createStringAttribute(
        db,
        mediaCollection,
        "tags",
        500,
        false,
        undefined,
        true
      ),
      databases.createStringAttribute(db, mediaCollection, "title", 200, false),
      databases.createStringAttribute(db, mediaCollection, "caption", 500, false),
    ]);
    // Media collection attributes created successfully
  } catch {
    // Error creating media collection attributes silently
  }

  // Create indexes for efficient querying
  try {
    await Promise.all([
      databases.createIndex(
        db,
        mediaCollection,
        "fileId_index",
        IndexType.Unique,
        ["fileId"]
      ),
      databases.createIndex(
        db,
        mediaCollection,
        "alt_index",
        IndexType.Fulltext,
        ["alt"]
      ),
      databases.createIndex(
        db,
        mediaCollection,
        "tags_index",
        IndexType.Key,
        ["tags"]
      ),
      databases.createIndex(
        db,
        mediaCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        mediaCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
    ]);
    // Media collection indexes created successfully
  } catch {
    // Error creating media collection indexes silently
  }
} 