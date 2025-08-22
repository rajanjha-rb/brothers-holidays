import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, activityCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 API: Fetching activities...');
    console.log('Database:', db);
    console.log('Collection:', activityCollection);
    
    const response = await databases.listDocuments(db, activityCollection);
    console.log('API Response total:', response.total);
    console.log('API Response documents:', response.documents.length);
    
    const activities = response.documents.map((doc: Record<string, unknown>) => ({
      $id: doc.$id,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      featuredImage: doc.featuredImage,
      tags: doc.tags,
      category: doc.category,
      duration: doc.duration,
      location: doc.location,
      price: doc.price,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
    
    console.log('API Mapped activities:', activities);
    
    return NextResponse.json({ 
      success: true, 
      activities: activities,
      total: response.total
    });
  } catch (error) {
    console.error('API Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch activities',
        details: error 
      },
      { status: 500 }
    );
  }
}
