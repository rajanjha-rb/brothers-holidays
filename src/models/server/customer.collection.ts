import { IndexType, Permission } from "node-appwrite";
import { db, customerCollection } from "../name";
import { databases } from "./config";

export default async function createCustomerCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, customerCollection);
    // Customer collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, customerCollection, customerCollection, [
        Permission.read("any"),
        Permission.create("any"), // Allow guests to create customer records
        Permission.update("users"),
        Permission.delete("users"),
      ]);
    // Customer collection created successfully
    } catch {
      // Error creating customer collection silently
      return;
    }
  }

  // Create attributes
  try {
    await Promise.all([
      // Basic customer information
      databases.createStringAttribute(db, customerCollection, "name", 200, true),
      databases.createStringAttribute(db, customerCollection, "email", 250, true),
      databases.createStringAttribute(db, customerCollection, "phone", 50, true),
      databases.createStringAttribute(db, customerCollection, "country", 100, false),
      databases.createStringAttribute(db, customerCollection, "city", 100, false),
      databases.createStringAttribute(db, customerCollection, "address", 500, false),
      databases.createStringAttribute(db, customerCollection, "zipCode", 20, false),
      
      // Personal details
      databases.createStringAttribute(db, customerCollection, "dateOfBirth", 20, false),
      databases.createStringAttribute(db, customerCollection, "nationality", 100, false),
      databases.createStringAttribute(db, customerCollection, "passportNumber", 50, false),
      databases.createStringAttribute(db, customerCollection, "passportExpiry", 20, false),
      
      // Emergency contact
      databases.createStringAttribute(db, customerCollection, "emergencyContactName", 200, false),
      databases.createStringAttribute(db, customerCollection, "emergencyContactPhone", 50, false),
      databases.createStringAttribute(db, customerCollection, "emergencyContactRelation", 100, false),
      
      // Preferences
      databases.createStringAttribute(db, customerCollection, "dietaryRequirements", 500, false),
      databases.createStringAttribute(db, customerCollection, "accommodationPreference", 200, false),
      databases.createStringAttribute(db, customerCollection, "budgetRange", 100, false),
      databases.createStringAttribute(db, customerCollection, "travelInterests", 1000, false), // JSON array
      databases.createStringAttribute(db, customerCollection, "preferredDestinations", 1000, false), // JSON array
      
      // Marketing and communication
      databases.createBooleanAttribute(db, customerCollection, "subscribeToNewsletter", false, false),
      databases.createBooleanAttribute(db, customerCollection, "allowMarketingEmails", false, false),
      databases.createStringAttribute(db, customerCollection, "preferredContactMethod", 50, false), // email, phone, whatsapp
      databases.createStringAttribute(db, customerCollection, "languagePreference", 20, false, "en"),
      
      // Customer status and analytics
      databases.createIntegerAttribute(db, customerCollection, "totalBookings", false, 0, 999, 0),
      databases.createFloatAttribute(db, customerCollection, "totalSpent", false, 0, 999999, 0),
      databases.createStringAttribute(db, customerCollection, "customerStatus", 50, false, "new"), // new, returning, vip, inactive
      databases.createStringAttribute(db, customerCollection, "lastBookingDate", 50, false),
      databases.createStringAttribute(db, customerCollection, "lastContactDate", 50, false),
      databases.createStringAttribute(db, customerCollection, "sourceOfAcquisition", 100, false), // website, referral, social, etc.
      
      // Additional notes and tags
      databases.createStringAttribute(db, customerCollection, "notes", 2000, false),
      databases.createStringAttribute(db, customerCollection, "tags", 1000, false), // JSON array for customer tags
      databases.createStringAttribute(db, customerCollection, "assignedAgent", 100, false),
      
      // Account status
      databases.createBooleanAttribute(db, customerCollection, "isActive", false, true),
      databases.createBooleanAttribute(db, customerCollection, "isBlacklisted", false, false),
      databases.createStringAttribute(db, customerCollection, "blacklistReason", 500, false),
    ]);
    // Customer collection attributes created successfully
  } catch {
    // Error creating customer collection attributes silently
  }

  // Create indexes
  try {
    await Promise.all([
      // Primary search indexes
      databases.createIndex(
        db,
        customerCollection,
        "email_index",
        IndexType.Unique,
        ["email"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "name_index",
        IndexType.Fulltext,
        ["name"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "phone_index",
        IndexType.Key,
        ["phone"]
      ),
      
      // Location indexes
      databases.createIndex(
        db,
        customerCollection,
        "country_index",
        IndexType.Key,
        ["country"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "city_index",
        IndexType.Key,
        ["city"]
      ),
      
      // Status indexes
      databases.createIndex(
        db,
        customerCollection,
        "customer_status_index",
        IndexType.Key,
        ["customerStatus"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "is_active_index",
        IndexType.Key,
        ["isActive"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "is_blacklisted_index",
        IndexType.Key,
        ["isBlacklisted"]
      ),
      
      // Analytics indexes
      databases.createIndex(
        db,
        customerCollection,
        "total_bookings_index",
        IndexType.Key,
        ["totalBookings"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "total_spent_index",
        IndexType.Key,
        ["totalSpent"]
      ),
      
      // Date indexes
      databases.createIndex(
        db,
        customerCollection,
        "last_booking_date_index",
        IndexType.Key,
        ["lastBookingDate"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "updated_at_index",
        IndexType.Key,
        ["$updatedAt"]
      ),
      
      // Management indexes
      databases.createIndex(
        db,
        customerCollection,
        "assigned_agent_index",
        IndexType.Key,
        ["assignedAgent"]
      ),
      databases.createIndex(
        db,
        customerCollection,
        "source_of_acquisition_index",
        IndexType.Key,
        ["sourceOfAcquisition"]
      ),
    ]);
    // Customer collection indexes created successfully
  } catch {
    // Error creating customer collection indexes silently
  }
}
