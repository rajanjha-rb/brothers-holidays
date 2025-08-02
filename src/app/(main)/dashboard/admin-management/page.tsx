"use client";

import React, { useState, useEffect } from "react";
import { useAuthState } from "@/store/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaUser, FaUserShield, FaPlus, FaTrash } from "react-icons/fa";

interface User {
  $id: string;
  name: string;
  email: string;
  labels: string[];
}

export default function AdminManagement() {
  const { hydrated, loading, isAdmin, adminChecked } = useAuthState();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hydrated && !loading && adminChecked && isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, adminChecked, loading, hydrated]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Note: This would require a backend API endpoint to fetch users
      // For now, we'll show a placeholder
      setUsers([
        {
          $id: "1",
          name: "Admin User",
          email: "admin@example.com",
          labels: ["admin"]
        },
        {
          $id: "2", 
          name: "Regular User",
          email: "user@example.com",
          labels: []
        }
      ]);
    } catch {
      // Error fetching users silently
      setMessage("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const assignAdminRole = async (userId: string) => {
    try {
      setProcessing(true);
      setMessage("");
      
      // Note: This would require a backend API endpoint to update user labels
      // For now, we'll show a placeholder
      setUsers(prev => prev.map(u => 
        u.$id === userId 
          ? { ...u, labels: [...u.labels, "admin"] }
          : u
      ));
      
      setMessage("Admin role assigned successfully!");
    } catch {
      // Error assigning admin role silently
      setMessage("Error assigning admin role");
    } finally {
      setProcessing(false);
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      setProcessing(true);
      setMessage("");
      
      // Note: This would require a backend API endpoint to update user labels
      // For now, we'll show a placeholder
      setUsers(prev => prev.map(u => 
        u.$id === userId 
          ? { ...u, labels: u.labels.filter(label => label !== "admin") }
          : u
      ));
      
      setMessage("Admin role removed successfully!");
    } catch {
      // Error removing admin role silently
      setMessage("Error removing admin role");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !hydrated || !adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Brothers Holidays</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/allblogs" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Blogs
                </a>
              </li>
              <li>
                <a href="/dashboard/admin-management" className="block px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium">
                  Admin Management
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes("Error") 
                ? "bg-red-50 border border-red-200 text-red-700" 
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              {message}
            </div>
          )}

          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.$id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex gap-2 mt-1">
                          {user.labels.includes("admin") ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <FaUserShield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <FaUser className="w-3 h-3 mr-1" />
                              User
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.labels.includes("admin") ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAdminRole(user.$id)}
                          disabled={processing}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <FaTrash className="w-4 h-4 mr-1" />
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => assignAdminRole(user.$id)}
                          disabled={processing}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FaUserShield className="w-4 h-4 mr-1" />
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter user email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="flex-1"
              />
              <Button disabled={!newUserEmail || processing}>
                <FaPlus className="w-4 h-4 mr-1" />
                Add User
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Note: This feature requires backend implementation to work properly.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
} 