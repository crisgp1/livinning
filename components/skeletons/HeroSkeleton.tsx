export default function HeroSkeleton() {
  return (
    <div className="h-screen bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 bg-gray-200 rounded w-96 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded w-80 mx-auto"></div>
        <div className="h-12 bg-gray-200 rounded w-40 mx-auto"></div>
      </div>
    </div>
  )
}