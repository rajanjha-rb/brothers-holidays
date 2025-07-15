import { db } from "../name";
import createBlogCollection from "./blog.collection";

import { databases } from "./config";

export default async function getOrCreateDB() {
  try {
    await databases.get(db);
    console.log("Database connection");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      await databases.create(db, db);
      console.log("database created");
       
    } catch (_error) {
      console.log("Error creating databases", _error);
    }
  }

  // Always check/create the collection
  await createBlogCollection();

  return databases;
}
