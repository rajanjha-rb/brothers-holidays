import { Permission } from "node-appwrite";
import { featuredImageBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage() {
  try {
    await storage.getBucket(featuredImageBucket);
    console.log('Storage bucket already exists:', featuredImageBucket);
    // Storage connected successfully
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      console.log('Creating storage bucket:', featuredImageBucket);
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

      console.log('Storage bucket created successfully:', featuredImageBucket);
      // Storage created and connected successfully
       
    } catch (error) {
      console.error('Error creating storage bucket:', error);
      // Error creating storage silently
    }
  }
}
