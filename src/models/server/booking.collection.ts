import { IndexType, Permission } from "node-appwrite";
import { db, bookingCollection } from "../name";
import { databases } from "./config";

export default async function createBookingCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, bookingCollection);
    // Booking collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, bookingCollection, bookingCollection, [
        Permission.read("any"),
        Permission.create("any"), // Allow guests to create bookings
        Permission.update("users"),
        Permission.delete("users"),
      ]);
    // Booking collection created successfully
    } catch {
      // Error creating booking collection silently
      return;
    }
  }

  // Create attributes
  try {
    await Promise.all([
      // Basic booking information
      databases.createStringAttribute(db, bookingCollection, "bookingReference", 50, true),
      databases.createStringAttribute(db, bookingCollection, "status", 50, true, "pending"),
      
      // Customer information
      databases.createStringAttribute(db, bookingCollection, "customerName", 200, true),
      databases.createStringAttribute(db, bookingCollection, "customerEmail", 250, true),
      databases.createStringAttribute(db, bookingCollection, "customerPhone", 50, true),
      databases.createStringAttribute(db, bookingCollection, "customerCountry", 100, false),
      databases.createStringAttribute(db, bookingCollection, "customerAddress", 500, false),
      databases.createStringAttribute(db, bookingCollection, "emergencyContact", 250, false),
      databases.createStringAttribute(db, bookingCollection, "emergencyPhone", 50, false),
      
      // Booking details
      databases.createStringAttribute(db, bookingCollection, "bookingType", 50, true), // "package" or "trip"
      databases.createStringAttribute(db, bookingCollection, "itemId", 100, true), // Package or Trip ID
      databases.createStringAttribute(db, bookingCollection, "itemName", 300, true), // Package or Trip name
      databases.createIntegerAttribute(db, bookingCollection, "numberOfTravelers", true, 1, 50, 1),
      databases.createIntegerAttribute(db, bookingCollection, "numberOfAdults", true, 1, 50, 1),
      databases.createIntegerAttribute(db, bookingCollection, "numberOfChildren", false, 0, 50, 0),
      databases.createStringAttribute(db, bookingCollection, "preferredStartDate", 50, true),
      databases.createStringAttribute(db, bookingCollection, "preferredEndDate", 50, false),
      databases.createStringAttribute(db, bookingCollection, "travelDuration", 50, false), // e.g., "7 days 6 nights"
      
      // Special requirements and preferences
      databases.createStringAttribute(db, bookingCollection, "dietaryRequirements", 500, false),
      databases.createStringAttribute(db, bookingCollection, "specialRequests", 1000, false),
      databases.createStringAttribute(db, bookingCollection, "accommodationPreference", 200, false),
      databases.createStringAttribute(db, bookingCollection, "budgetRange", 100, false),
      databases.createBooleanAttribute(db, bookingCollection, "needsInsurance", false, false),
      databases.createBooleanAttribute(db, bookingCollection, "needsVisa", false, false),
      databases.createBooleanAttribute(db, bookingCollection, "needsFlights", false, false),
      
      // Traveler details (JSON array)
      databases.createStringAttribute(db, bookingCollection, "travelerDetails", 5000, false),
      
      // Payment information
      databases.createFloatAttribute(db, bookingCollection, "totalAmount", false, 0, 999999, 0),
      databases.createStringAttribute(db, bookingCollection, "currency", 10, false, "USD"),
      databases.createStringAttribute(db, bookingCollection, "paymentStatus", 50, false, "pending"),
      databases.createFloatAttribute(db, bookingCollection, "paidAmount", false, 0, 999999, 0),
      databases.createFloatAttribute(db, bookingCollection, "remainingAmount", false, 0, 999999, 0),
      databases.createStringAttribute(db, bookingCollection, "paymentMethod", 100, false),
      databases.createStringAttribute(db, bookingCollection, "paymentReference", 200, false),
      
      // Additional information
      databases.createStringAttribute(db, bookingCollection, "sourceOfInquiry", 100, false), // website, phone, email, etc.
      databases.createStringAttribute(db, bookingCollection, "notes", 2000, false), // Admin notes
      databases.createStringAttribute(db, bookingCollection, "assignedAgent", 100, false),
      databases.createStringAttribute(db, bookingCollection, "confirmationSentAt", 50, false),
      databases.createStringAttribute(db, bookingCollection, "lastContactDate", 50, false),
      
      // Booking lifecycle
      databases.createStringAttribute(db, bookingCollection, "bookingConfirmedAt", 50, false),
      databases.createStringAttribute(db, bookingCollection, "travelCompletedAt", 50, false),
      databases.createBooleanAttribute(db, bookingCollection, "isActive", false, true),
      
      // Priority and urgency
      databases.createStringAttribute(db, bookingCollection, "priority", 20, false, "medium"), // low, medium, high, urgent
      databases.createBooleanAttribute(db, bookingCollection, "requiresImmediateAttention", false, false),
    ]);
    // Booking collection attributes created successfully
  } catch {
    // Error creating booking collection attributes silently
  }

  // Create indexes
  try {
    await Promise.all([
      // Primary search indexes
      databases.createIndex(
        db,
        bookingCollection,
        "booking_reference_index",
        IndexType.Unique,
        ["bookingReference"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "status_index",
        IndexType.Key,
        ["status"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "customer_email_index",
        IndexType.Key,
        ["customerEmail"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "customer_name_index",
        IndexType.Fulltext,
        ["customerName"]
      ),
      
      // Booking type and item indexes
      databases.createIndex(
        db,
        bookingCollection,
        "booking_type_index",
        IndexType.Key,
        ["bookingType"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "item_id_index",
        IndexType.Key,
        ["itemId"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "item_name_index",
        IndexType.Fulltext,
        ["itemName"]
      ),
      
      // Date indexes
      databases.createIndex(
        db,
        bookingCollection,
        "preferred_start_date_index",
        IndexType.Key,
        ["preferredStartDate"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
      
      // Payment indexes
      databases.createIndex(
        db,
        bookingCollection,
        "payment_status_index",
        IndexType.Key,
        ["paymentStatus"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "total_amount_index",
        IndexType.Key,
        ["totalAmount"]
      ),
      
      // Management indexes
      databases.createIndex(
        db,
        bookingCollection,
        "assigned_agent_index",
        IndexType.Key,
        ["assignedAgent"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "priority_index",
        IndexType.Key,
        ["priority"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "is_active_index",
        IndexType.Key,
        ["isActive"]
      ),
      
      // Composite indexes for common queries
      databases.createIndex(
        db,
        bookingCollection,
        "status_priority_index",
        IndexType.Key,
        ["status", "priority"]
      ),
      databases.createIndex(
        db,
        bookingCollection,
        "booking_type_status_index",
        IndexType.Key,
        ["bookingType", "status"]
      ),
    ]);
    // Booking collection indexes created successfully
  } catch {
    // Error creating booking collection indexes silently
  }
}
