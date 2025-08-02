"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { verfiySession, hydrated } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only check auth state once when the app loads
    if (!hasInitialized.current && hydrated) {
      hasInitialized.current = true;
      
      // Use requestIdleCallback for better performance, fallback to setTimeout
      const scheduleVerification = () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => verfiySession(), { timeout: 1000 });
        } else {
          setTimeout(() => verfiySession(), 100);
        }
      };
      
      scheduleVerification();
    }
  }, [verfiySession, hydrated]);

  return <>{children}</>;
} 