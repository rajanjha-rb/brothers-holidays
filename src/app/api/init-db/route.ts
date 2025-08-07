import { NextRequest, NextResponse } from 'next/server';
import getOrCreateDB from '@/models/server/dbSetup';
import getOrCreateStorage from '@/models/server/storageSetup';

export async function GET(_request: NextRequest) {
  try {
    // Initialize database and collections
    await getOrCreateDB();
    
    // Initialize storage
    await getOrCreateStorage();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database and storage initialized successfully' 
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database and storage' },
      { status: 500 }
    );
  }
} 