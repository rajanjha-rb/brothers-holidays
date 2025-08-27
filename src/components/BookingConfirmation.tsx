"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FaCheck, FaEnvelope, FaPhone, FaCalendarAlt, FaArrowRight,
  FaCopy, FaShareAlt, FaHome
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface BookingConfirmationProps {
  bookingReference: string;
  customerEmail?: string;
  itemName?: string;
  itemType?: 'package' | 'trip';
  onContinue?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export default function BookingConfirmation({
  bookingReference,
  customerEmail,
  itemName,
  itemType,
  onContinue,
  onGoHome,
  className = ""
}: BookingConfirmationProps) {
  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(bookingReference);
      toast.success('Booking reference copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bookingReference;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Booking reference copied!');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Travel Booking Confirmation',
      text: `I just booked ${itemName || `a ${itemType || 'travel package'}`} with Brothers Holidays! Booking reference: ${bookingReference}`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        toast.success('Booking details copied to clipboard!');
      }
    } catch {
      toast.error('Unable to share at the moment');
    }
  };

  const trackingUrl = `/booking-status/${bookingReference}`;

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card className="shadow-xl border-0 bg-white overflow-hidden">
        {/* Success Header */}
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <FaCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            Booking Confirmed!
          </CardTitle>
          <p className="text-green-100 text-lg">
            Thank you for choosing Brothers Holidays
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Booking Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Your Booking Reference
              </h3>
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-4">
                <span className="text-3xl font-bold text-blue-600 tracking-wider">
                  {bookingReference}
                </span>
              </div>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleCopyReference}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <FaCopy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <FaShareAlt className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What happens next?
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">
                    We&apos;ll Review Your Request
                  </h4>
                  <p className="text-orange-700 text-sm">
                    Our travel experts will review your booking details and prepare a personalized quote within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">
                    You&apos;ll Receive Your Quote
                  </h4>
                  <p className="text-blue-700 text-sm">
                    We&apos;ll send a detailed quote to <strong>{customerEmail}</strong> with pricing, itinerary, and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">
                    Confirm and Pay
                  </h4>
                  <p className="text-green-700 text-sm">
                    Once you approve the quote, we&apos;ll guide you through the confirmation and payment process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Need Help or Have Questions?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaEnvelope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email us at</p>
                  <a 
                    href="mailto:info@brothersholidays.com" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    info@brothersholidays.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaPhone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Call us at</p>
                  <a 
                    href="tel:+1234567890" 
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Reference your booking number: <strong>{bookingReference}</strong> in all communications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={() => window.open(trackingUrl, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FaCalendarAlt className="w-4 h-4" />
              Track Your Booking
            </Button>

            <Button
              onClick={onContinue || (() => window.location.href = '/packages')}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FaArrowRight className="w-4 h-4" />
              Continue Browsing
            </Button>

            <Button
              onClick={onGoHome || (() => window.location.href = '/')}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FaHome className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          {/* Booking Summary */}
          {itemName && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{itemName}</p>
                    <p className="text-sm text-gray-600 capitalize">{itemType} Booking</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-600">Pending Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-amber-800 font-medium mb-1">Important</p>
                <p className="text-amber-700 text-sm">
                  Please save your booking reference number. You&apos;ll need it to track your booking status and for all future communications with our team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
