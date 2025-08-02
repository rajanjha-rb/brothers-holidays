"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthState, useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";

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
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white/95 backdrop-blur-sm border-r border-pink-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Brothers Holidays</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start">Home</Button>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/allblogs">
                  <Button variant="ghost" className="w-full justify-start">All Blogs</Button>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/addnewblog">
                  <Button variant="ghost" className="w-full justify-start">Add New Blog</Button>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin-management">
                  <Button variant="ghost" className="w-full justify-start">Admin Management</Button>
                </Link>
              </li>
              <li><Button variant="ghost" className="w-full justify-start">Destination</Button></li>
              <li><Button variant="ghost" className="w-full justify-start">Trips</Button></li>
              <li><Button variant="ghost" className="w-full justify-start">Setting</Button></li>
              <li><Button variant="ghost" className="w-full justify-start">Tags</Button></li>
              <li><Button variant="ghost" className="w-full justify-start">Bookings</Button></li>
              
              <li><Button variant="ghost" className="w-full justify-start">Ratings</Button></li>
              <li><Button variant="ghost" className="w-full justify-start">Media</Button></li>
            </ul>
          </nav>
          
          {/* Logout Section */}
          <div className="mt-auto pt-6 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-1/3">
            <Input placeholder="Search here" className="pr-10" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">3</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/manager.webp" alt={user?.name || "Admin"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
            <span className="font-medium">Hello, {user?.name || "Admin"}</span>
          </div>
        </div>

        {/* Dashboard Header */}
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <p className="mb-6">Hi, Samantha. Welcome back to Sedap Admin! {/* Escaped single quote */}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">75</div>
              <div className="text-sm text-gray-500">Total Orders</div>
              <Badge variant="secondary" className="mt-2">+5.1% new</Badge>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">357</div>
              <div className="text-sm text-gray-500">Total Delivered</div>
              <Badge variant="secondary" className="mt-2">+3.2% new</Badge>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">65</div>
              <div className="text-sm text-gray-500">Total Canceled</div>
              <Badge variant="destructive" className="mt-2">-1.2% new</Badge>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold">$128</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <Badge variant="secondary" className="mt-2">+2.5% new</Badge>
            </div>
          </Card>
        </div>

        {/* Customer Reviews */}
        <div>
          <h3 className="font-semibold mb-4">Customer Review</h3>
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <div className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/manager.webp" alt="Jons Sena" />
                  <AvatarFallback>J</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Jons Sena</div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                  <div className="text-sm mt-1">Lorem ipsum is simply dummy text of the printing and typesetting industry.</div>
                  <div className="mt-2 text-yellow-500">★★★★★</div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/chairperson.webp" alt="Sofia" />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Sofia</div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                  <div className="text-sm mt-1">Lorem ipsum has been the industry&apos;s standard dummy text.</div>
                  <div className="mt-2 text-yellow-500">★★★★☆</div>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="/director.webp" alt="Anandreansyah" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">Anandreansyah</div>
                  <div className="text-xs text-gray-500">2 days ago</div>
                  <div className="text-sm mt-1">Lorem ipsum has been the industry&apos;s standard dummy text ever since.</div>
                  <div className="mt-2 text-yellow-500">★★★★☆</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}