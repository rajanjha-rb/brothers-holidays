import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection, tripCollection, activityCollection, mediaCollection } from "@/models/name";
import { ID } from "appwrite";

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 TEST: Testing collection creation and access...');
    
    interface CollectionTestResult {
      success: boolean;
      collectionId?: string;
      testDocumentCreated?: boolean;
      totalDocuments?: number;
      message?: string;
      error?: string;
      collection?: string;
    }
    
    const results: Record<string, CollectionTestResult> = {};
    
    // Test each collection
    const collections = [
      { name: 'blogs', collection: blogCollection, testData: { title: 'Test Blog', description: 'Test Description', slug: 'test-blog', content: 'Test Content', tags: ['test'] } },
      { name: 'trips', collection: tripCollection, testData: { name: 'Test Trip', slug: 'test-trip', tags: ['test'], difficulty: 'easy' } },
      { name: 'activities', collection: activityCollection, testData: { name: 'Test Activity', slug: 'test-activity', description: 'Test Description', tags: ['test'] } },
      { name: 'media', collection: mediaCollection, testData: { fileId: 'test-file', fileName: 'test.jpg', fileUrl: 'https://example.com/test.jpg', mimeType: 'image/jpeg', alt: 'Test Image' } }
    ];
    
    for (const { name, collection, testData } of collections) {
      try {
        console.log(`Testing ${name} collection: ${collection}`);
        
        // Check if collection exists
        const collectionObj = await databases.getCollection(db, collection);
        console.log(`${name} collection found:`, collectionObj.$id);
        
        // Try to create a test document
        const testDoc = await databases.createDocument(
          db,
          collection,
          ID.unique(),
          testData
        );
        console.log(`${name} test document created:`, testDoc.$id);
        
        // Try to list documents
        const response = await databases.listDocuments(db, collection);
        console.log(`${name} total documents:`, response.total);
        
        // Clean up test document
        await databases.deleteDocument(db, collection, testDoc.$id);
        console.log(`${name} test document cleaned up`);
        
        results[name] = {
          success: true,
          collectionId: collectionObj.$id,
          testDocumentCreated: true,
          totalDocuments: response.total,
          message: 'Collection working properly'
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
    
    console.log('TEST Results:', results);
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'Collection test completed',
      results 
    });
    
  } catch (error) {
    console.error('TEST Error:', error);
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
