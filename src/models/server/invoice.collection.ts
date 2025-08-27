import { IndexType, Permission } from "node-appwrite";
import { db, invoiceCollection } from "../name";
import { databases } from "./config";

export default async function createInvoiceCollection() {
  try {
    // Check if collection exists
    await databases.getCollection(db, invoiceCollection);
    // Invoice collection already exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    try {
      // Create collection if it does not exist
      await databases.createCollection(db, invoiceCollection, invoiceCollection, [
        Permission.read("any"),
        Permission.create("users"),
        Permission.update("users"),
        Permission.delete("users"),
      ]);
    // Invoice collection created successfully
    } catch {
      // Error creating invoice collection silently
      return;
    }
  }

  // Create attributes
  try {
    await Promise.all([
      // Basic invoice information
      databases.createStringAttribute(db, invoiceCollection, "invoiceNumber", 50, true),
      databases.createStringAttribute(db, invoiceCollection, "status", 30, true, "draft"), // draft, sent, paid, overdue, cancelled
      databases.createStringAttribute(db, invoiceCollection, "type", 30, true, "travel"), // travel, package, trip, service
      
      // Customer information
      databases.createStringAttribute(db, invoiceCollection, "customerName", 200, true),
      databases.createStringAttribute(db, invoiceCollection, "customerEmail", 250, true),
      databases.createStringAttribute(db, invoiceCollection, "customerPhone", 50, false),
      databases.createStringAttribute(db, invoiceCollection, "customerAddress", 500, false),
      databases.createStringAttribute(db, invoiceCollection, "customerCountry", 100, false),
      databases.createStringAttribute(db, invoiceCollection, "customerId", 100, false), // Link to customer collection
      
      // Booking reference
      databases.createStringAttribute(db, invoiceCollection, "bookingReference", 50, false),
      databases.createStringAttribute(db, invoiceCollection, "bookingId", 100, false),
      
      // Invoice dates
      databases.createStringAttribute(db, invoiceCollection, "issueDate", 20, true),
      databases.createStringAttribute(db, invoiceCollection, "dueDate", 20, true),
      databases.createStringAttribute(db, invoiceCollection, "paidDate", 20, false),
      
      // Financial information
      databases.createFloatAttribute(db, invoiceCollection, "subtotal", true, 0, 999999),
      databases.createFloatAttribute(db, invoiceCollection, "taxAmount", false, 0, 99999, 0),
      databases.createFloatAttribute(db, invoiceCollection, "taxRate", false, 0, 100, 0), // Tax percentage
      databases.createFloatAttribute(db, invoiceCollection, "discountAmount", false, 0, 99999, 0),
      databases.createFloatAttribute(db, invoiceCollection, "totalAmount", true, 0, 999999),
      databases.createStringAttribute(db, invoiceCollection, "currency", 10, false, "USD"),
      
      // Line items (JSON array)
      databases.createStringAttribute(db, invoiceCollection, "lineItems", 10000, true),
      
      // Travel-specific information
      databases.createStringAttribute(db, invoiceCollection, "travelDate", 20, false),
      databases.createStringAttribute(db, invoiceCollection, "returnDate", 20, false),
      databases.createStringAttribute(db, invoiceCollection, "destination", 200, false),
      databases.createIntegerAttribute(db, invoiceCollection, "numberOfTravelers", false, 0, 50, 1),
      
      // Notes and terms
      databases.createStringAttribute(db, invoiceCollection, "notes", 2000, false),
      databases.createStringAttribute(db, invoiceCollection, "terms", 2000, false),
      databases.createStringAttribute(db, invoiceCollection, "paymentInstructions", 1000, false),
      
      // Payment tracking
      databases.createStringAttribute(db, invoiceCollection, "paymentMethod", 100, false),
      databases.createStringAttribute(db, invoiceCollection, "paymentReference", 200, false),
      databases.createFloatAttribute(db, invoiceCollection, "paidAmount", false, 0, 999999, 0),
      databases.createFloatAttribute(db, invoiceCollection, "balancedue", false, 0, 999999, 0),
      
      // Company information (for customization)
      databases.createStringAttribute(db, invoiceCollection, "companyName", 200, false, "Brothers Holidays"),
      databases.createStringAttribute(db, invoiceCollection, "companyAddress", 500, false),
      databases.createStringAttribute(db, invoiceCollection, "companyPhone", 50, false),
      databases.createStringAttribute(db, invoiceCollection, "companyEmail", 200, false),
      databases.createStringAttribute(db, invoiceCollection, "companyWebsite", 200, false),
      databases.createStringAttribute(db, invoiceCollection, "companyLogo", 200, false, "/travelLogo.svg"),
      
      // Additional metadata
      databases.createStringAttribute(db, invoiceCollection, "createdBy", 100, false),
      databases.createStringAttribute(db, invoiceCollection, "lastModifiedBy", 100, false),
      databases.createBooleanAttribute(db, invoiceCollection, "isTemplate", false, false),
      databases.createStringAttribute(db, invoiceCollection, "templateName", 100, false),
      
      // Communication tracking
      databases.createStringAttribute(db, invoiceCollection, "sentDate", 20, false),
      databases.createIntegerAttribute(db, invoiceCollection, "reminderCount", false, 0, 10, 0),
      databases.createStringAttribute(db, invoiceCollection, "lastReminderDate", 20, false),
    ]);
    // Invoice collection attributes created successfully
  } catch {
    // Error creating invoice collection attributes silently
  }

  // Create indexes
  try {
    await Promise.all([
      // Primary indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "invoice_number_index",
        IndexType.Unique,
        ["invoiceNumber"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "status_index",
        IndexType.Key,
        ["status"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "type_index",
        IndexType.Key,
        ["type"]
      ),
      
      // Customer indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "customer_email_index",
        IndexType.Key,
        ["customerEmail"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "customer_name_index",
        IndexType.Fulltext,
        ["customerName"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "customer_id_index",
        IndexType.Key,
        ["customerId"]
      ),
      
      // Booking reference indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "booking_reference_index",
        IndexType.Key,
        ["bookingReference"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "booking_id_index",
        IndexType.Key,
        ["bookingId"]
      ),
      
      // Date indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "issue_date_index",
        IndexType.Key,
        ["issueDate"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "due_date_index",
        IndexType.Key,
        ["dueDate"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "paid_date_index",
        IndexType.Key,
        ["paidDate"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "created_at_index",
        IndexType.Key,
        ["$createdAt"]
      ),
      
      // Financial indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "total_amount_index",
        IndexType.Key,
        ["totalAmount"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "currency_index",
        IndexType.Key,
        ["currency"]
      ),
      
      // Travel-specific indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "travel_date_index",
        IndexType.Key,
        ["travelDate"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "destination_index",
        IndexType.Key,
        ["destination"]
      ),
      
      // Management indexes
      databases.createIndex(
        db,
        invoiceCollection,
        "created_by_index",
        IndexType.Key,
        ["createdBy"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "is_template_index",
        IndexType.Key,
        ["isTemplate"]
      ),
      
      // Composite indexes for common queries
      databases.createIndex(
        db,
        invoiceCollection,
        "status_due_date_index",
        IndexType.Key,
        ["status", "dueDate"]
      ),
      databases.createIndex(
        db,
        invoiceCollection,
        "customer_status_index",
        IndexType.Key,
        ["customerEmail", "status"]
      ),
    ]);
    // Invoice collection indexes created successfully
  } catch {
    // Error creating invoice collection indexes silently
  }
}
