import { Suspense } from 'react';
import { getActivities } from './getActivities';
import ActivitiesClient from './ActivitiesClient';
import SearchBar from './SearchBar';

export const revalidate = 0;

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Activities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting activities and experiences that will make your journey unforgettable
          </p>
        </div>

        <SearchBar />

        <Suspense fallback={<ActivitiesLoading />}>
          <ActivitiesClient activities={activities} />
        </Suspense>
      </div>
    </div>
  );
}

function ActivitiesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
