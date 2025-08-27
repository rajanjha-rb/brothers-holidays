import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, bookingCollection, customerCollection } from "@/models/name";
import { ID, Query } from "node-appwrite";
import { bookingUtils } from "@/utils/bookingUtils";
import { BookingFormData } from "@/types/booking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BookingFormData;
    
    // Validate the booking data
    const validation = bookingUtils.validateBookingData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      }, { status: 400 });
    }

    // Generate unique booking reference
    const bookingReference = bookingUtils.generateBookingReference();
    
    // Calculate travel duration
    const travelDuration = bookingUtils.calculateDuration(
      body.preferredStartDate, 
      body.preferredEndDate
    );

    // Check if customer already exists
    let customerId = null;
    try {
      const existingCustomers = await databases.listDocuments(
        db,
        customerCollection,
        [Query.equal("email", body.customerEmail)]
      );
      
      if (existingCustomers.documents.length > 0) {
        customerId = existingCustomers.documents[0].$id;
        
        // Update existing customer with new information
        await databases.updateDocument(
          db,
          customerCollection,
          customerId,
          {
            name: body.customerName,
            phone: body.customerPhone,
            country: body.customerCountry || undefined,
            address: body.customerAddress || undefined,
            emergencyContactName: body.emergencyContact || undefined,
            emergencyContactPhone: body.emergencyPhone || undefined,
            dietaryRequirements: body.dietaryRequirements || undefined,
            accommodationPreference: body.accommodationPreference || undefined,
            budgetRange: body.budgetRange || undefined,
            subscribeToNewsletter: body.subscribeToNewsletter,
            allowMarketingEmails: body.allowMarketingEmails,
            lastContactDate: new Date().toISOString(),
            sourceOfAcquisition: "website"
          }
        );
      }
    } catch (error) {
      console.log("Customer lookup failed, will create new customer:", error);
    }

    // Create new customer if not exists
    if (!customerId) {
      try {
        const newCustomer = await databases.createDocument(
          db,
          customerCollection,
          ID.unique(),
          {
            name: body.customerName,
            email: body.customerEmail,
            phone: body.customerPhone,
            country: body.customerCountry || undefined,
            address: body.customerAddress || undefined,
            emergencyContactName: body.emergencyContact || undefined,
            emergencyContactPhone: body.emergencyPhone || undefined,
            dietaryRequirements: body.dietaryRequirements || undefined,
            accommodationPreference: body.accommodationPreference || undefined,
            budgetRange: body.budgetRange || undefined,
            subscribeToNewsletter: body.subscribeToNewsletter,
            allowMarketingEmails: body.allowMarketingEmails,
            customerStatus: "new",
            totalBookings: 0,
            totalSpent: 0,
            sourceOfAcquisition: "website",
            isActive: true
          }
        );
        customerId = newCustomer.$id;
      } catch (error) {
        console.error("Failed to create customer:", error);
      }
    }

    // Create the booking
    const bookingData = {
      bookingReference,
      status: "pending",
      
      // Customer information
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerCountry: body.customerCountry || undefined,
      customerAddress: body.customerAddress || undefined,
      emergencyContact: body.emergencyContact || undefined,
      emergencyPhone: body.emergencyPhone || undefined,
      
      // Booking details
      bookingType: body.bookingType,
      itemId: body.itemId,
      itemName: body.itemName,
      numberOfTravelers: body.numberOfTravelers,
      numberOfAdults: body.numberOfAdults,
      numberOfChildren: body.numberOfChildren || 0,
      preferredStartDate: body.preferredStartDate,
      preferredEndDate: body.preferredEndDate || undefined,
      travelDuration,
      
      // Special requirements
      dietaryRequirements: body.dietaryRequirements || undefined,
      specialRequests: body.specialRequests || undefined,
      accommodationPreference: body.accommodationPreference || undefined,
      budgetRange: body.budgetRange || undefined,
      needsInsurance: body.needsInsurance || false,
      needsVisa: body.needsVisa || false,
      needsFlights: body.needsFlights || false,
      
      // Traveler details
      travelerDetails: body.travelerDetails && body.travelerDetails.length > 0 
        ? JSON.stringify(body.travelerDetails) 
        : undefined,
      
      // Payment information
      totalAmount: 0,
      currency: "USD",
      paymentStatus: "pending",
      paidAmount: 0,
      remainingAmount: 0,
      
      // Additional information
      sourceOfInquiry: "website",
      priority: "medium",
      isActive: true,
      requiresImmediateAttention: false
    };

    const booking = await databases.createDocument(
      db,
      bookingCollection,
      ID.unique(),
      bookingData
    );

    // Update customer booking count if customer exists
    if (customerId) {
      try {
        const customer = await databases.getDocument(db, customerCollection, customerId);
        await databases.updateDocument(
          db,
          customerCollection,
          customerId,
          {
            totalBookings: (customer.totalBookings || 0) + 1,
            lastBookingDate: new Date().toISOString(),
            customerStatus: customer.totalBookings > 0 ? "returning" : "new"
          }
        );
      } catch (error) {
        console.error("Failed to update customer booking count:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Booking created successfully!",
      booking,
      bookingReference
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create booking. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
