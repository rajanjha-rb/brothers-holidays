import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 API: Fetching trips...');
    console.log('Database:', db);
    console.log('Collection:', tripCollection);
    
    const response = await databases.listDocuments(db, tripCollection);
    console.log('API Response total:', response.total);
    console.log('API Response documents:', response.documents.length);
    
    const trips = response.documents.map((doc: Record<string, unknown>) => ({
      $id: doc.$id,
      name: doc.name,
      slug: doc.slug,
      featuredImage: doc.featuredImage,
      tags: doc.tags,
      difficulty: doc.difficulty,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt
    }));
    
    console.log('API Mapped trips:', trips);
    
    return NextResponse.json({ 
      success: true, 
      trips: trips,
      total: response.total
    });
  } catch (error) {
    console.error('API Error fetching trips:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
        details: error 
      },
      { status: 500 }
    );
  }
} 