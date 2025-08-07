"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState, useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUser, FaCog, FaSearch, FaBell } from "react-icons/fa";

export default function AdminDashboard() {
  const { user } = useAuthState();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      // Logout failed silently
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Topbar */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Input 
              placeholder="Search anything..." 
              className="pl-10 pr-4 h-11 bg-white/80 backdrop-blur-sm border-gray-200/60 focus:border-pink-300 focus:ring-pink-200"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:bg-gray-50">
              <FaBell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center p-0">
                3
              </Badge>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                    <AvatarImage src="/manager.webp" alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-pink-500 text-white font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2 border-b">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/manager.webp" alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-pink-500 text-white text-sm">
                      {user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem className="flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <FaCog className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="hidden lg:block">
              <span className="text-sm font-medium text-gray-700">Hello, {user?.name || "Admin"}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-lg">Welcome back! Here&apos;s what&apos;s happening with your travel business today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">75</div>
                  <div className="text-sm font-medium text-gray-600">Total Orders</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaSearch className="text-white h-6 w-6" />
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 bg-green-100 text-green-700 border-green-200">
                +5.1% from last month
              </Badge>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">357</div>
                  <div className="text-sm font-medium text-gray-600">Total Delivered</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaUser className="text-white h-6 w-6" />
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 bg-green-100 text-green-700 border-green-200">
                +3.2% from last month
              </Badge>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">65</div>
                  <div className="text-sm font-medium text-gray-600">Total Canceled</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <FaCog className="text-white h-6 w-6" />
                </div>
              </div>
              <Badge variant="destructive" className="mt-3">
                -1.2% from last month
              </Badge>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">$12,847</div>
                  <div className="text-sm font-medium text-gray-600">Total Revenue</div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaBell className="text-white h-6 w-6" />
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 bg-green-100 text-green-700 border-green-200">
                +12.5% from last month
              </Badge>
            </div>
          </Card>
        </div>

        {/* Customer Reviews */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Customer Reviews</h3>
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm border-gray-200/60">
              View All Reviews
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    <AvatarImage src="/manager.webp" alt="Jons Sena" />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold">J</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Jons Sena</h4>
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">2 days ago</div>
                                         <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                       &quot;Amazing travel experience! The team at Brothers Holidays made our vacation unforgettable. Highly recommended for anyone looking for professional travel services.&quot;
                     </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-sm text-gray-500 ml-1">(5.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    <AvatarImage src="/chairperson.webp" alt="Sofia" />
                    <AvatarFallback className="bg-purple-500 text-white font-semibold">S</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Sofia</h4>
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">2 days ago</div>
                                         <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                       &quot;Great service and attention to detail. The booking process was smooth and the customer support was excellent throughout our journey.&quot;
                     </div>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 text-sm">☆</span>
                      <span className="text-sm text-gray-500 ml-1">(4.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/60 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    <AvatarImage src="/director.webp" alt="Anandreansyah" />
                    <AvatarFallback className="bg-green-500 text-white font-semibold">A</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Anandreansyah</h4>
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">3 days ago</div>
                                         <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                       &quot;Professional service with competitive pricing. The team understood our requirements perfectly and delivered exactly what we needed.&quot;
                     </div>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                      <span className="text-gray-300 text-sm">☆</span>
                      <span className="text-sm text-gray-500 ml-1">(4.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}