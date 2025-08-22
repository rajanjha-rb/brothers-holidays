"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthState } from "@/store/auth";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./components/DashboardSidebar";
import { toast } from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, loading, isAdmin, adminChecked } = useAuthState();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const [checkingDb, setCheckingDb] = useState(false);

  useEffect(() => {
    // Only check after auth is hydrated and admin status is checked
    if (hydrated && !loading && adminChecked && !isAdmin) {
      // Redirect non-admin users to home page
      console.log('🔒 Dashboard: Access denied - redirecting non-admin user');
      router.push("/");
    }
  }, [isAdmin, adminChecked, loading, hydrated, router]);

  // Check database status when dashboard loads
  const checkDatabaseStatus = useCallback(async () => {
    if (checkingDb) return;
    
    setCheckingDb(true);
    try {
      console.log('🔍 Dashboard: Checking database status...');
      const response = await fetch('/api/init-db');
      const data = await response.json();

      if (data.success) {
        setDbStatus('healthy');
        console.log('✅ Dashboard: Database status healthy');
      } else {
        setDbStatus('unhealthy');
        console.log('❌ Dashboard: Database status unhealthy');
        // Show warning toast for database issues
        toast.error('Database has issues. Some features may not work properly.', {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Dashboard: Error checking database status:', error);
      setDbStatus('unhealthy');
      toast.error('Failed to check database status. Some features may not work properly.', {
        duration: 5000,
      });
    } finally {
      setCheckingDb(false);
    }
  }, [checkingDb]);

  useEffect(() => {
    // Only check database status once when dashboard loads
    if (hydrated && !loading && adminChecked && isAdmin && dbStatus === 'unknown') {
      console.log('🔍 Dashboard: Admin user detected, checking database status...');
      checkDatabaseStatus();
    }
  }, [hydrated, loading, adminChecked, isAdmin, checkDatabaseStatus, dbStatus]);

  // Show loading state while checking admin status
  if (loading || !hydrated || !adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking permissions...</p>
          <p className="text-sm text-gray-500 mt-2">Verifying admin access</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content for non-admin users
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access the dashboard.</p>
          <button 
            onClick={() => router.push("/")} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Database Status Warning */}
        {dbStatus === 'unhealthy' && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-red-800">
                  <strong>Database Issues Detected:</strong> Some collections may be missing. 
                  <a 
                    href="/dashboard/admin-management" 
                    className="ml-2 underline hover:text-red-900"
                  >
                    Fix Now
                  </a>
                </div>
              </div>
              <button
                onClick={checkDatabaseStatus}
                disabled={checkingDb}
                className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
              >
                {checkingDb ? 'Checking...' : 'Recheck'}
              </button>
            </div>
          </div>
        )}
        
        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
