"use client";
import React from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaUser, FaSuitcaseRolling, FaHeart, FaHistory, FaCog, FaSignOutAlt, FaHome } from "react-icons/fa";

const PALETTE = {
  blue: "#0057B7",
  red: "#D72631",
  gold: "#FFD166",
  white: "#F8F9FA",
  darkBlue: "#003D82",
};

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const dashboardItems = [
    {
      title: "My Bookings",
      description: "View and manage your travel bookings",
      icon: <FaSuitcaseRolling className="text-2xl" />,
      color: PALETTE.blue,
      href: "/dashboard/bookings"
    },
    {
      title: "Wishlist",
      description: "Your saved destinations and packages",
      icon: <FaHeart className="text-2xl" />,
      color: PALETTE.red,
      href: "/dashboard/wishlist"
    },
    {
      title: "Travel History",
      description: "Past trips and experiences",
      icon: <FaHistory className="text-2xl" />,
      color: PALETTE.gold,
      href: "/dashboard/history"
    },
    {
      title: "Settings",
      description: "Manage your account preferences",
      icon: <FaCog className="text-2xl" />,
      color: PALETTE.darkBlue,
      href: "/dashboard/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaHome className="text-xl text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <FaUser className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name || user.email}!
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your travel bookings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaSuitcaseRolling className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaHeart className="text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Trips</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FaHistory className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer p-6"
              onClick={() => router.push(item.href)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <div style={{ color: item.color }}>
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Booking confirmed for Nepal Trek</p>
                <p className="text-sm text-gray-600">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Added Pokhara to wishlist</p>
                <p className="text-sm text-gray-600">1 week ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Completed Everest Base Camp trek</p>
                <p className="text-sm text-gray-600">2 weeks ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 