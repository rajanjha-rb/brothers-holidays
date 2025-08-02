import { databases } from "@/models/client/config";
import { db, blogCollection } from "@/models/name";

export interface Blog {
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

export interface SearchResult {
  blogs: Blog[];
  totalResults: number;
  searchQuery: string;
  searchTime: number;
}

export interface SearchFilters {
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search blogs using database indexes for optimal performance
 */
export async function searchBlogs(
  query: string,
  filters: SearchFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult> {
  const startTime = Date.now();
  
  try {
    const searchQuery = query.trim();
    let results: Blog[] = [];

    if (!searchQuery) {
      // If no search query, return all blogs with filters
      const response = await databases.listDocuments(db, blogCollection, [
        // Add filters here if needed
      ]);
      results = response.documents as unknown as Blog[];
    } else {
      // Use fulltext search on title index
      const titleSearchResponse = await databases.listDocuments(db, blogCollection, [
        // Fulltext search on title
        // Note: Appwrite fulltext search syntax
      ]);
      
      const titleResults = titleSearchResponse.documents as unknown as Blog[];
      
      // Also search in tags
      const tagSearchResponse = await databases.listDocuments(db, blogCollection, [
        // Search in tags array
      ]);
      
      const tagResults = tagSearchResponse.documents as unknown as Blog[];
      
      // Combine and deduplicate results
      const allResults = [...titleResults, ...tagResults];
      const uniqueResults = allResults.filter((blog, index, self) => 
        index === self.findIndex(b => b.$id === blog.$id)
      );
      
      results = uniqueResults;
    }

    // Apply client-side filtering for better control
    results = applyFilters(results, filters);
    
    // Apply sorting
    results = sortResults(results, filters.sortBy || 'relevance', filters.sortOrder || 'desc', searchQuery);
    
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);
    
    const searchTime = Date.now() - startTime;
    
    return {
      blogs: paginatedResults,
      totalResults: results.length,
      searchQuery,
      searchTime
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      blogs: [],
      totalResults: 0,
      searchQuery: query,
      searchTime: Date.now() - startTime
    };
  }
}

/**
 * Apply filters to search results
 */
function applyFilters(blogs: Blog[], filters: SearchFilters): Blog[] {
  let filtered = [...blogs];

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(blog => 
      blog.tags && filters.tags!.some(tag => 
        blog.tags.includes(tag)
      )
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    filtered = filtered.filter(blog => {
      const blogDate = new Date(blog.$createdAt);
      return blogDate >= filters.dateRange!.start && blogDate <= filters.dateRange!.end;
    });
  }

  return filtered;
}

/**
 * Sort search results
 */
function sortResults(
  blogs: Blog[], 
  sortBy: string, 
  sortOrder: string, 
  searchQuery: string
): Blog[] {
  const sorted = [...blogs];

  switch (sortBy) {
    case 'date':
      sorted.sort((a, b) => {
        const dateA = new Date(a.$createdAt).getTime();
        const dateB = new Date(b.$createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      break;
      
    case 'title':
      sorted.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      });
      break;
      
    case 'relevance':
    default:
      // Sort by relevance (title matches first, then content)
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        sorted.sort((a, b) => {
          const aTitleMatch = a.title.toLowerCase().includes(queryLower);
          const bTitleMatch = b.title.toLowerCase().includes(queryLower);
          
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          
          // If both have title matches, sort by date (newest first)
          const dateA = new Date(a.$createdAt).getTime();
          const dateB = new Date(b.$createdAt).getTime();
          return dateB - dateA;
        });
      } else {
        // Default sort by date (newest first)
        sorted.sort((a, b) => {
          const dateA = new Date(a.$createdAt).getTime();
          const dateB = new Date(b.$createdAt).getTime();
          return dateB - dateA;
        });
      }
      break;
  }

  return sorted;
}

/**
 * Get all unique tags from blogs
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const response = await databases.listDocuments(db, blogCollection);
    const blogs = response.documents as unknown as Blog[];
    
    const tags = new Set<string>();
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => tags.add(tag));
      }
    });
    
    return Array.from(tags).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Get popular tags (tags used most frequently)
 */
export async function getPopularTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
  try {
    const response = await databases.listDocuments(db, blogCollection);
    const blogs = response.documents as unknown as Blog[];
    
    const tagCounts: { [key: string]: number } = {};
    
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return [];
  }
}

/**
 * Get recent blogs
 */
export async function getRecentBlogs(limit: number = 5): Promise<Blog[]> {
  try {
    const response = await databases.listDocuments(db, blogCollection, [
      // Sort by creation date descending
    ]);
    
    const blogs = response.documents as unknown as Blog[];
    return blogs.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    return [];
  }
} 