"use client"

import { useState, useEffect } from "react"
import VerificationQueue from "@/components/admin/VerificationQueue"
import { getVerificationQueue } from "@/lib/services/admin/verification"

interface VerificationItem {
  id: string
  type: "vendor" | "product" | "property" | "vehicle"
  title: string
  submittedBy: string
  submittedDate: string
  status: "pending" | "flagged" | "approved"
  reason?: string
}

export default function VerificationPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await getVerificationQueue(filter)
        setQueue(data)
      } catch (err) {
        setError("Failed to fetch verification queue")
        console.error(err as unknown)
      } finally {
        setLoading(false)
      }
    }

    fetchQueue()
  }, [filter])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Verification Queue</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          All ({queue.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("flagged")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "flagged"
              ? "bg-red-500 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Flagged
        </button>
      </div>

      <VerificationQueue items={queue} loading={loading} error={error} />
    </div>
  )
}
