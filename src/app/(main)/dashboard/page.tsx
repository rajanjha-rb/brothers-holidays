// brothers-holidays/src/app/(main)/dashboard/page.tsx

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
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
                  <Button variant="ghost" className="w-full justify-start">Blogs</Button>
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <Input placeholder="Search here" className="w-1/3" />
          <div className="flex items-center gap-4">
            <Badge variant="secondary">3</Badge>
            <DropdownMenu>
              <Avatar>
                <AvatarImage src="/manager.webp" alt="Manager" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              {/* Add dropdown items here */}
            </DropdownMenu>
            <span className="font-medium">Hello, Samantha</span>
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