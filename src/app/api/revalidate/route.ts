import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    // Verify the secret to prevent unauthorized revalidation
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate the specific path
    revalidatePath(path);

    return NextResponse.json({ 
      message: 'Revalidated successfully',
      path: path,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Revalidation endpoint ready' });
} 