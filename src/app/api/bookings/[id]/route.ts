import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, bookingCollection } from "@/models/name";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Booking ID is required"
      }, { status: 400 });
    }

    const booking = await databases.getDocument(
      db,
      bookingCollection,
      id
    );

    // Parse traveler details if it exists
    const transformedBooking = {
      ...booking,
      travelerDetails: booking.travelerDetails 
        ? JSON.parse(booking.travelerDetails) 
        : []
    };

    return NextResponse.json({
      success: true,
      booking: transformedBooking
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({
      success: false,
      message: "Booking not found",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Booking ID is required"
      }, { status: 400 });
    }

    // Get current booking to check if it exists
    const currentBooking = await databases.getDocument(
      db,
      bookingCollection,
      id
    );

    if (!currentBooking) {
      return NextResponse.json({
        success: false,
        message: "Booking not found"
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = { ...body };
    
    // Handle traveler details
    if (updateData.travelerDetails) {
      updateData.travelerDetails = JSON.stringify(updateData.travelerDetails);
    }

    // Add last contact date when status changes
    if (updateData.status && updateData.status !== currentBooking.status) {
      updateData.lastContactDate = new Date().toISOString();
      
      // Set booking confirmed date when status changes to confirmed
      if (updateData.status === 'confirmed' && !currentBooking.bookingConfirmedAt) {
        updateData.bookingConfirmedAt = new Date().toISOString();
      }
      
      // Set travel completed date when status changes to completed
      if (updateData.status === 'completed' && !currentBooking.travelCompletedAt) {
        updateData.travelCompletedAt = new Date().toISOString();
      }
    }

    // Update payment status based on amounts
    if (updateData.totalAmount !== undefined || updateData.paidAmount !== undefined) {
      const totalAmount = updateData.totalAmount ?? currentBooking.totalAmount ?? 0;
      const paidAmount = updateData.paidAmount ?? currentBooking.paidAmount ?? 0;
      
      updateData.remainingAmount = totalAmount - paidAmount;
      
      if (paidAmount === 0) {
        updateData.paymentStatus = 'pending';
      } else if (paidAmount >= totalAmount) {
        updateData.paymentStatus = 'complete';
      } else {
        updateData.paymentStatus = 'partial';
      }
    }

    // Update the booking
    const updatedBooking = await databases.updateDocument(
      db,
      bookingCollection,
      id,
      updateData
    );

    // Transform the response
    const transformedBooking = {
      ...updatedBooking,
      travelerDetails: updatedBooking.travelerDetails 
        ? JSON.parse(updatedBooking.travelerDetails) 
        : []
    };

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: transformedBooking
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update booking",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Booking ID is required"
      }, { status: 400 });
    }

    // Instead of deleting, we'll mark as cancelled and inactive
    const updatedBooking = await databases.updateDocument(
      db,
      bookingCollection,
      id,
      {
        status: 'cancelled',
        isActive: false,
        lastContactDate: new Date().toISOString(),
        notes: (await databases.getDocument(db, bookingCollection, id)).notes 
          ? (await databases.getDocument(db, bookingCollection, id)).notes + "\n\nBooking cancelled via API"
          : "Booking cancelled via API"
      }
    );

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to cancel booking",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
