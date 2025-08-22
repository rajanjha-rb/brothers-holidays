import { IndexType, Permission } from "node-appwrite";
import { db, activityCollection } from "../name";

import { databases } from "./config";

export default async function createActivityCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, activityCollection);
    // Activity collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, activityCollection, activityCollection, [
        Permission.read("any"),
        Permission.create("any"), // Allow any user to create
        Permission.update("any"), // Allow any user to update
        Permission.delete("any"), // Allow any user to delete
      ]);
    // Activity collection created successfully
    } catch {
      // Error creating activity collection silently
      return;
    }
  }

  //create attributes
  try {
    await Promise.all([
      databases.createStringAttribute(db, activityCollection, "name", 200, true),
      databases.createStringAttribute(db, activityCollection, "slug", 250, true),
      databases.createStringAttribute(db, activityCollection, "description", 1000, false),
      databases.createStringAttribute(
        db,
        activityCollection,
        "tags",
        100,
        true,
        undefined,
        true
      ),
      // New optional attribute to tag documents as activity
      databases.createStringAttribute(db, activityCollection, "type", 20, false),
    ]);
    // Activity collection attributes created successfully
      } catch {
      // Error creating activity collection attributes silently
    }

  //create indexes
  try {
    await Promise.all([
      databases.createIndex(
        db,
        activityCollection,
        "name_index",
        IndexType.Fulltext,
        ["name"]
      ),
      databases.createIndex(db, activityCollection, "slug_index", IndexType.Unique, [
        "slug",
      ]),
      databases.createIndex(db, activityCollection, "tags_index", IndexType.Key, [
        "tags",
      ]),
      databases.createIndex(
        db,
        activityCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        activityCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
      // Optional index for type if used
      databases.createIndex(db, activityCollection, "type_index", IndexType.Key, [
        "type",
      ]),
    ]);
    // Activity collection indexes created successfully
      } catch {
      // Error creating activity collection attributes silently
    }
}
