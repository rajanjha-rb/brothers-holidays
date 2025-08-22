import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, destinationCollection } from "@/models/name";
import { Query } from "node-appwrite";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 API: Fetching destinations...');
    console.log('Database:', db);
    console.log('Collection:', destinationCollection);
    
    // Prefer querying by explicit type when available
    let response = await databases.listDocuments(db, destinationCollection, [
      Query.equal('type', 'destination')
    ]);

    // Fallback to full fetch if none typed
    if (!response.documents || response.documents.length === 0) {
      console.log('No typed destinations found, falling back to full collection fetch');
      response = await databases.listDocuments(db, destinationCollection);
    }

    console.log('API Response total:', response.total);
    console.log('API Response documents:', response.documents.length);
    
    // Filter and validate documents to ensure they are proper destination entries
    const validDestinations = response.documents.filter((doc: Record<string, unknown>) => {
      // Prefer explicit type tagging when present
      if (doc.type && doc.type === 'trip') return false;

      // A valid destination must have ALL required destination fields
      const hasRequiredDestinationFields = (doc.title || doc.name) && 
                                         (doc.metaDescription || doc.description) && 
                                         doc.slug;
      
      // Must not have trip-specific fields or structure (fallback if no type)
      const hasTripFields = doc.difficulty;
      
      const isValidDestination = hasRequiredDestinationFields && !hasTripFields;
      
      if (!isValidDestination) {
        console.log(`Filtering out document ${doc.$id}:`, {
          hasRequiredDestinationFields,
          hasTripFields,
          title: doc.title,
          name: doc.name,
          metaDescription: doc.metaDescription,
          description: doc.description,
          slug: doc.slug,
        });
      }
      
      return isValidDestination;
    });

    console.log('Filtered valid destinations:', validDestinations.length);
    console.log('Valid destination names:', validDestinations.map(doc => doc.name));

    const destinations = validDestinations.map((doc: Record<string, unknown>) => ({
      $id: doc.$id,
      title: doc.title || doc.name || '',
      slug: doc.slug || '',
      metaDescription: doc.metaDescription || doc.description || '',
      featuredImage: doc.featuredImage || '',
      tags: doc.tags || [],
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
    
    console.log('API Mapped destinations:', destinations);
    
    return NextResponse.json({ 
      success: true, 
      destinations: destinations,
      total: response.total
    });
  } catch (error) {
    console.error('API Error fetching destinations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch destinations',
        details: error 
      },
      { status: 500 }
    );
  }
}
