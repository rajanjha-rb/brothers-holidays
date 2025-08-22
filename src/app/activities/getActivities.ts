export async function getActivities() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/activities/list`, {
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.activities || [];
    } else {
      console.error('Failed to fetch activities:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}
