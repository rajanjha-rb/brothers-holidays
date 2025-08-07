import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/models/client/config';

export async function GET(_request: NextRequest) {
  try {
    // Get current session
    const session = await account.getSession('current');
    
    // Get user data
    const user = await account.get();
    
    // Check admin status
    const labels = user.labels || [];
    const hasAdminLabel = Array.isArray(labels) && (
      labels.includes('admin') ||
      labels.includes('Admin') ||
      labels.includes('ADMIN') ||
      labels.some(label => label.toLowerCase() === 'admin')
    );
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        labels: user.labels,
        labelCount: user.labels?.length || 0
      },
      adminStatus: {
        hasAdminLabel,
        labels,
        labelTypes: labels.map(label => typeof label),
        labelLengths: labels.map(label => label?.length)
      },
      session: {
        id: session.$id,
        userId: session.userId,
        expire: session.expire
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      user: null,
      adminStatus: {
        hasAdminLabel: false,
        labels: [],
        labelTypes: [],
        labelLengths: []
      }
    }, { status: 500 });
  }
} 
