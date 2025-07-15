"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type User = {
  name?: string;
  email?: string;
  prefs?: { avatar?: string };
}

function pastelColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 60%, 85%)`;
}

export function UserAvatar({ user, size = "md" }: { user: User, size?: "sm" | "md" | "lg" }) {
  const router = useRouter();
  if (!user) return null;
  const displayName = user.name || user.email || "User";
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const initialsBg = pastelColor(user.name || user.email || "U");
  const isValidAvatar = user.prefs?.avatar && /^https?:\/\//.test(user.prefs.avatar);
  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-8 h-8 text-base",
    lg: "w-10 h-10 text-lg"
  };
  
  const handleClick = () => {
    router.push("/dashboard");
  };
  
  return (
    <div 
      className={
        `flex items-center gap-2 px-3 py-1.5 rounded-full min-w-0 max-w-[200px] shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`
      }
      style={{
        background: '#0057B7',
        boxShadow: '0 2px 8px rgba(0, 87, 183, 0.10)',
      }}
      onClick={handleClick}
    >
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden border flex-shrink-0`}
        style={{ border: '2px solid #FFD166', background: '#fff' }}
      >
        {isValidAvatar ? (
          <Image
            src={user.prefs?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-full h-full object-cover rounded-full"
            fill
          />
        ) : (
          <span
            className="w-full h-full flex items-center justify-center font-semibold text-blue-900 rounded-full"
            style={{ background: initialsBg, fontFamily: 'Poppins, Arial, sans-serif', letterSpacing: '0.03em' }}
          >
            {initial}
          </span>
        )}
      </div>
      <span className={`font-medium text-white tracking-wide font-sans truncate flex-1 min-w-0 ${
        size === "lg" ? "text-base" : "text-sm"
      }`} style={{lineHeight: 1.2}}>
        {displayName}
      </span>
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