import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, tripCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking trips collection...');
    console.log('Database config:');
    console.log('- Database:', db);
    console.log('- Collection:', tripCollection);
    
    const response = await databases.listDocuments(db, tripCollection);
    console.log('✅ Database query successful');
    console.log('- Total documents:', response.total);
    
    // Detailed analysis of each document
    const documentAnalysis = response.documents.map((doc: Record<string, unknown>) => ({
      id: doc.$id,
      hasTitle: !!doc.title,
      hasName: !!doc.name,
      hasDescription: !!doc.description,
      hasContent: !!doc.content,
      hasDifficulty: !!doc.difficulty,
      hasSlug: !!doc.slug,
      titleValue: doc.title || null,
      nameValue: doc.name || null,
      contentType: doc.title ? 'blog' : (doc.name ? 'trip' : 'unknown'),
      allFields: Object.keys(doc).filter(key => !key.startsWith('$'))
    }));
    
    console.log('Trip document analysis:', documentAnalysis);
    
    return NextResponse.json({ 
      success: true, 
      total: response.total,
      documents: response.documents,
      analysis: documentAnalysis,
      collection: 'trips'
    });
  } catch (error) {
    console.error('❌ DEBUG: Error accessing trips database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        collection: 'trips'
      },
      { status: 500 }
    );
  }
} 