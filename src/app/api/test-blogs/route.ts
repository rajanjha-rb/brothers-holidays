import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, blogCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('Testing database connection...');
    console.log('Database:', db);
    console.log('Collection:', blogCollection);
    
    // Test database connection
    const database = await databases.get(db);
    console.log('Database found:', database.$id);
    
    // Test collection connection
    const collection = await databases.getCollection(db, blogCollection);
    console.log('Collection found:', collection.$id);
    
    // Fetch all documents
    const response = await databases.listDocuments(db, blogCollection);
    console.log('Total documents found:', response.total);
    console.log('Documents:', response.documents);
    
    return NextResponse.json({ 
      success: true, 
      total: response.total,
      documents: response.documents,
      database: database.$id,
      collection: collection.$id
    });
  } catch (error) {
    console.error('Error testing blogs:', error);
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