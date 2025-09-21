export default function PropertyDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Gallery Skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          
          {/* Address */}
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}