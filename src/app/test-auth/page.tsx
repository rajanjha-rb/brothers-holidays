"use client";

import React from "react";
import { useAuthState, forceAuthRefresh, forceAdminRefresh, debugAuthState, useAuthStore, clearAuthState } from "@/store/auth";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const { user, hydrated, loading, isAdmin, adminChecked, adminLoading } = useAuthState();
  const adminStatus = useAuthStore(state => state.adminStatus);

  const handleForceRefresh = () => {
    forceAuthRefresh();
  };

  const handleDebug = () => {
    debugAuthState();
  };

  const handleForceAdminRefresh = () => {
    forceAdminRefresh();
  };

  const handleClearAuth = () => {
    clearAuthState();
  };

  const handleDebugAPI = async () => {
    try {
      const response = await fetch('/api/debug-admin');
      const data = await response.json();
      console.log('🔍 Debug API Response:', data);
      alert(`Debug API Response:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('❌ Debug API Error:', error);
      alert('Error calling debug API');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Hydrated:</strong> {hydrated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? `${user.name} (${user.email})` : 'Not logged in'}
            </div>
            <div>
              <strong>Admin Checked:</strong> {adminChecked ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Admin Loading:</strong> {adminLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
            </div>
            {user && (
              <div>
                <strong>User Labels:</strong> {JSON.stringify(user.labels)}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <div className="space-x-4">
            <Button onClick={handleForceRefresh} className="bg-blue-600 hover:bg-blue-700">
              Force Auth Refresh
            </Button>
            <Button onClick={handleForceAdminRefresh} className="bg-purple-600 hover:bg-purple-700">
              Force Admin Refresh
            </Button>
            <Button onClick={handleDebug} className="bg-green-600 hover:bg-green-700">
              Debug Auth State
            </Button>
            <Button onClick={handleClearAuth} className="bg-red-600 hover:bg-red-700">
              Clear Auth State
            </Button>
            <Button onClick={handleDebugAPI} className="bg-orange-600 hover:bg-orange-700">
              Debug API
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
          
          <div className="space-y-2 text-sm">
            <div>✅ If you&apos;re logged in as admin, you should see &quot;Is Admin: Yes&quot;</div>
            <div>✅ The dashboard link should appear in the navbar</div>
            <div>✅ Admin controls should appear on blog pages</div>
            <div>❌ If you see &quot;Is Admin: No&quot; but you&apos;re logged in as admin, there&apos;s an issue</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          
          <div className="space-y-4">
            <div>
              <strong>User Labels (Raw):</strong> 
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {user ? JSON.stringify(user.labels, null, 2) : 'No user'}
              </pre>
            </div>
            <div>
              <strong>User Object (Partial):</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {user ? JSON.stringify({
                  id: user.$id,
                  email: user.email,
                  name: user.name,
                  labels: user.labels,
                  labelCount: user.labels?.length || 0
                }, null, 2) : 'No user'}
              </pre>
            </div>
            <div>
              <strong>Admin Status Details:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {JSON.stringify({
                  isAdmin: isAdmin,
                  checked: adminChecked,
                  loading: adminLoading,
                  lastChecked: adminStatus?.lastChecked || 'N/A'
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 