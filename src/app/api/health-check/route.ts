import { NextRequest, NextResponse } from "next/server";
import { databases, storage } from "@/models/server/config";
import { db, blogCollection, tripCollection, activityCollection, mediaCollection, packageCollection } from "@/models/name";

export async function GET(_request: NextRequest) {
  try {
    console.log('🏥 HEALTH CHECK: Starting comprehensive system health check...');
    
    interface HealthCheckReport {
      timestamp: string;
      overall: 'unknown' | 'healthy' | 'degraded' | 'unhealthy';
      checks: {
        database?: {
          status: 'healthy' | 'unhealthy';
          id?: string;
          name?: string;
          error?: string;
        };
        collections?: Record<string, {
          status: 'healthy' | 'unhealthy';
          id?: string;
          documentCount?: number;
          accessible: boolean;
          error?: string;
        }>;
        storage?: {
          status: 'healthy' | 'unhealthy';
          bucketCount?: number;
          buckets?: Array<{ id: string; name: string }>;
          error?: string;
        };
        environment?: {
          status: 'healthy' | 'unhealthy';
          variables: Record<string, boolean>;
          allSet: boolean;
        };
      };
      summary?: {
        totalChecks: number;
        healthyChecks: number;
        unhealthyChecks: number;
        healthPercentage: number;
      };
    }
    
    const healthReport: HealthCheckReport = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      checks: {}
    };
    
    // Check 1: Database Connection
    try {
      const database = await databases.get(db);
      healthReport.checks.database = {
        status: 'healthy',
        id: database.$id,
        name: database.name
      };
      console.log('✅ Database connection: Healthy');
    } catch (error) {
      healthReport.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log('❌ Database connection: Unhealthy');
    }
    
    // Check 2: Collections Status
    const collections = [
      { name: 'blogs', collection: blogCollection },
      { name: 'trips', collection: tripCollection },
      { name: 'activities', collection: activityCollection },
      { name: 'media', collection: mediaCollection },
      { name: 'packages', collection: packageCollection }
    ];
    
    healthReport.checks.collections = {};
    
    for (const { name, collection } of collections) {
      try {
        const collectionObj = await databases.getCollection(db, collection);
        const response = await databases.listDocuments(db, collection);
        
        healthReport.checks.collections[name] = {
          status: 'healthy',
          id: collectionObj.$id,
          documentCount: response.total,
          accessible: true
        };
        console.log(`✅ Collection ${name}: Healthy (${response.total} documents)`);
      } catch (error) {
        healthReport.checks.collections[name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          accessible: false
        };
        console.log(`❌ Collection ${name}: Unhealthy`);
      }
    }
    
    // Check 3: Storage Status
    try {
      const buckets = await storage.listBuckets();
      healthReport.checks.storage = {
        status: 'healthy',
        bucketCount: buckets.total,
        buckets: buckets.buckets.map(b => ({ id: b.$id, name: b.name }))
      };
      console.log('✅ Storage: Healthy');
    } catch (error) {
      healthReport.checks.storage = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log('❌ Storage: Unhealthy');
    }
    
    // Check 4: Environment Variables
    const envVars = {
      NEXT_PUBLIC_APPWRITE_HOST_URL: !!process.env.NEXT_PUBLIC_APPWRITE_HOST_URL,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY: !!process.env.APPWRITE_API_KEY,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
    };
    
    const allEnvVarsSet = Object.values(envVars).every(Boolean);
    healthReport.checks.environment = {
      status: allEnvVarsSet ? 'healthy' : 'unhealthy',
      variables: envVars,
      allSet: allEnvVarsSet
    };
    
    if (allEnvVarsSet) {
      console.log('✅ Environment variables: Healthy');
    } else {
      console.log('❌ Environment variables: Unhealthy');
    }
    
    // Calculate overall health
    const allChecks = [
      healthReport.checks.database?.status,
      ...Object.values(healthReport.checks.collections || {}).map((c) => c.status),
      healthReport.checks.storage?.status,
      healthReport.checks.environment?.status
    ].filter(Boolean) as string[];
    
    const healthyChecks = allChecks.filter(status => status === 'healthy').length;
    const totalChecks = allChecks.length;
    const healthPercentage = (healthyChecks / totalChecks) * 100;
    
    if (healthPercentage >= 90) {
      healthReport.overall = 'healthy';
    } else if (healthPercentage >= 70) {
      healthReport.overall = 'degraded';
    } else {
      healthReport.overall = 'unhealthy';
    }
    
    healthReport.summary = {
      totalChecks,
      healthyChecks,
      unhealthyChecks: totalChecks - healthyChecks,
      healthPercentage: Math.round(healthPercentage)
    };
    
    console.log(`🏥 HEALTH CHECK COMPLETE: Overall status: ${healthReport.overall} (${healthPercentage.toFixed(1)}%)`);
    
    return NextResponse.json({ 
      success: true, 
      health: healthReport
    });
    
  } catch (error) {
    console.error('🏥 HEALTH CHECK ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        health: {
          timestamp: new Date().toISOString(),
          overall: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
