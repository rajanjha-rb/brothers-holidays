import React from "react";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";

// Force revalidation to ensure we always get the latest data
export const revalidate = 0;

interface Trip {
  $id: string;
  name: string;
  slug: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  difficulty?: string;
  $createdAt: string;
  $updatedAt: string;
}

// This function runs at build time and revalidates every 60 seconds
export async function generateStaticParams() {
  try {
    // For the main trips page, we don't need to fetch all trips at build time
    // The actual data will be fetched in the page component
    return [];
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// On-demand revalidation - pages will be revalidated when content changes
// No time-based revalidation to avoid unnecessary server load

// Fetch trips data on the server side
async function getTrips(): Promise<Trip[]> {
      try {
    console.log('🔍 Fetching trips from main page...');
    console.log('Environment check:', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      apiKeySet: !!process.env.APPWRITE_API_KEY
    });
    console.log('Database:', db);
    console.log('Collection:', tripCollection);
    
        const response = await databases.listDocuments(db, tripCollection);
    console.log('Response total:', response.total);
    console.log('Response documents:', response.documents.length);
    console.log('Raw documents:', response.documents);
    
        const tripsData = response.documents as unknown as Trip[];
    
        // Sort by creation date (newest first)
        const sortedTrips = tripsData.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
    
    console.log('Sorted trips:', sortedTrips.length);
    console.log('Final trips:', sortedTrips);
    return sortedTrips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw new Error('Failed to fetch trips');
  }
}

import TripsClient from "./TripsClient";

export default async function TripsPage() {
  try {
    console.log('TripsPage: Starting to fetch trips...');
    console.log('TripsPage: Environment check -', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      apiKeySet: !!process.env.APPWRITE_API_KEY
    });
    
  const trips = await getTrips();
    console.log('TripsPage: Fetched trips successfully:', trips.length);
    console.log('TripsPage: Trips data:', trips);
    

  return <TripsClient initialTrips={trips} />;
  } catch (error) {
    console.error('TripsPage: Error fetching trips:', error);
    
    // Return a fallback component with error information
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Trips</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <p className="text-sm text-gray-500">
            Please check the server console for more details.
          </p>
          <pre className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
} 