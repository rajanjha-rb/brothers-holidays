import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 SIMPLE TEST: Testing basic database access...');
    
    // Test 1: Get database
    console.log('Testing database access...');
    const database = await databases.get(db);
    console.log('✅ Database found:', database.$id);
    
    // Test 2: List all collections
    console.log('Testing collection listing...');
    const collections = await databases.listCollections(db);
    console.log('✅ Collections found:', collections.collections.length);
    
    // Test 3: Try to access each collection
    const collectionResults = [];
    for (const collection of collections.collections) {
      try {
        console.log(`Testing collection: ${collection.name} (${collection.$id})`);
        const docs = await databases.listDocuments(db, collection.$id);
        collectionResults.push({
          name: collection.name,
          id: collection.$id,
          documents: docs.total,
          status: 'accessible'
        });
        console.log(`✅ Collection ${collection.name} accessible with ${docs.total} documents`);
      } catch (error) {
        collectionResults.push({
          name: collection.name,
          id: collection.$id,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
        console.log(`❌ Collection ${collection.name} error:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      database: database.$id,
      totalCollections: collections.collections.length,
      collectionResults
    });
    
  } catch (error) {
    console.error('SIMPLE TEST Error:', error);
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
