import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/models/server/config";
import { db, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log("=== PACKAGE COLLECTION DEBUG START ===");
    
    // Check database
    console.log("1. Checking database...");
    let database;
    try {
      database = await databases.get(db);
      console.log("✅ Database found:", database.$id, "Name:", database.name);
    } catch (error) {
      console.log("❌ Database not found:", error);
      return NextResponse.json({
        success: false,
        message: "Database not found",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    // Check collection
    console.log("2. Checking package collection...");
    let collection;
    try {
      collection = await databases.getCollection(db, packageCollection);
      console.log("✅ Package collection found:", collection.$id, "Name:", collection.name);
    } catch (error) {
      console.log("❌ Package collection not found:", error);
      return NextResponse.json({
        success: false,
        message: "Package collection not found",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    // Check attributes
    console.log("3. Checking collection attributes...");
    let attributes;
    try {
      attributes = await databases.listAttributes(db, packageCollection);
      console.log("✅ Attributes found:", attributes.attributes.length);
      console.log("Attribute names:", attributes.attributes.map(attr => attr.key));
    } catch (error) {
      console.log("❌ Could not list attributes:", error);
      return NextResponse.json({
        success: false,
        message: "Could not list collection attributes",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    // Check documents
    console.log("4. Checking documents...");
    let documents;
    try {
      documents = await databases.listDocuments(db, packageCollection, []);
      console.log("✅ Documents found:", documents.documents.length);
      if (documents.documents.length > 0) {
        console.log("Sample document:", documents.documents[0]);
      }
    } catch (error) {
      console.log("❌ Could not list documents:", error);
      return NextResponse.json({
        success: false,
        message: "Could not list collection documents",
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
    console.log("=== PACKAGE COLLECTION DEBUG COMPLETE ===");
    
    return NextResponse.json({
      success: true,
      database: {
        id: database.$id,
        name: database.name
      },
      collection: {
        id: collection.$id,
        name: collection.name,
        documentCount: documents.documents.length
      },
      attributes: {
        count: attributes.attributes.length,
        names: attributes.attributes.map(attr => attr.key)
      },
      documents: documents.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        createdAt: doc.$createdAt
      }))
    });
  } catch (error) {
    console.error("=== PACKAGE COLLECTION DEBUG ERROR ===");
    console.error("Error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Debug failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
