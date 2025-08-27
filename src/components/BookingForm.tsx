"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
  FaUsers, FaChild, FaUtensils, FaBed, FaPlane, FaShieldAlt, 
  FaPassport, FaHeart, FaSpinner, FaCheck, FaTimes,
  FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { BookingFormData, TravelerDetail } from '@/types/booking';
import { bookingUtils } from '@/utils/bookingUtils';
import { toast } from 'react-hot-toast';

interface BookingFormProps {
  itemId: string;
  itemName: string;
  itemType: 'package' | 'trip';
  onSuccess?: (bookingReference: string) => void;
  onCancel?: () => void;
  className?: string;
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland', 'Austria',
  'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Japan',
  'South Korea', 'Singapore', 'New Zealand', 'Ireland', 'India',
  'Nepal', 'China', 'Other'
];

const budgetRanges = [
  'Under $1,000',
  '$1,000 - $2,500',
  '$2,500 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $20,000',
  'Over $20,000',
  'Flexible'
];

const accommodationTypes = [
  'Standard Hotel',
  'Luxury Hotel',
  'Boutique Hotel',
  'Resort',
  'Guesthouse',
  'Homestay',
  'Camping/Trekking',
  'Mixed Accommodation',
  'Budget-friendly',
  'No Preference'
];

export default function BookingForm({ 
  itemId, 
  itemName, 
  itemType, 
  onSuccess, 
  onCancel,
  className = ""
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCountry: '',
    customerAddress: '',
    emergencyContact: '',
    emergencyPhone: '',
    bookingType: itemType,
    itemId: itemId,
    itemName: itemName,
    numberOfTravelers: 2,
    numberOfAdults: 2,
    numberOfChildren: 0,
    preferredStartDate: '',
    preferredEndDate: '',
    dietaryRequirements: '',
    specialRequests: '',
    accommodationPreference: '',
    budgetRange: '',
    needsInsurance: false,
    needsVisa: false,
    needsFlights: false,
    travelerDetails: [],
    subscribeToNewsletter: true,
    allowMarketingEmails: false
  });

  // Update traveler details when number of travelers changes
  useEffect(() => {
    const currentTravelers = formData.travelerDetails.length;
    const targetTravelers = formData.numberOfTravelers;
    
    if (currentTravelers !== targetTravelers) {
      const newTravelerDetails = [...formData.travelerDetails];
      
      if (currentTravelers < targetTravelers) {
        // Add new travelers
        for (let i = currentTravelers; i < targetTravelers; i++) {
          newTravelerDetails.push({
            name: '',
            age: undefined,
            dateOfBirth: '',
            passportNumber: '',
            passportExpiry: '',
            nationality: '',
            dietaryRequirements: '',
            specialNeeds: ''
          });
        }
      } else {
        // Remove excess travelers
        newTravelerDetails.splice(targetTravelers);
      }
      
      setFormData(prev => ({
        ...prev,
        travelerDetails: newTravelerDetails
      }));
    }
  }, [formData.numberOfTravelers, formData.travelerDetails]);

  const handleInputChange = (field: keyof BookingFormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleTravelerChange = (index: number, field: keyof TravelerDetail, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      travelerDetails: prev.travelerDetails.map((traveler, i) => 
        i === index ? { ...traveler, [field]: value } : traveler
      )
    }));
  };

  const handleTravelersChange = (adults: number, children: number) => {
    const total = adults + children;
    setFormData(prev => ({
      ...prev,
      numberOfAdults: adults,
      numberOfChildren: children,
      numberOfTravelers: total
    }));
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!formData.customerName.trim()) stepErrors.push("Name is required");
        if (!formData.customerEmail.trim()) stepErrors.push("Email is required");
        if (!formData.customerPhone.trim()) stepErrors.push("Phone is required");
        if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
          stepErrors.push("Please enter a valid email address");
        }
        break;
      case 2:
        if (!formData.preferredStartDate) stepErrors.push("Start date is required");
        if (formData.numberOfAdults < 1) stepErrors.push("At least 1 adult is required");
        if (formData.numberOfTravelers < 1) stepErrors.push("At least 1 traveler is required");
        
        if (formData.preferredStartDate) {
          const startDate = new Date(formData.preferredStartDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            stepErrors.push("Start date cannot be in the past");
          }
        }
        
        if (formData.preferredStartDate && formData.preferredEndDate) {
          const startDate = new Date(formData.preferredStartDate);
          const endDate = new Date(formData.preferredEndDate);
          
          if (endDate <= startDate) {
            stepErrors.push("End date must be after start date");
          }
        }
        break;
      case 3:
        // Optional step - no validation required
        break;
      case 4:
        // Traveler details - validate if provided
        formData.travelerDetails.forEach((traveler, index) => {
          if (traveler.name && !traveler.name.trim()) {
            stepErrors.push(`Traveler ${index + 1} name is invalid`);
          }
          if (traveler.age && (traveler.age < 0 || traveler.age > 120)) {
            stepErrors.push(`Traveler ${index + 1} age must be between 0 and 120`);
          }
        });
        break;
    }
    
    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    const validation = bookingUtils.validateBookingData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Booking request submitted successfully!");
        onSuccess?.(data.bookingReference);
      } else {
        setErrors(data.errors || [data.message]);
        toast.error(data.message || "Failed to submit booking");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      setErrors(["Failed to submit booking. Please try again."]);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Contact Information",
    "Travel Details", 
    "Preferences",
    "Traveler Details"
  ];

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <FaCheck className="w-4 h-4 text-green-600" />;
    if (step === currentStep) return <span className="text-sm font-bold">{step}</span>;
    return <span className="text-sm text-gray-400">{step}</span>;
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 md:space-x-8">
          {stepTitles.map((title, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}>
                    {getStepIcon(step)}
                  </div>
                  <span className={`
                    text-xs mt-2 text-center max-w-[80px] hidden md:block
                    ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}
                  `}>
                    {title}
                  </span>
                </div>
                {step < stepTitles.length && (
                  <div className={`
                    w-8 md:w-16 h-0.5 mx-2 transition-all duration-300
                    ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="text-2xl text-center">
            Book Your {itemType === 'package' ? 'Package' : 'Trip'}
          </CardTitle>
          <p className="text-center text-gray-600 font-medium">{itemName}</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us about yourself</h3>
                  <p className="text-gray-600">We&apos;ll use this information to create your booking and send you updates</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="customerName" className="flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-blue-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerEmail" className="flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4 text-blue-500" />
                      Email Address *
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerPhone" className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-blue-500" />
                      Phone Number *
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerCountry" className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-blue-500" />
                      Country
                    </Label>
                    <Select
                      value={formData.customerCountry}
                      onValueChange={(value) => handleInputChange('customerCountry', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="customerAddress" className="flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-blue-500" />
                    Address
                  </Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    placeholder="Enter your address"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <FaHeart className="w-4 h-4" />
                    Emergency Contact (Recommended)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Contact Name</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="Emergency contact name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Contact Phone</Label>
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        placeholder="Emergency contact phone"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Travel Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">When would you like to travel?</h3>
                  <p className="text-gray-600">Let us know your preferred dates and group size</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="preferredStartDate" className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4 text-blue-500" />
                      Preferred Start Date *
                    </Label>
                    <Input
                      id="preferredStartDate"
                      type="date"
                      value={formData.preferredStartDate}
                      onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                      className="mt-1"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredEndDate" className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4 text-blue-500" />
                      Preferred End Date
                    </Label>
                    <Input
                      id="preferredEndDate"
                      type="date"
                      value={formData.preferredEndDate}
                      onChange={(e) => handleInputChange('preferredEndDate', e.target.value)}
                      className="mt-1"
                      min={formData.preferredStartDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Group Size */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <FaUsers className="w-4 h-4" />
                    Group Size
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="numberOfAdults" className="flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-blue-600" />
                        Adults (18+) *
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTravelersChange(Math.max(1, formData.numberOfAdults - 1), formData.numberOfChildren)}
                          disabled={formData.numberOfAdults <= 1}
                          className="h-10 w-10 p-0"
                        >
                          -
                        </Button>
                        <Input
                          id="numberOfAdults"
                          type="number"
                          value={formData.numberOfAdults}
                          onChange={(e) => handleTravelersChange(parseInt(e.target.value) || 1, formData.numberOfChildren)}
                          min="1"
                          max="20"
                          className="text-center h-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTravelersChange(formData.numberOfAdults + 1, formData.numberOfChildren)}
                          disabled={formData.numberOfAdults >= 20}
                          className="h-10 w-10 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="numberOfChildren" className="flex items-center gap-2">
                        <FaChild className="w-4 h-4 text-blue-600" />
                        Children (Under 18)
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTravelersChange(formData.numberOfAdults, Math.max(0, formData.numberOfChildren - 1))}
                          disabled={formData.numberOfChildren <= 0}
                          className="h-10 w-10 p-0"
                        >
                          -
                        </Button>
                        <Input
                          id="numberOfChildren"
                          type="number"
                          value={formData.numberOfChildren}
                          onChange={(e) => handleTravelersChange(formData.numberOfAdults, parseInt(e.target.value) || 0)}
                          min="0"
                          max="10"
                          className="text-center h-10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTravelersChange(formData.numberOfAdults, formData.numberOfChildren + 1)}
                          disabled={formData.numberOfChildren >= 10}
                          className="h-10 w-10 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formData.numberOfTravelers}
                        </div>
                        <div className="text-sm text-blue-600">
                          Total Travelers
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us your preferences</h3>
                  <p className="text-gray-600">This helps us customize your experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budgetRange" className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      Budget Range
                    </Label>
                    <Select
                      value={formData.budgetRange}
                      onValueChange={(value) => handleInputChange('budgetRange', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="accommodationPreference" className="flex items-center gap-2">
                      <FaBed className="w-4 h-4 text-blue-500" />
                      Accommodation Preference
                    </Label>
                    <Select
                      value={formData.accommodationPreference}
                      onValueChange={(value) => handleInputChange('accommodationPreference', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select accommodation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accommodationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dietaryRequirements" className="flex items-center gap-2">
                    <FaUtensils className="w-4 h-4 text-blue-500" />
                    Dietary Requirements
                  </Label>
                  <Textarea
                    id="dietaryRequirements"
                    value={formData.dietaryRequirements}
                    onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                    placeholder="Any dietary restrictions or preferences? (e.g., vegetarian, allergies, etc.)"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="flex items-center gap-2">
                    <FaInfoCircle className="w-4 h-4 text-blue-500" />
                    Special Requests
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or requirements for your trip?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Additional Services */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">Additional Services</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needsFlights}
                        onChange={(e) => handleInputChange('needsFlights', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <FaPlane className="w-4 h-4 text-green-600" />
                      <span>I need help with flight bookings</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needsVisa}
                        onChange={(e) => handleInputChange('needsVisa', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <FaPassport className="w-4 h-4 text-green-600" />
                      <span>I need visa assistance</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needsInsurance}
                        onChange={(e) => handleInputChange('needsInsurance', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <FaShieldAlt className="w-4 h-4 text-green-600" />
                      <span>I need travel insurance</span>
                    </label>
                  </div>
                </div>

                {/* Marketing Preferences */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">Stay Connected</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.subscribeToNewsletter}
                        onChange={(e) => handleInputChange('subscribeToNewsletter', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Subscribe to our newsletter for travel tips and deals</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowMarketingEmails}
                        onChange={(e) => handleInputChange('allowMarketingEmails', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>Receive promotional emails about new packages and offers</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Traveler Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Traveler Details</h3>
                  <p className="text-gray-600">Optional: Provide details for each traveler (can be completed later)</p>
                </div>

                <div className="space-y-6">
                  {formData.travelerDetails.map((traveler, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FaUser className="w-4 h-4 text-blue-500" />
                          Traveler {index + 1}
                          {index < formData.numberOfAdults ? (
                            <Badge variant="secondary">Adult</Badge>
                          ) : (
                            <Badge variant="outline">Child</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`traveler-${index}-name`}>Full Name</Label>
                            <Input
                              id={`traveler-${index}-name`}
                              value={traveler.name}
                              onChange={(e) => handleTravelerChange(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-age`}>Age</Label>
                            <Input
                              id={`traveler-${index}-age`}
                              type="number"
                              value={traveler.age || ''}
                              onChange={(e) => handleTravelerChange(index, 'age', parseInt(e.target.value) || undefined)}
                              placeholder="Age"
                              min="0"
                              max="120"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-nationality`}>Nationality</Label>
                            <Select
                              value={traveler.nationality || ''}
                              onValueChange={(value) => handleTravelerChange(index, 'nationality', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-passport`}>Passport Number</Label>
                            <Input
                              id={`traveler-${index}-passport`}
                              value={traveler.passportNumber || ''}
                              onChange={(e) => handleTravelerChange(index, 'passportNumber', e.target.value)}
                              placeholder="Passport number"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-passport-expiry`}>Passport Expiry</Label>
                            <Input
                              id={`traveler-${index}-passport-expiry`}
                              type="date"
                              value={traveler.passportExpiry || ''}
                              onChange={(e) => handleTravelerChange(index, 'passportExpiry', e.target.value)}
                              className="mt-1"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-dob`}>Date of Birth</Label>
                            <Input
                              id={`traveler-${index}-dob`}
                              type="date"
                              value={traveler.dateOfBirth || ''}
                              onChange={(e) => handleTravelerChange(index, 'dateOfBirth', e.target.value)}
                              className="mt-1"
                              max={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`traveler-${index}-dietary`}>Dietary Requirements</Label>
                            <Input
                              id={`traveler-${index}-dietary`}
                              value={traveler.dietaryRequirements || ''}
                              onChange={(e) => handleTravelerChange(index, 'dietaryRequirements', e.target.value)}
                              placeholder="e.g., vegetarian, allergies"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`traveler-${index}-special`}>Special Needs</Label>
                            <Input
                              id={`traveler-${index}-special`}
                              value={traveler.specialNeeds || ''}
                              onChange={(e) => handleTravelerChange(index, 'specialNeeds', e.target.value)}
                              placeholder="Any special needs or requirements"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium">Note:</p>
                      <p className="text-blue-700 text-sm">
                        Traveler details can be provided later. This information helps us prepare your documents and special arrangements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    ← Previous
                  </Button>
                )}
                
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </Button>
                )}
              </div>

              <div>
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-4 h-4" />
                        Submit Booking
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
