import { CheckCircle, XCircle, Clock } from "lucide-react"

interface VerificationItem {
  id: string
  type: "vendor" | "product" | "property" | "vehicle"
  title: string
  submittedBy: string
  submittedDate: string
  status: "pending" | "flagged" | "approved"
  reason?: string
}

interface VerificationQueueProps {
  items: VerificationItem[]
  loading: boolean
  error: string | null
}

const VerificationQueue = ({ items, loading, error }: VerificationQueueProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <p className="text-gray-600 font-medium">No items to verify</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const getTypeColor = (type: string) => {
          switch (type) {
            case "vendor":
              return "bg-blue-100 text-blue-800"
            case "product":
              return "bg-purple-100 text-purple-800"
            case "property":
              return "bg-yellow-100 text-yellow-800"
            case "vehicle":
              return "bg-green-100 text-green-800"
            default:
              return "bg-gray-100 text-gray-800"
          }
        }

        const getStatusIcon = (status: string) => {
          switch (status) {
            case "approved":
              return <CheckCircle size={20} className="text-green-500" />
            case "flagged":
              return <XCircle size={20} className="text-red-500" />
            case "pending":
              return <Clock size={20} className="text-yellow-500" />
            default:
              return null
          }
        }

        return (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                  <div>
                    <p className="font-medium text-gray-900">Submitted By</p>
                    <p>{item.submittedBy}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Submitted Date</p>
                    <p>{item.submittedDate}</p>
                  </div>
                </div>
                {item.reason && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Reason:</span> {item.reason}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="flex flex-col items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {item.status === "pending" && (
                    <>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
                        Reject
                      </button>
                    </>
                  )}
                  {(item.status === "flagged" || item.status === "approved") && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default VerificationQueue
