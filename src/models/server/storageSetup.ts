import { Permission } from "node-appwrite";
import { featuredImageBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage() {
  try {
    await storage.getBucket(featuredImageBucket);
    console.log("Storage Connected");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      await storage.createBucket(
        featuredImageBucket,
        featuredImageBucket,
        [
          Permission.create("users"),
          Permission.read("any"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "gif", "jpeg", "webp", "heic"]
      );

      console.log("Storage Created");
      console.log("Storage Connected");
       
    } catch (_error) {
      console.error("Error creating storage:", _error);
    }
  }
}
