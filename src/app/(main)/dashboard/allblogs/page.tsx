"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { databases, storage } from "@/models/client/config";
import { db, blogCollection, featuredImageBucket } from "@/models/name";

interface Blog {
  $id: string;
  title: string;
  slug: string;
  featuredImage?: string;
}

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(db, blogCollection, []);
      // Map documents to Blog type
      const mappedBlogs: Blog[] = res.documents.map((doc: Record<string, unknown>) => ({
        $id: doc.$id as string,
        title: doc.title as string,
        slug: doc.slug as string,
        featuredImage: doc.featuredImage as string | undefined,
      }));
      setBlogs(mappedBlogs);
    } catch {
      setError("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Delete logic reused from addNewBlog.tsx
  const handleDelete = async (id: string, featuredImageId?: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      if (featuredImageId) {
        try {
          await storage.deleteFile(featuredImageBucket, featuredImageId);
        } catch {
          // Ignore image deletion errors
        }
      }
      await databases.deleteDocument(db, blogCollection, id);
      fetchBlogs();
    } catch {
      alert("Failed to delete blog");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Blogs</h1>
      <Card>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog.$id}>
                  <td className="px-6 py-4 whitespace-nowrap">{blog.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{blog.$id}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <Link href={`/blogs/${blog.$id}/${blog.slug}`}><Button size="sm">View</Button></Link>
                    <Link href={`/blogs/${blog.$id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.$id, blog.featuredImage)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
} 