import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection, tripCollection, activityCollection, mediaCollection, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Testing all collections...');
    
    interface CollectionResult {
      success: boolean;
      id?: string;
      collectionId?: string;
      totalDocuments?: number;
      documents?: unknown[];
      attributes?: unknown[];
      error?: string;
      collection?: string;
    }
    
    const results: Record<string, CollectionResult> = {};
    
    // Test database connection
    try {
      const database = await databases.get(db);
      results.database = { success: true, id: database.$id };
    } catch (error) {
      results.database = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Test each collection
    const collections = [
      { name: 'blogs', collection: blogCollection },
      { name: 'trips', collection: tripCollection },
      { name: 'activities', collection: activityCollection },
      { name: 'media', collection: mediaCollection },
      { name: 'packages', collection: packageCollection }
    ];
    
    for (const { name, collection } of collections) {
      try {
        console.log(`Testing ${name} collection: ${collection}`);
        
        // Check if collection exists
        const collectionObj = await databases.getCollection(db, collection);
        console.log(`${name} collection found:`, collectionObj.$id);
        
        // Try to list documents
        const response = await databases.listDocuments(db, collection);
        console.log(`${name} documents:`, response.total);
        
        results[name] = {
          success: true,
          collectionId: collectionObj.$id,
          totalDocuments: response.total,
          documents: response.documents.slice(0, 3), // Show first 3 docs
          attributes: collectionObj.attributes || []
        };
        
      } catch (error) {
        console.error(`Error with ${name} collection:`, error);
        results[name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          collection: collection
        };
      }
    }
    
    console.log('DEBUG Results:', results);
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      results 
    });
    
  } catch (error) {
    console.error('DEBUG Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      },
      { status: 500 }
    );
  }
}
