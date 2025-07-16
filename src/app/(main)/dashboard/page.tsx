"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FaHome, FaRegCommentDots, FaRegNewspaper, FaTags, FaMapMarkerAlt, FaPlane, FaBoxOpen, FaEnvelopeOpenText, FaBook, FaEllipsisH, FaCalendarAlt, FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import ThemeToggle from "@/app/components/ThemeToggle";

const navItems = [
  { icon: <FaHome />, label: "Home" },
  { icon: <FaRegNewspaper />, label: "Blogs" },
  { icon: <FaRegCommentDots />, label: "Comments" },
  { icon: <FaTags />, label: "Tags" },
  { icon: <FaMapMarkerAlt />, label: "Destinations" },
  { icon: <FaPlane />, label: "Trips" },
  { icon: <FaBoxOpen />, label: "Packages" },
  { icon: <FaEnvelopeOpenText />, label: "Enquiries" },
  { icon: <FaBook />, label: "Bookings" },
];

export default function DashboardPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  if (!hydrated) return null;
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground border-r flex flex-col h-screen rounded-2xl m-2 shadow-sm">
        <div className="text-xl font-bold px-6 pt-6 pb-2">Brothers Holidays</div>
        <nav className="flex flex-col gap-1 px-2 mt-2">
          {navItems.map((item, idx) => (
            <Button
              key={item.label}
              variant={idx === 0 ? "default" : "ghost"}
              className="w-full justify-start gap-3 text-base font-medium py-2 px-3 rounded-lg"
              onClick={idx === 0 ? () => router.push("/") : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-6 bg-background text-foreground rounded-2xl m-2 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Input placeholder="Search for anything..." className="w-80" />
            <Button variant="ghost" size="icon"><FaCalendarAlt className="text-foreground" /></Button>
            <Button variant="ghost" size="icon"><FaBell className="text-red-600" /></Button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-lg font-semibold text-foreground dark:text-white">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-normal text-foreground">{user.name || user.email || "User"}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><FaEllipsisH className="text-foreground" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Board Title and Actions */}
        <div className="flex flex-1 flex-col items-center justify-center w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Welcome to Admin Pannel</h1>
        </div>
      </div>
    </div>
  );
} 