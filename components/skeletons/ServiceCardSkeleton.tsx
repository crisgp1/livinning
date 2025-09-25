export default function ServiceCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
      </div>
    </div>
  )
}