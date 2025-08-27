"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FaHome, 
  FaBlog, 
  FaPlus, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaRoute, 
  FaCog, 
  FaTags, 
  FaCalendarCheck, 
  FaStar, 
  FaImages,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaGlobe,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: FaHome,
    color: "text-blue-600",
    bgColor: "hover:bg-blue-50"
  },
  {
    label: "All Blogs",
    href: "/dashboard/allblogs",
    icon: FaBlog,
    color: "text-green-600",
    bgColor: "hover:bg-green-50"
  },
  {
    label: "Add New Blog",
    href: "/dashboard/addnewblog",
    icon: FaPlus,
    color: "text-purple-600",
    bgColor: "hover:bg-purple-50"
  },
  {
    label: "All Trips",
    href: "/dashboard/alltrips",
    icon: FaRoute,
    color: "text-teal-600",
    bgColor: "hover:bg-teal-50"
  },
  {
    label: "Add New Trip",
    href: "/dashboard/addnewtrip",
    icon: FaMapMarkerAlt,
    color: "text-cyan-600",
    bgColor: "hover:bg-cyan-50"
  },
  {
    label: "All Destinations",
    href: "/dashboard/alldestinations",
    icon: FaGlobe,
    color: "text-indigo-600",
    bgColor: "hover:bg-indigo-50"
  },
  {
    label: "Add New Destination",
    href: "/dashboard/addnewdestination",
    icon: FaMapMarkerAlt,
    color: "text-violet-600",
    bgColor: "hover:bg-violet-50"
  },
  {
    label: "All Activities",
    href: "/dashboard/allactivities",
    icon: FaRoute,
    color: "text-emerald-600",
    bgColor: "hover:bg-emerald-50"
  },
  {
    label: "Add New Activity",
    href: "/dashboard/addnewactivity",
    icon: FaMapMarkerAlt,
    color: "text-amber-600",
    bgColor: "hover:bg-amber-50"
  },
  {
    label: "All Packages",
    href: "/dashboard/allpackages",
    icon: FaRoute,
    color: "text-rose-600",
    bgColor: "hover:bg-rose-50"
  },
  {
    label: "Add New Package",
    href: "/dashboard/addnewpackage",
    icon: FaMapMarkerAlt,
    color: "text-fuchsia-600",
    bgColor: "hover:bg-fuchsia-50"
  },
  {
    label: "Admin Management",
    href: "/dashboard/admin-management",
    icon: FaUsers,
    color: "text-orange-600",
    bgColor: "hover:bg-orange-50"
  },
  {
    label: "Media",
    href: "/dashboard/media",
    icon: FaImages,
    color: "text-pink-600",
    bgColor: "hover:bg-pink-50"
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: FaCalendarCheck,
    color: "text-green-600",
    bgColor: "hover:bg-green-50"
  },
  {
    label: "Invoice Maker",
    href: "/dashboard/invoices",
    icon: FaFileInvoiceDollar,
    color: "text-blue-600",
    bgColor: "hover:bg-blue-50"
  }
];

const settingsItem = {
  label: "Settings",
  href: "/dashboard/settings",
  icon: FaCog,
  color: "text-slate-600",
  bgColor: "hover:bg-slate-50"
};

const comingSoonItems = [
  {
    label: "Tags",
    href: "/dashboard/tags",
    icon: FaTags,
    disabled: true
  },
  {
    label: "Ratings",
    href: "/dashboard/ratings",
    icon: FaStar,
    disabled: true
  }
];

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur-sm border shadow-md"
        onClick={onToggle}
      >
        {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200/60 shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              BH
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Brothers Holidays</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>



        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Main Navigation Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Main Navigation
                </p>
              </div>
              <div className="space-y-1">
                                 {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-11 px-3 text-left group relative overflow-hidden transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg transform scale-[1.02]"
                            : `hover:bg-gray-50 text-gray-700 hover:text-gray-900 ${item.bgColor}`
                        )}
                      >
                        <Icon 
                          className={cn(
                            "h-4 w-4 mr-3 transition-all duration-200 group-hover:scale-110", 
                            isActive ? "text-white" : item.color
                          )} 
                        />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <FaChevronRight className="h-3 w-3 text-white ml-auto" />
                        )}
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Settings Item */}
                {(() => {
                  const Icon = settingsItem.icon;
                  const isActive = pathname === settingsItem.href;
                  
                  return (
                    <Link key={settingsItem.href} href={settingsItem.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-11 px-3 text-left group relative overflow-hidden transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg transform scale-[1.02]"
                            : `hover:bg-gray-50 text-gray-700 hover:text-gray-900 ${settingsItem.bgColor}`
                        )}
                      >
                        <Icon 
                          className={cn(
                            "h-4 w-4 mr-3 transition-all duration-200 group-hover:scale-110", 
                            isActive ? "text-white" : settingsItem.color
                          )} 
                        />
                        <span className="font-medium">{settingsItem.label}</span>
                        {isActive && (
                          <FaChevronRight className="h-3 w-3 text-white ml-auto" />
                        )}
                      </Button>
                    </Link>
                  );
                })()}
              </div>
            </div>

            {/* Coming Soon Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 mb-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coming Soon
                </p>
                 <Badge variant="outline" className="ml-auto text-xs">
                   2 Features
                 </Badge>
              </div>
              <div className="space-y-1">
                {comingSoonItems.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      disabled={item.disabled}
                      className="w-full justify-start h-11 px-3 text-left cursor-not-allowed opacity-60 hover:opacity-70 transition-opacity"
                    >
                      <Icon className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-medium text-gray-500">{item.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs bg-gray-100 text-gray-500">
                        Soon
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>


      </aside>
    </>
  );
} 