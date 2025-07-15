"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { verfiySession } = useAuthStore();

  useEffect(() => {
    // Verify session on app load
    verfiySession();
  }, [verfiySession]);

  return <>{children}</>;
} 