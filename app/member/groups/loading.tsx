export default function SmallGroupsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-96">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Search and filters skeleton */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Groups grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 flex-1 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
