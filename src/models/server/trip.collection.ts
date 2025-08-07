import { IndexType, Permission } from "node-appwrite";
import { db, tripCollection } from "../name";

import { databases } from "./config";

export default async function createTripCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, tripCollection);
    // Trip collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, tripCollection, tripCollection, [
        Permission.read("any"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]);
    // Trip collection created successfully
    } catch {
      // Error creating trip collection silently
      return;
    }
  }

  //create attributes
  try {
    await Promise.all([
      databases.createStringAttribute(db, tripCollection, "name", 200, true),
      databases.createStringAttribute(db, tripCollection, "slug", 250, true),
      databases.createStringAttribute(
        db,
        tripCollection,
        "tags",
        100,
        true,
        undefined,
        true
      ),
      databases.createStringAttribute(
        db,
        tripCollection,
        "featuredImage",
        300,
        false
      ),
      databases.createStringAttribute(
        db,
        tripCollection,
        "featuredImageBucket",
        100,
        false
      ),
      databases.createStringAttribute(
        db,
        tripCollection,
        "difficulty",
        50,
        false
      ),
      // New optional attribute to tag documents as trip
      databases.createStringAttribute(db, tripCollection, "type", 20, false),
    ]);
    // Trip collection attributes created successfully
      } catch {
      // Error creating trip collection attributes silently
    }

  //create indexes
  try {
    await Promise.all([
      databases.createIndex(
        db,
        tripCollection,
        "name_index",
        IndexType.Fulltext,
        ["name"]
      ),
      databases.createIndex(db, tripCollection, "slug_index", IndexType.Unique, [
        "slug",
      ]),
      databases.createIndex(db, tripCollection, "tags_index", IndexType.Key, [
        "tags",
      ]),
      databases.createIndex(
        db,
        tripCollection,
        "difficulty_index",
        IndexType.Key,
        ["difficulty"]
      ),
      databases.createIndex(
        db,
        tripCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        tripCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
      // Optional index for type if used
      databases.createIndex(db, tripCollection, "type_index", IndexType.Key, [
        "type",
      ]),
    ]);
    // Trip collection indexes created successfully
      } catch {
      // Error creating trip collection indexes silently
    }
} 