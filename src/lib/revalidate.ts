// Utility function to trigger on-demand revalidation
export async function revalidateBlog(blogId: string, slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: `/blogs/${blogId}/${slug}`,
        secret: process.env.REVALIDATION_SECRET || 'your-secret-key',
      }),
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Revalidation successful:', result);
    return result;
  } catch (error) {
    console.error('Revalidation error:', error);
    throw error;
  }
}

// Revalidate blogs listing page
export async function revalidateBlogsList() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '/blogs',
        secret: process.env.REVALIDATION_SECRET || 'your-secret-key',
      }),
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Blogs list revalidation successful:', result);
    return result;
  } catch (error) {
    console.error('Blogs list revalidation error:', error);
    throw error;
  }
} 