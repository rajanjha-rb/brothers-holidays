import { db } from "../name";
import createBlogCollection from "./blog.collection";

import { databases } from "./config";

export default async function getOrCreateDB() {
  try {
    await databases.get(db);
    // Database connected successfully
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      await databases.create(db, db);
      // Database created successfully
       
          } catch {
        // Error creating database silently
      }
  }

  // Always check/create the collection
  await createBlogCollection();

  return databases;
}
