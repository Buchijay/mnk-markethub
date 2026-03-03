export default function VendorLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-amber-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading vendor portal...</p>
      </div>
    </div>
  )
}
