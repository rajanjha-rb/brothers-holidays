import { IndexType, Permission } from "node-appwrite";
import { db, blogCollection } from "../name";

import { databases } from "./config";

export default async function createBlogCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, blogCollection);
    console.log("Blog collection already exists");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, blogCollection, blogCollection, [
        Permission.read("any"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]);
      console.log("Blog collection created successfully");
    } catch (createError) {
      console.error("Error creating blog collection:", createError);
      return;
    }
  }

  //create attributes
  try {
    await Promise.all([
      databases.createStringAttribute(db, blogCollection, "title", 200, true),
      databases.createStringAttribute(
        db,
        blogCollection,
        "description",
        500,
        true
      ),
      databases.createStringAttribute(db, blogCollection, "slug", 250, true),
      databases.createStringAttribute(db, blogCollection, "content", 10000, true),
      databases.createStringAttribute(
        db,
        blogCollection,
        "tags",
        100,
        true,
        undefined,
        true
      ),
      databases.createStringAttribute(
        db,
        blogCollection,
        "featuredImage",
        300,
        false
      ),
      databases.createStringAttribute(
        db,
        blogCollection,
        "featuredImageBucket",
        100,
        false
      ),
    ]);
    console.log("Blog collection attributes created successfully");
  } catch (attrError) {
    console.error("Error creating blog collection attributes:", attrError);
  }

  //create indexes
  try {
    await Promise.all([
      databases.createIndex(
        db,
        blogCollection,
        "title_index",
        IndexType.Fulltext,
        ["title"]
      ),
      databases.createIndex(db, blogCollection, "slug_index", IndexType.Unique, [
        "slug",
      ]),
      databases.createIndex(db, blogCollection, "tags_index", IndexType.Key, [
        "tags",
      ]),
      databases.createIndex(
        db,
        blogCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        blogCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
    ]);
    console.log("Blog collection indexes created successfully");
  } catch (indexError) {
    console.error("Error creating blog collection indexes:", indexError);
  }
}
