"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { verfiySession } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Defer session verification to avoid blocking initial render
    if (!hasInitialized.current) {
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
  }, [verfiySession]);

  return <>{children}</>;
} 