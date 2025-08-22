"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import slugify from "@/app/utils/slugify";
import { FaPlus, FaTimes, FaSpinner, FaMapMarkerAlt, FaTag } from "react-icons/fa";
import { useAuthState } from "@/store/auth";
import { toast } from "react-hot-toast";

interface ActivityFormData {
  name: string;
  description: string;
  tags: Set<string>;
}

export default function AddNewActivityPage() {
  const router = useRouter();
  const { user, hydrated, isAdmin } = useAuthState();
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    description: "",
    tags: new Set<string>(),
  });

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.has(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: new Set([...prev.tags, tagInput.trim()])
      }));
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: new Set([...prev.tags].filter(tag => tag !== tagToRemove))
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Activity name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/activities/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: slugify(formData.name),
          description: formData.description,
          tags: Array.from(formData.tags),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Activity created successfully!');
        router.push('/dashboard/allactivities');
      } else {
        setError(data.message || 'Failed to create activity');
        toast.error(data.message || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      setError('Failed to create activity');
      toast.error('Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!hydrated || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Activity</h1>
          <p className="text-gray-600">Create a new activity for your travel website</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-indigo-600" />
              Activity Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Activity Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter activity name"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter activity description"
                  rows={4}
                />
              </div>



              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag and press Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <FaPlus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.size > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.from(formData.tags).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        <FaTag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                      Creating Activity...
                    </>
                  ) : (
                    'Create Activity'
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/allactivities')}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
