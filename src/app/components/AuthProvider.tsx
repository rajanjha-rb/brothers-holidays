"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { verifySession, setHydrated } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Starting auth initialization');
        
        // Set hydrated immediately for faster rendering
        setHydrated();
        
        // Always verify session on app load to ensure auth state is correct
        await verifySession();
        
        console.log('🔍 AuthProvider: Auth initialization completed');
        setInitError(null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown auth error');
      } finally {
        setIsInitialized(true);
      }
    };

    // Only run auth check once on mount
    if (!isInitialized) {
      initializeAuth();
    }
  }, [verifySession, setHydrated, isInitialized]);

  // Show loading state only during initial auth check
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 