import { db } from "../name";
import createBlogCollection from "./blog.collection";
import createTripCollection from "./trip.collection";
import createMediaCollection from "./media.collection";
import createDestinationCollection from "./destination.collection";
import createPackageCollection from "./package.collection";
import createBookingCollection from "./booking.collection";
import createCustomerCollection from "./customer.collection";
import createInvoiceCollection from "./invoice.collection";

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

  // Always check/create the collections, but don't fail if one fails
  try {
    await createBlogCollection();
  } catch (error) {
    console.error("Failed to create blog collection:", error);
  }
  
  try {
    await createTripCollection();
  } catch (error) {
    console.error("Failed to create trip collection:", error);
  }
  
  try {
    await createMediaCollection();
  } catch (error) {
    console.error("Failed to create media collection:", error);
  }
  
  try {
    await createDestinationCollection();
  } catch (error) {
    console.error("Failed to create destination collection:", error);
  }
  
  // Create package collection only if it doesn't exist or needs updates
  try {
    console.log("Checking package collection status...");
    await createPackageCollection();
  } catch (error) {
    console.error("Failed to create/update package collection:", error);
  }
  
  // Create booking collection
  try {
    console.log("Checking booking collection status...");
    await createBookingCollection();
  } catch (error) {
    console.error("Failed to create booking collection:", error);
  }
  
  // Create customer collection
  try {
    console.log("Checking customer collection status...");
    await createCustomerCollection();
  } catch (error) {
    console.error("Failed to create customer collection:", error);
  }
  
  // Create invoice collection
  try {
    console.log("Checking invoice collection status...");
    await createInvoiceCollection();
  } catch (error) {
    console.error("Failed to create invoice collection:", error);
  }

  return databases;
}
