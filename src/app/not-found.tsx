"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHome, FaArrowLeft, FaSearch, FaCompass, FaRocket } from "react-icons/fa";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function NotFound() {
  const router = useRouter();

  const quickLinks = [
    { name: "Home", href: "/", icon: <FaHome />, color: "from-blue-500 to-blue-600" },
    { name: "Blogs", href: "/blogs", icon: <FaSearch />, color: "from-pink-500 to-purple-600" },
    { name: "About", href: "/about", icon: <FaCompass />, color: "from-green-500 to-teal-600" },
    { name: "Contact", href: "/contact", icon: <FaRocket />, color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 overflow-hidden">
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main 404 Content */}
          <div className="mb-12">
            {/* Animated 404 Number */}
            <div className="relative mb-8">
              <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                404
              </h1>
              {/* Floating elements around 404 */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce"></div>
              <div className="absolute -top-2 -right-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -bottom-4 left-1/4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Message */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fadeInUp">
              Oops! Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Looks like you&apos;ve wandered off the beaten path! Don&apos;t worry, even the best travelers get lost sometimes. 
              Let&apos;s get you back on track to discover amazing destinations.
            </p>

            {/* Animated Illustration */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full animate-pulse opacity-20"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-purple-200 to-cyan-200 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-8 bg-gradient-to-r from-blue-200 to-pink-200 rounded-full animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🧭</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
            
            <Link
              href="/"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FaHome className="group-hover:scale-110 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-gray-200`}
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {link.icon}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Fun Facts Section */}
          <div className="mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg animate-fadeInUp" style={{ animationDelay: '1s' }}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Did You Know? 🌍</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="text-center">
                <div className="text-2xl mb-2">🏔️</div>
                <p>Nepal has 8 of the world&apos;s 10 highest mountains!</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🕉️</div>
                <p>Nepal is the birthplace of Lord Buddha</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎭</div>
                <p>Over 100 ethnic groups call Nepal home</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
} 