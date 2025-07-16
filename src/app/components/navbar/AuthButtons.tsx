"use client";
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export type User = {
  name?: string;
  email?: string;
  prefs?: { avatar?: string };
}

export function UserAvatar({ user, size: _size = "md" }: { user: User, size?: "sm" | "md" | "lg" }) {
  const router = useRouter();
  if (!user) return null;
  const displayName = user.name || user.email || "User";
  const initials = (user.name || user.email || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard") }>
      <Avatar>
        <AvatarFallback className="bg-[#22223b] text-white font-bold">{initials}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-black">{displayName}</span>
    </div>
  );
}

export default function AuthButtons({ user, setOpen, variant = "desktop", loading = false }: { user: User | null, setOpen?: (open: boolean) => void, variant?: "desktop" | "mobile", loading?: boolean }) {
  const buttonClasses = variant === "mobile"
    ? "w-full text-center px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[48px] flex items-center justify-center cursor-pointer relative z-10"
    : "px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95";
  
  // Show loading state
  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${variant === "mobile" ? "w-full justify-center" : ""}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        {variant === "mobile" && <span className="text-gray-600">Loading...</span>}
      </div>
    );
  }
  
  if (user) return <UserAvatar user={user} size={variant === "mobile" ? "lg" : "md"} />;
  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-3 w-full relative z-10" style={{ minHeight: "120px" }}>
        <Link href="/register"
          className={`${buttonClasses} text-white`}
          style={{
            background: `linear-gradient(135deg, #0057B7 0%, #003D82 100%)`,
            boxShadow: `0 4px 15px #0057B740`
          }}
          onClick={() => setOpen?.(false)}>
          Sign Up
        </Link>
        <Link href="/login"
          className={`${buttonClasses} border-2 hover:shadow-lg`}
          style={{
            color: '#0057B7',
            borderColor: '#0057B7',
            background: 'rgba(0,87,183,0.05)'
          }}
          onClick={() => setOpen?.(false)}>
          Sign In
        </Link>
      </div>
    );
  }
  return (
    <>
      <Link href="/register"
        className={`${buttonClasses} text-white`}
        style={{
          background: `linear-gradient(135deg, #0057B7 0%, #003D82 100%)`,
          boxShadow: `0 4px 15px #0057B740`
        }}
        onClick={() => setOpen?.(false)}>
        Sign Up
      </Link>
      <Link href="/login"
        className={`${buttonClasses} border-2 hover:shadow-lg`}
        style={{
          color: '#0057B7',
          borderColor: '#0057B7',
          background: 'rgba(0,87,183,0.05)'
        }}
        onClick={() => setOpen?.(false)}>
        Sign In
      </Link>
    </>
  );
}