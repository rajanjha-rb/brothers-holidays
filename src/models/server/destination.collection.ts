import { IndexType, Permission } from "node-appwrite";
import { db, destinationCollection } from "../name";
import { databases } from "./config";

export default async function createDestinationCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, destinationCollection);
    // Destination collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, destinationCollection, destinationCollection, [
        Permission.read("any"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]);
    // Destination collection created successfully
    } catch {
      // Error creating destination collection silently
      return;
    }
  }

  // Create attributes
  try {
    await Promise.all([
      // Basic destination fields
      databases.createStringAttribute(db, destinationCollection, "title", 200, true),
      databases.createStringAttribute(db, destinationCollection, "slug", 250, true),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "metaDescription",
        500,
        true
      ),
      // Tags attribute - required array field
      databases.createStringAttribute(
        db,
        destinationCollection,
        "tags",
        100,
        true,
        undefined,
        true
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "featuredImage",
        300,
        false
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "featuredImageBucket",
        100,
        false
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "type",
        20,
        false
      ),
      // Legacy fields that might be required by existing collection
      databases.createStringAttribute(
        db,
        destinationCollection,
        "name",
        200,
        true  // Make this required for backward compatibility
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "description",
        500,
        true  // Make this required for backward compatibility
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "content",
        10000,
        false
      ),
      databases.createStringAttribute(
        db,
        destinationCollection,
        "country",
        100,
        false
      ),
      // Required field that was causing the error
      databases.createStringAttribute(
        db,
        destinationCollection,
        "associatedTrips",
        1000,
        false,
        undefined,
        true  // Make this an array attribute
      ),
    ]);
    // Destination collection attributes created successfully
  } catch {
    // Error creating destination collection attributes silently
  }

  // Create indexes
  try {
    await Promise.all([
      databases.createIndex(
        db,
        destinationCollection,
        "title_index",
        IndexType.Fulltext,
        ["title"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "name_index",
        IndexType.Fulltext,
        ["name"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "slug_index",
        IndexType.Unique,
        ["slug"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "tags_index",
        IndexType.Key,
        ["tags"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
      databases.createIndex(
        db,
        destinationCollection,
        "type_index",
        IndexType.Key,
        ["type"]
      ),
    ]);
    // Destination collection indexes created successfully
  } catch {
    // Error creating destination collection indexes silently
  }
}
