export interface BlogDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  tags: string[];
  featuredImage?: string;
  featuredImageBucket?: string;
}

export interface BlogCardData {
  $id: string;
  slug: string;
  title: string;
  description: string;
  featuredImage?: string;
}

export interface BlogDetailData {
  title: string;
  featuredImage?: string;
  content: string;
  description?: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
