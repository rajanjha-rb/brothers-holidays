"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FaCalendar, FaTags, FaArrowRight, FaSearch, FaNewspaper } from "react-icons/fa";
import SearchBar from "./SearchBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./blogs.css";

interface Blog {
  $id: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface BlogsClientProps {
  initialBlogs: Blog[];
}

export default function BlogsClient({ initialBlogs }: BlogsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  // Filter blogs to ensure they are valid blog entries (not trips)
    const validBlogs = initialBlogs.filter(blog => {
    // Prefer explicit type when present
    const type = (blog as unknown as Record<string, unknown>).type as string | undefined;
    if (type && type !== 'blog') return false;

    // Minimum required fields
    const hasRequiredBlogFields = !!(blog.title && blog.slug);

    // Exclude obvious trips by trip-only fields
    const hasTripCharacteristics = (blog as unknown as Record<string, unknown>).name || (blog as unknown as Record<string, unknown>).difficulty;

    const isValidBlog = hasRequiredBlogFields && !hasTripCharacteristics;

    if (!isValidBlog) {
      console.log(`Client: Filtering out blog ${blog.$id}:`, {
        type,
        hasRequiredBlogFields,
        hasTripCharacteristics,
        title: blog.title,
        name: (blog as unknown as Record<string, unknown>).name,
      });
    }

    return isValidBlog;
  });
  
  // Debug logging
  console.log('BlogsClient received initialBlogs:', initialBlogs);
  console.log('Number of blogs:', initialBlogs.length);
  console.log('Valid blogs after filtering:', validBlogs.length);
  console.log('Blogs data:', validBlogs);
  


  // Preload critical resources on component mount
  useEffect(() => {
    // Preload the blog detail page component
    const preloadBlogDetail = () => {
      // Prefetch the blog detail page route
      const links = validBlogs.map(blog => 
        `/blogs/${blog.$id}/${blog.slug}`
      );
      
      // Prefetch first few blog pages with higher priority
      links.slice(0, 5).forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = link;
        linkElement.as = 'document';
        document.head.appendChild(linkElement);
      });
    };

    // Preload images for better perceived performance
    const preloadImages = () => {
      validBlogs.slice(0, 8).forEach(blog => {
        if (blog.featuredImage) {
          const img = new window.Image();
          img.src = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${blog.featuredImageBucket}/files/${blog.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${blog.$updatedAt}`;
        }
      });
    };

    // Execute preloading immediately for better performance
    preloadBlogDetail();
    preloadImages();
  }, [validBlogs]);

  // Filter blogs based on search query
  const filteredResults = useMemo(() => {
    let results = validBlogs;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = validBlogs.filter(blog => {
        // Search in title, description, tags, or content
        if (blog.title.toLowerCase().includes(query)) {
          return true;
        }
        if (blog.description.toLowerCase().includes(query)) {
          return true;
        }
        if (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(query))) {
          return true;
        }
        if (blog.content.toLowerCase().substring(0, 200).includes(query)) {
          return true;
        }
        return false;
      });
    }
    
    // Always sort by creation date (newest first) to ensure consistent ordering
    return results.sort((a, b) => 
      new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );
  }, [validBlogs, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Optimized link component with prefetching and router navigation
  const BlogLink = ({ blog, children }: { blog: Blog; children: React.ReactNode }) => {
    const handleMouseEnter = () => {
      // Prefetch on hover for better performance
      const link = `/blogs/${blog.$id}/${blog.slug}`;
      const linkElement = document.createElement('link');
      linkElement.rel = 'prefetch';
      linkElement.href = link;
      linkElement.as = 'document';
      document.head.appendChild(linkElement);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Use router.push for faster navigation with scroll restoration
      router.push(`/blogs/${blog.$id}/${blog.slug}`, { scroll: true });
    };

    return (
      <Link 
        href={`/blogs/${blog.$id}/${blog.slug}`}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        prefetch={true}
        className="block"
        scroll={true}
      >
        {children}
      </Link>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100" style={{ transform: 'translateZ(0)' }}>
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Decorative Elements - Reduced for better performance */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-15 float"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-15 float" style={{ animationDelay: '4s' }}></div>
        
        <div className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Enhanced Title */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">
                Discover Our Blog
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore insightful articles, travel stories, and expert tips from our team of passionate writers
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mb-12 search-container" style={{ position: 'relative', zIndex: 9999 }}>
              <SearchBar 
                onSearch={handleSearch} 
                onClear={handleClearSearch} 
                currentQuery={searchQuery} 
              />
            </div>

            {/* Enhanced Stats - Hidden when searching */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto stats-container ${searchQuery ? 'hidden' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg mb-3 mx-auto">
                    <FaNewspaper className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{validBlogs.length}</h3>
                  <p className="text-gray-600 text-sm">Total Articles</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-3 mx-auto">
                    <FaTags className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {new Set(validBlogs.flatMap(blog => blog.tags || [])).size}
                  </h3>
                  <p className="text-gray-600 text-sm">Unique Tags</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 stats-card">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg mb-3 mx-auto">
                    <FaCalendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {new Date().getFullYear()}
                  </h3>
                  <p className="text-gray-600 text-sm">Latest Updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Enhanced Search Results Info */}
      {searchQuery && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FaSearch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    Found {filteredResults.length} blog{filteredResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-pink-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Blogs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-br from-pink-50 via-white to-blue-50">
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No blogs match your search for "${searchQuery}"`
                : "No blogs available at the moment"
              }
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="bg-gradient-to-r from-pink-400 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                View All Blogs
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResults.map((blog, _index) => (
              <div
                key={blog.$id}
                className="group"
              >
                <Card className="h-full bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl overflow-hidden group-hover:border-pink-200 blog-card flex flex-col">
                  {/* Enhanced Featured Image */}
                  {blog.featuredImage && (
                    <div className="relative h-40 overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                      <OptimizedImage
                        src={`${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${blog.featuredImageBucket}/files/${blog.featuredImage}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&v=${blog.$updatedAt}`}
                        alt={blog.title}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                      {/* Enhanced Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"></div>
                    </div>
                  )}

                  <CardContent className="p-4 flex-1 flex flex-col">
                    {/* Enhanced Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="bg-gradient-to-r from-pink-100 to-blue-100 text-pink-700 border border-pink-200 hover:from-pink-200 hover:to-blue-200 transition-all duration-200 text-xs font-medium px-1 py-0.5 tag-badge"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-600 text-xs font-medium px-1 py-0.5"
                          >
                            +{blog.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Enhanced Title */}
                    <BlogLink blog={blog}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
                        {blog.title}
                      </h3>
                    </BlogLink>

                    {/* Enhanced Description */}
                    <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed text-sm">
                      {blog.description}
                    </p>

                    {/* Enhanced Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="w-3 h-3 text-pink-500" />
                        <span>
                          {new Date(blog.$createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaTags className="w-3 h-3 text-blue-500" />
                        <span>{blog.tags?.length || 0} tags</span>
                      </div>
                    </div>

                    {/* Enhanced Read More Button - Always at bottom */}
                    <div className="mt-auto">
                      <BlogLink blog={blog}>
                        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-pink-50 to-blue-50 rounded-lg group-hover:from-pink-100 group-hover:to-blue-100 transition-all duration-200">
                          <span className="font-semibold text-pink-700 group-hover:text-blue-700 transition-colors duration-200 text-sm">
                            Read Article
                          </span>
                          <FaArrowRight className="w-3 h-3 text-pink-600 group-hover:text-blue-600 transition-all duration-200 group-hover:translate-x-1" />
                        </div>
                      </BlogLink>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
} 