"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "../../../store/auth";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loginAttempts, setLoginAttempts] = React.useState(0);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [blockTime, setBlockTime] = React.useState(0);


  useEffect(() => {
    document.body.classList.remove("mobile-menu-open");
    document.body.style.overflow = "";
    
    // Check for existing block from localStorage
    const storedBlockTime = localStorage.getItem('loginBlockTime');
    if (storedBlockTime) {
      const blockUntil = parseInt(storedBlockTime);
      const now = Date.now();
      if (now < blockUntil) {
        setIsBlocked(true);
        setBlockTime(blockUntil);
      } else {
        localStorage.removeItem('loginBlockTime');
      }
    }
  }, []);

  useEffect(() => {
    if (isBlocked && blockTime > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= blockTime) {
          setIsBlocked(false);
          setBlockTime(0);
          localStorage.removeItem('loginBlockTime');
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTime]);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isBlocked) {
      const remainingTime = Math.ceil((blockTime - Date.now()) / 1000);
      setError(`Too many failed attempts. Please try again in ${remainingTime} seconds.`);
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    const loginResponse = await login(email.toString(), password.toString());
    if (loginResponse.error) {
      setError(loginResponse.error.message);
      // Increment failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Block after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        const blockUntil = Date.now() + (15 * 60 * 1000); // 15 minutes
        setIsBlocked(true);
        setBlockTime(blockUntil);
        localStorage.setItem('loginBlockTime', blockUntil.toString());
        setError("Too many failed attempts. Please try again in 15 minutes.");
      }
    } else {
      // Reset attempts on successful login
      setLoginAttempts(0);
      localStorage.removeItem('loginBlockTime');
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gold-100 relative">
      {/* Adventurous SVG Motif: Layered mountains, sun, winding path, hot air balloon */}
      <svg className="fixed bottom-0 left-0 w-full h-80 z-0 pointer-events-none select-none" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.22}}>
        {/* Sun */}
        <circle cx="1200" cy="80" r="40" fill="#FFD166" fillOpacity="0.7" />
        {/* Back mountains */}
        <path fill="#0057B7" fillOpacity="0.5" d="M0,320L120,300C240,280,480,240,720,250C960,260,1200,320,1320,340L1440,360L1440,400L0,400Z" />
        {/* Middle mountains */}
        <path fill="#0057B7" fillOpacity="0.7" d="M0,350L180,320C360,290,720,270,1080,300C1260,315,1440,350,1440,350L1440,400L0,400Z" />
        {/* Foreground mountain */}
        <path fill="#FFD166" fillOpacity="0.7" d="M0,400L200,370C400,340,800,370,1200,390L1440,400L0,400Z" />
        {/* Winding path */}
        <path d="M400,390 Q600,350 700,370 Q800,390 900,350 Q1000,320 1100,370" stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="12 10" opacity="0.7" />
        {/* Hot air balloon */}
        <g transform="translate(1050,180) scale(1.2)">
          <ellipse cx="0" cy="0" rx="12" ry="16" fill="#fff" fillOpacity="0.8" />
          <ellipse cx="0" cy="-6" rx="10" ry="10" fill="#0057B7" fillOpacity="0.8" />
          <rect x="-3" y="12" width="6" height="6" fill="#FFD166" fillOpacity="0.8" rx="1" />
          <line x1="0" y1="8" x2="0" y2="12" stroke="#FFD166" strokeWidth="2" />
        </g>
      </svg>
      <div className="w-full max-w-md px-6 py-10 bg-white rounded-xl border border-gray-200 shadow-lg animate-fadein transform transition-all duration-500 hover:shadow-2xl hover:scale-105 relative z-10 -mt-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 px-4 py-2 inline-block mb-2" style={{letterSpacing: "1px"}}>
              WELCOME BACK
            </h1>
            <p className="text-gray-500 text-base md:text-lg font-medium ml-1">Welcome back! Please enter your details.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-semibold text-gray-800">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                className="mt-2 h-12 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                </div>
            <div>
              <Label htmlFor="password" className="text-base font-semibold text-gray-800">Password</Label>
              <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                  placeholder="********"
                  className="h-12 border-gray-300 rounded-lg text-base pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg transition-all duration-300"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                    disabled={isLoading}
                  >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-blue-500 w-4 h-4 rounded"
                />
                <span className="text-gray-700">Remember me</span>
              </label>
              <Link href="#" className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Forgot password</Link>
            </div>
            <Button
              type="submit"
              disabled={isLoading || isBlocked}
              className={`w-full h-12 text-base font-semibold rounded-lg transition-all duration-300 shadow-md mt-2 transform hover:scale-105 hover:shadow-xl focus:scale-105 focus:shadow-xl ${
                isBlocked 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
              style={{boxShadow: isBlocked ? "none" : "0 4px 15px rgba(215,38,49,0.10)"}}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : isBlocked ? (
                <div className="flex items-center gap-2">
                  <span>Account Temporarily Locked</span>
                  {blockTime > 0 && (
                    <span className="text-sm">
                      ({Math.ceil((blockTime - Date.now()) / 1000)}s)
                    </span>
                  )}
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-red-500 font-semibold hover:underline">Sign up fo free!</Link>
        </div>
      </div>
      {/* Fade-in animation */}
      <style jsx global>{`
        @keyframes fadein {
          0% { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fadein {
          animation: fadein 0.7s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
}
