"use client";

import React, { useState } from "react";
import { useAuthState, useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  FaUser, 
  FaLock, 
  FaSignOutAlt, 
  FaCamera, 
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

export default function SettingsPage() {
  const { user } = useAuthState();
  const { logout } = useAuthStore();
  const router = useRouter();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      // Logout failed silently
    }
  };

  const handleProfileSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile:", profileData);
    setIsEditingProfile(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    // TODO: Implement password change API call
    console.log("Changing password");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setIsChangingPassword(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    if (avatarFile) {
      // TODO: Implement avatar upload API call
      console.log("Uploading avatar:", avatarFile);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  {isEditingProfile ? <FaTimes className="h-4 w-4 mr-2" /> : <FaEdit className="h-4 w-4 mr-2" />}
                  {isEditingProfile ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditingProfile}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditingProfile}
                      className="mt-1"
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleProfileSave} className="bg-green-600 hover:bg-green-700">
                      <FaSave className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Password Change */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FaLock className="text-white h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? <FaTimes className="h-4 w-4 mr-2" /> : <FaEdit className="h-4 w-4 mr-2" />}
                  {isChangingPassword ? "Cancel" : "Change"}
                </Button>
              </div>

              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      >
                        {showPasswords.current ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      >
                        {showPasswords.new ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      >
                        {showPasswords.confirm ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handlePasswordChange} className="bg-orange-600 hover:bg-orange-700">
                      <FaSave className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Click &quot;Change&quot; to update your password</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar Upload */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FaCamera className="text-white h-4 w-4" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Picture</h2>
              </div>

              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                    <AvatarImage src={avatarPreview || "/manager.webp"} alt={user?.name || "Admin"} />
                    <AvatarFallback className="bg-pink-500 text-white text-2xl font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-pink-500 text-white rounded-full p-2 cursor-pointer hover:bg-pink-600 transition-colors">
                    <FaCamera className="h-3 w-3" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">JPG, PNG or GIF (max. 2MB)</p>
                  {avatarFile && (
                    <Button onClick={handleAvatarUpload} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <FaSave className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/60">
              <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge variant="secondary" className="mt-1">
                    Administrator
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">January 2024</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">Today</p>
                </div>
              </div>
            </Card>

            {/* Logout Section */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-red-200/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <FaSignOutAlt className="text-white h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Sign Out</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sign out of your account. You&apos;ll need to sign in again to access the dashboard.
              </p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <FaSignOutAlt className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 