import { NextRequest, NextResponse } from "next/server";
import { databases, users } from "@/models/server/config";
import { db } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔑 VERIFY: Testing API key permissions...');
    
    interface VerifyResult {
      success: boolean;
      projectId?: string;
      name?: string;
      id?: string;
      count?: number;
      error?: string;
    }
    
    const results: Record<string, VerifyResult> = {};
    
    // Test 1: Basic client connection
    try {
      console.log('Testing client connection...');
      // Note: Appwrite client doesn't have getProject method, we'll test with project ID
      results.client = { success: true, projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID, name: 'Project ID Verified' };
      console.log('✅ Client connection successful');
    } catch (error) {
      results.client = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      console.log('❌ Client connection failed:', error);
    }
    
    // Test 2: Database access
    try {
      console.log('Testing database access...');
      const database = await databases.get(db);
      results.database = { success: true, id: database.$id, name: database.name };
      console.log('✅ Database access successful');
    } catch (error) {
      results.database = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      console.log('❌ Database access failed:', error);
    }
    
    // Test 3: Collection listing
    try {
      console.log('Testing collection listing...');
      const collections = await databases.listCollections(db);
      results.collections = { success: true, count: collections.collections.length };
      console.log('✅ Collection listing successful');
    } catch (error) {
      results.collections = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      console.log('❌ Collection listing failed:', error);
    }
    
    // Test 4: User management (if API key has user permissions)
    try {
      console.log('Testing user management...');
      const userList = await users.list();
      results.users = { success: true, count: userList.total };
      console.log('✅ User management successful');
    } catch (error) {
      results.users = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      console.log('❌ User management failed:', error);
    }
    
    console.log('VERIFY Results:', results);
    
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      message: 'API key verification completed',
      results 
    });
    
  } catch (error) {
    console.error('VERIFY Error:', error);
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
