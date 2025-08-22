"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaDatabase, FaUsers, FaCog, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AdminManagementPage() {
  const [initializing, setInitializing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const [testingCollections, setTestingCollections] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, CollectionTestResult> | null>(null);
  const [healthCheck, setHealthCheck] = useState(false);
  const [healthResults, setHealthResults] = useState<HealthCheckResult | null>(null);

  interface CollectionTestResult {
    success: boolean;
    error?: string;
    testDocumentCreated?: boolean;
    totalDocuments?: number;
  }

  interface HealthCheckResult {
    timestamp: string;
    overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
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

  const initializeDatabase = async () => {
    setInitializing(true);
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Database initialized successfully!');
        setDbStatus('healthy');
      } else {
        toast.error(data.message || 'Failed to initialize database');
        setDbStatus('unhealthy');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database');
      setDbStatus('unhealthy');
    } finally {
      setInitializing(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/init-db');
      const data = await response.json();

      if (data.success) {
        setDbStatus('healthy');
        toast.success('Database is healthy!');
      } else {
        setDbStatus('unhealthy');
        toast.error('Database has issues');
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus('unhealthy');
      toast.error('Failed to check database status');
    }
  };

  const testCollections = async () => {
    setTestingCollections(true);
    try {
      const response = await fetch('/api/test-collections');
      const data = await response.json();

      if (data.success) {
        setTestResults(data.results);
        toast.success('Collection test completed! Check results below.');
      } else {
        toast.error(data.message || 'Failed to test collections');
      }
    } catch (error) {
      console.error('Error testing collections:', error);
      toast.error('Failed to test collections');
    } finally {
      setTestingCollections(false);
    }
  };

  const runHealthCheck = async () => {
    setHealthCheck(true);
    try {
      const response = await fetch('/api/health-check');
      const data = await response.json();

      if (data.success) {
        setHealthResults(data.health);
        toast.success('Health check completed! Check results below.');
      } else {
        toast.error(data.message || 'Failed to run health check');
      }
    } catch (error) {
      console.error('Error running health check:', error);
      toast.error('Failed to run health check');
    } finally {
      setHealthCheck(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-2">Manage system settings and database operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Database Management */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <FaDatabase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dbStatus === 'healthy' && <FaCheckCircle className="text-green-500 inline mr-2" />}
                  {dbStatus === 'unhealthy' && <FaExclamationTriangle className="text-red-500 inline mr-2" />}
                  {dbStatus === 'unknown' && <FaCog className="text-gray-500 inline mr-2" />}
                  {dbStatus === 'healthy' ? 'Healthy' : dbStatus === 'unhealthy' ? 'Issues' : 'Unknown'}
                </div>
                <Badge 
                  variant={dbStatus === 'healthy' ? 'default' : dbStatus === 'unhealthy' ? 'destructive' : 'secondary'}
                  className="ml-2"
                >
                  {dbStatus === 'healthy' ? 'OK' : dbStatus === 'unhealthy' ? 'ERROR' : 'UNKNOWN'}
                </Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={checkDatabaseStatus}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  Check Status
                </Button>
                <Button 
                  onClick={initializeDatabase}
                  disabled={initializing}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {initializing ? 'Initializing...' : 'Initialize Database'}
                </Button>
                <Button 
                  onClick={testCollections}
                  disabled={testingCollections}
                  variant="outline"
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {testingCollections ? 'Testing...' : 'Test Collections'}
                </Button>
                <Button 
                  onClick={runHealthCheck}
                  disabled={healthCheck}
                  variant="outline"
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {healthCheck ? 'Checking...' : 'Health Check'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <FaUsers className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">Active Users</div>
              <p className="text-xs text-gray-600 mb-4">Manage user accounts and permissions</p>
              <Button variant="outline" size="sm" className="w-full">
                View Users
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Settings</CardTitle>
              <FaCog className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">Configuration</div>
              <p className="text-xs text-gray-600 mb-4">System configuration and preferences</p>
              <Button variant="outline" size="sm" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Database Issues Warning */}
        {dbStatus === 'unhealthy' && (
          <Card className="mt-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Database Issues Detected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Some collections may be missing or corrupted. Click &quot;Initialize Database&quot; above to attempt to fix these issues.
                  </p>
                  <div className="mt-3">
                    <Button 
                      onClick={initializeDatabase}
                      disabled={initializing}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {initializing ? 'Fixing...' : 'Fix Database Issues'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {testResults && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  🧪
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Collection Test Results</h3>
                  <div className="space-y-2">
                    {Object.entries(testResults).map(([collectionName, result]: [string, CollectionTestResult]) => (
                      <div key={collectionName} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium capitalize">{collectionName}</span>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <>
                              <span className="text-green-600 text-xs">✓ Working</span>
                              <span className="text-xs text-gray-500">({result.totalDocuments || 0} docs)</span>
                            </>
                          ) : (
                            <>
                              <span className="text-red-600 text-xs">✗ Failed</span>
                              <span className="text-xs text-gray-500">{result.error}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Check Results */}
        {healthResults && (
          <Card className="mt-6 bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  🏥
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-purple-800 mb-3">System Health Check Results</h3>
                  
                  {/* Overall Status */}
                  <div className="mb-4 p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Status</span>
                      <Badge 
                        variant={healthResults.overall === 'healthy' ? 'default' : healthResults.overall === 'degraded' ? 'secondary' : 'destructive'}
                      >
                        {healthResults.overall.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {healthResults.summary?.healthyChecks} of {healthResults.summary?.totalChecks} checks passed 
                      ({healthResults.summary?.healthPercentage}%)
                    </div>
                  </div>

                  {/* Database Status */}
                  {healthResults.checks?.database && (
                    <div className="mb-3 p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database</span>
                        <Badge variant={healthResults.checks.database.status === 'healthy' ? 'default' : 'destructive'}>
                          {healthResults.checks.database.status}
                        </Badge>
                      </div>
                      {healthResults.checks.database.status === 'healthy' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {healthResults.checks.database.name} ({healthResults.checks.database.id})
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collections Status */}
                  {healthResults.checks?.collections && (
                    <div className="mb-3 p-2 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Collections</span>
                        <span className="text-xs text-gray-500">
                          {Object.values(healthResults.checks.collections).filter((c) => c.status === 'healthy').length} of {Object.keys(healthResults.checks.collections).length} healthy
                        </span>
                      </div>
                      <div className="space-y-1">
                        {healthResults.checks.collections && Object.entries(healthResults.checks.collections).map(([name, result]) => (
                          <div key={name} className="flex items-center justify-between text-xs">
                            <span className="capitalize">{name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={result.status === 'healthy' ? 'default' : 'destructive'} className="text-xs">
                                {result.status}
                              </Badge>
                              {result.status === 'healthy' && result.documentCount !== undefined && (
                                <span className="text-gray-500">({result.documentCount} docs)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Storage Status */}
                  {healthResults.checks?.storage && (
                    <div className="mb-3 p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Storage</span>
                        <Badge variant={healthResults.checks.storage.status === 'healthy' ? 'default' : 'destructive'}>
                          {healthResults.checks.storage.status}
                        </Badge>
                      </div>
                      {healthResults.checks.storage.status === 'healthy' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {healthResults.checks.storage.bucketCount} buckets available
                        </div>
                      )}
                    </div>
                  )}

                  {/* Environment Status */}
                  {healthResults.checks?.environment && (
                    <div className="mb-3 p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Environment</span>
                        <Badge variant={healthResults.checks.environment.status === 'healthy' ? 'default' : 'destructive'}>
                          {healthResults.checks.environment.status}
                        </Badge>
                      </div>
                      {healthResults.checks.environment.status === 'unhealthy' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Missing environment variables
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <FaCog className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Database Management Instructions</h3>
                <div className="text-sm text-blue-700 mt-2 space-y-1">
                  <p>• <strong>Check Status:</strong> Verify the current state of your database and collections</p>
                  <p>• <strong>Initialize Database:</strong> Create missing collections and set up the database structure</p>
                  <p>• <strong>Fix Issues:</strong> Automatically resolve common database problems</p>
                  <p className="mt-2 text-xs">
                    <strong>Note:</strong> If you&apos;re experiencing dashboard access issues, try initializing the database first.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 