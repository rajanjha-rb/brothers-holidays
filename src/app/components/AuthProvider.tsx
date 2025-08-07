"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { verfiySession, setHydrated } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Starting auth initialization');
        
        // Set hydrated immediately for faster rendering
        setHydrated();
        
        // Always verify session on app load to ensure auth state is correct
        await verfiySession();
        
        console.log('🔍 AuthProvider: Auth initialization completed');
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Only run auth check once on mount
    if (!isInitialized) {
      initializeAuth();
    }
  }, [verfiySession, setHydrated, isInitialized]);

  // Show loading state only during initial auth check
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 