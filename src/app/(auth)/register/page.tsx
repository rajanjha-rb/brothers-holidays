"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "../../../store/auth";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const { login, createAccount } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    document.body.classList.remove("mobile-menu-open");
    document.body.style.overflow = "";
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    const response = await createAccount(
      name.toString(),
      email.toString(),
      password.toString()
    );

    if (response.error) {
      setError(response.error.message);
    } else {
      const loginResponse = await login(email.toString(), password.toString());
      if (loginResponse.error) {
        setError(loginResponse.error.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gold-100 relative">
      <div className="register-main flex flex-col md:flex-row items-center justify-center w-full h-full max-w-6xl mx-auto gap-0 md:gap-20 px-2 md:px-8">
        {/* Left: Heading and subtext (desktop) */}
        <div className="register-left-col hidden md:flex flex-col justify-center items-start w-1/2 h-full pl-20 pr-8 z-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight" style={{letterSpacing: "1px"}}>
            Create Account
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
            Join us for unforgettable adventures.<br/>Sign up to start your journey with Brothers Holidays!
          </p>
        </div>

        {/* Right: Register form card */}
        <div className="w-full max-w-md px-8 py-12 bg-white rounded-xl border border-gray-200 shadow-lg animate-fadein transform transition-all duration-500 hover:shadow-2xl hover:scale-105 relative z-10 md:mt-0 md:ml-8 register-form-card">
          {/* Mobile heading inside form card */}
          <h1 className="block md:hidden text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight leading-tight" style={{letterSpacing: "1px"}}>
            Create Account
          </h1>
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-semibold text-gray-800">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                className="mt-2 h-12 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
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
                  autoComplete="new-password"
                  placeholder="Create a password"
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md mt-2 transform hover:scale-105 hover:shadow-xl focus:scale-105 focus:shadow-xl"
              style={{boxShadow: "0 4px 15px rgba(215,38,49,0.10)"}}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-red-500 font-semibold hover:underline">Sign in</Link>
          </div>
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
      {/* Custom 850px breakpoint for layout switch and centering */}
      <style jsx global>{`
        @media (max-width: 850px) {
          .register-left-col { display: none !important; }
          .register-main { flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; min-height: 100vh !important; }
          .register-form-card { margin-top: 0 !important; }
        }
        @media (max-width: 600px) {
          .register-form-card { margin-top: 1.5rem !important; }
        }
        @media (min-width: 851px) {
          .register-left-col { display: flex !important; }
          .register-main { flex-direction: row !important; min-height: 0 !important; }
          .register-form-card { align-self: flex-start; margin-top: 3rem !important; }
        }
      `}</style>
    </div>
  );
}