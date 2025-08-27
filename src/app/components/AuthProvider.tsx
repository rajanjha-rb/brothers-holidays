"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Global singleton to prevent multiple auth initializations
let authInitialized = false;
let authInitializing = false;

// Export function to reset auth initialization state (for login/logout)
export const resetAuthInitialization = () => {
  authInitialized = false;
  authInitializing = false;
  console.log('🔄 Auth initialization state reset');
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { verifySession, setHydrated, hydrated } = useAuthStore();
  const pathname = usePathname();
  const mounted = useRef(false);
  
  // Check if current page needs auth immediately
  const needsAuth = pathname?.startsWith('/dashboard');
  
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    const initializeAuth = async () => {
      try {
        // Always set hydrated first for immediate rendering
        if (!hydrated) {
          setHydrated();
        }
        
        // If auth was already initialized globally, just use cached state
        if (authInitialized) {
          console.log('🚀 AuthProvider: Using cached auth state');
          setIsReady(true);
          setInitError(null);
          return;
        }
        
        // If another instance is initializing, wait for it
        if (authInitializing) {
          console.log('🚀 AuthProvider: Waiting for ongoing auth initialization');
          // Wait for other initialization to complete
          const checkInterval = setInterval(() => {
            if (authInitialized || !authInitializing) {
              clearInterval(checkInterval);
              setIsReady(true);
              setInitError(null);
            }
          }, 50);
          return;
        }
        
        // Mark as initializing
        authInitializing = true;
        
        console.log('🚀 AuthProvider: Performing one-time auth initialization');
        
        // Perform auth check once globally
        await verifySession();
        
        // Mark auth as initialized globally
        authInitialized = true;
        authInitializing = false;
        
        console.log('🚀 AuthProvider: Auth initialization completed globally');
        
        setInitError(null);
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        authInitializing = false;
        
        if (needsAuth) {
          setInitError(error instanceof Error ? error.message : 'Authentication failed');
        } else {
          // Don't show errors for public pages - just continue
          setInitError(null);
        }
      } finally {
        setIsReady(true);
      }
    };

    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run once only

  // Show loading state only for protected routes when not ready
  if (!isReady && needsAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state only for protected routes if initialization failed
  if (initError && needsAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => {
              // Reset global state and reload
              authInitialized = false;
              authInitializing = false;
              window.location.reload();
            }} 
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
