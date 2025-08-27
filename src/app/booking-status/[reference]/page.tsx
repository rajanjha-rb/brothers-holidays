"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { 
  FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaCalendarAlt,
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, FaDollarSign,
  FaSpinner, FaExclamationTriangle, FaInfoCircle,
  FaShareAlt, FaHome
} from 'react-icons/fa';
import { Booking } from '@/types/booking';
import { bookingUtils, getStatusText, formatDate, calculateBookingProgress } from '@/utils/bookingUtils';
import { BookingStatus } from '@/types/booking';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface BookingStatusPageProps {
  params: Promise<{ reference?: string }>;
}

export default function BookingStatusPage({ params }: BookingStatusPageProps) {
  const [reference, setReference] = useState<string>('');
  const [inputReference, setInputReference] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [notFound, setNotFound] = useState(false);

  // Get reference from URL params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      if (resolvedParams.reference) {
        setReference(resolvedParams.reference);
        setInputReference(resolvedParams.reference);
      }
    };
    getParams();
  }, [params]);

  // Fetch booking when reference changes
  useEffect(() => {
    if (reference) {
      fetchBooking(reference);
    }
  }, [reference]);

  const fetchBooking = async (bookingRef: string) => {
    if (!bookingRef.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setLoading(true);
    setError('');
    setNotFound(false);
    setBooking(null);

    try {
      const response = await fetch('/api/bookings/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          limit: 1,
          filters: {
            searchQuery: bookingRef
          }
        }),
      });

      const data = await response.json();

      if (data.success && data.bookings && data.bookings.length > 0) {
        // Find exact match
        const exactMatch = data.bookings.find((b: Booking) => 
          b.bookingReference.toLowerCase() === bookingRef.toLowerCase()
        );
        
        if (exactMatch) {
          setBooking(exactMatch);
        } else {
          setNotFound(true);
          setError('Booking not found. Please check your reference number.');
        }
      } else {
        setNotFound(true);
        setError('Booking not found. Please check your reference number.');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Unable to fetch booking details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (inputReference.trim()) {
      setReference(inputReference.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    const completedStatuses = ['completed', 'payment_complete', 'confirmed'];
    const cancelledStatuses = ['cancelled', 'refunded'];

    if (completedStatuses.some(s => status.includes(s))) {
      return <FaCheckCircle className="w-6 h-6 text-green-500" />;
    } else if (cancelledStatuses.includes(status)) {
      return <FaTimesCircle className="w-6 h-6 text-red-500" />;
    } else {
      return <FaClock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getProgressSteps = (currentStatus: string) => {
    const allSteps = [
      { key: 'pending', label: 'Booking Received', description: 'Your booking request has been received' },
      { key: 'quote_sent', label: 'Quote Prepared', description: 'We have prepared your personalized quote' },
      { key: 'confirmed', label: 'Booking Confirmed', description: 'Your booking has been confirmed' },
      { key: 'payment_complete', label: 'Payment Complete', description: 'Payment has been processed successfully' },
      { key: 'documents_sent', label: 'Documents Sent', description: 'Travel documents have been sent to you' },
      { key: 'completed', label: 'Trip Completed', description: 'Your amazing journey is complete!' }
    ];

    const currentIndex = allSteps.findIndex(step => step.key === currentStatus);

    return allSteps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex,
      progress: index <= currentIndex ? 100 : 0
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Track Your Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your booking reference number to check the status of your travel booking
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <FaSearch className="w-6 h-6" />
              Find Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="reference" className="text-sm font-medium text-gray-700 mb-2 block">
                  Booking Reference Number
                </Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Enter your booking reference (e.g., BH123456ABC)"
                  value={inputReference}
                  onChange={(e) => setInputReference(e.target.value.toUpperCase())}
                  className="text-lg py-3 px-4"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your booking reference was provided when you made your booking and in confirmation emails
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading || !inputReference.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg h-auto"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="w-5 h-5 mr-2" />
                      Track Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Unable to Find Booking</h3>
                  <p className="text-red-700">{error}</p>
                  {notFound && (
                    <div className="mt-3 text-sm text-red-600">
                      <p>If you&apos;re having trouble finding your booking:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Check the booking reference number for typos</li>
                        <li>Make sure you&apos;re using the complete reference number</li>
                        <li>Contact our support team if you need assistance</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        {booking && (
          <div className="space-y-8">
            {/* Booking Header */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      {booking.itemName}
                    </CardTitle>
                    <p className="text-green-100 text-lg">
                      Booking Reference: <span className="font-bold">{booking.bookingReference}</span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-3xl font-bold mb-1">
                      {getStatusText(booking.status as BookingStatus)}
                    </div>
                    <div className="text-green-100">
                      {booking.$createdAt && `Booked on ${formatDate(booking.$createdAt)}`}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lead Traveler</p>
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Travelers</p>
                      <p className="font-semibold text-gray-900">
                        {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? 'Person' : 'People'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Travel Date</p>
                      <p className="font-semibold text-gray-900">
                        {booking.preferredStartDate ? formatDate(booking.preferredStartDate) : 'TBD'}
                      </p>
                    </div>
                  </div>

                  {booking.totalAmount && booking.totalAmount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FaDollarSign className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold text-gray-900">
                          {bookingUtils.formatCurrency(booking.totalAmount, booking.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <FaInfoCircle className="w-6 h-6 text-blue-600" />
                  Booking Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                  <div 
                    className="absolute left-6 top-4 w-0.5 bg-blue-500 transition-all duration-500"
                    style={{ height: `${calculateBookingProgress(booking.status as BookingStatus)}%` }}
                  ></div>

                  <div className="space-y-8">
                    {getProgressSteps(booking.status).map((step) => (
                      <div key={step.key} className="relative flex items-center">
                        <div className={`
                          w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 bg-white transition-all duration-300
                          ${step.isCompleted 
                            ? 'border-blue-500 bg-blue-500' 
                            : step.isCurrent 
                              ? 'border-blue-500 bg-white' 
                              : 'border-gray-300 bg-white'
                          }
                        `}>
                          {step.isCompleted ? (
                            <FaCheckCircle className="w-6 h-6 text-white" />
                          ) : step.isCurrent ? (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="ml-6 flex-1">
                          <h3 className={`font-semibold text-lg ${
                            step.isCompleted || step.isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </h3>
                          <p className={`text-sm ${
                            step.isCompleted || step.isCurrent ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                          {step.isCurrent && (
                            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full inline-block">
                              Current Status
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FaUser className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{booking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{booking.customerPhone}</span>
                  </div>
                  {booking.customerCountry && (
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{booking.customerCountry}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Travel Details */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FaCalendarAlt className="w-5 h-5 text-green-600" />
                    Travel Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Package/Trip</p>
                    <p className="font-semibold text-gray-900">{booking.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Number of Travelers</p>
                    <p className="font-semibold text-gray-900">
                      {booking.numberOfAdults} Adults
                      {booking.numberOfChildren && booking.numberOfChildren > 0 && 
                        `, ${booking.numberOfChildren} Children`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preferred Start Date</p>
                    <p className="font-semibold text-gray-900">
                      {booking.preferredStartDate ? formatDate(booking.preferredStartDate) : 'To be determined'}
                    </p>
                  </div>
                  {booking.travelDuration && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
                      <p className="font-semibold text-gray-900">{booking.travelDuration}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Special Requests */}
            {(booking.specialRequests || booking.dietaryRequirements) && (
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FaInfoCircle className="w-5 h-5 text-purple-600" />
                    Special Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.specialRequests && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Special Requests</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                  {booking.dietaryRequirements && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Dietary Requirements</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {booking.dietaryRequirements}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Need Help?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Our travel experts are here to assist you with any questions about your booking.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-xl"
                      onClick={() => window.location.href = '/contact'}
                    >
                      <FaEnvelope className="w-5 h-5 mr-2" />
                      Contact Support
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg rounded-xl"
                      onClick={() => {
                        const bookingUrl = `${window.location.origin}/booking-status/${booking.bookingReference}`;
                        if (navigator.share) {
                          navigator.share({
                            title: 'My Booking Status',
                            text: `Check my booking status: ${booking.bookingReference}`,
                            url: bookingUrl
                          });
                        } else {
                          navigator.clipboard.writeText(bookingUrl);
                          toast.success('Booking link copied to clipboard!');
                        }
                      }}
                    >
                      <FaShareAlt className="w-5 h-5 mr-2" />
                      Share Booking
                    </Button>

                    <Link href="/">
                      <Button 
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg rounded-xl"
                      >
                        <FaHome className="w-5 h-5 mr-2" />
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Section */}
        {!booking && !error && (
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How to Track Your Booking
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Enter Reference</h4>
                    <p className="text-gray-600 text-sm">
                      Enter your booking reference number in the search box above
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaInfoCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">2. View Status</h4>
                    <p className="text-gray-600 text-sm">
                      See real-time updates on your booking progress and status
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaEnvelope className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Get Help</h4>
                    <p className="text-gray-600 text-sm">
                      Contact our support team if you need any assistance
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Need Your Booking Reference?</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Your booking reference was sent to your email when you made the booking. 
                    It usually starts with &quot;BH&quot; followed by numbers and letters.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" className="text-sm">
                      Contact Support for Help
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
