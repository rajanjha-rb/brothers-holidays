import { NextRequest, NextResponse } from 'next/server';
import getOrCreateStorage from '@/models/server/storageSetup';

export async function GET(_request: NextRequest) {
  try {
    await getOrCreateStorage();
    return NextResponse.json({ success: true, message: 'Storage initialized successfully' });
  } catch (error) {
    console.error('Storage initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize storage' },
      { status: 500 }
    );
  }
} 