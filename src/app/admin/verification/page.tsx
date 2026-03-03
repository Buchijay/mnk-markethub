"use client"

import { useState, useEffect } from "react"
import VerificationQueue from "@/components/admin/VerificationQueue"
import { getVerificationQueue, approveVerificationItem, rejectVerificationItem, type VerificationItem } from "@/lib/services/admin/verification"
import { logger } from '@/lib/utils/logger'

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
        logger.error(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchQueue()
  }, [filter])

  // Approve handler
  const handleApprove = async (item: VerificationItem) => {
    try {
      setLoading(true)
      if (item.type === 'product') {
        setError('Products cannot be verified')
        return
      }
      await approveVerificationItem(item.id, item.type)
      setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'approved', reason: undefined } : i))
    } catch (err) {
      setError('Failed to approve item')
      logger.error(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Reject handler (prompt for reason)
  const handleReject = async (item: VerificationItem) => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    try {
      setLoading(true)
      if (item.type === 'product') {
        setError('Products cannot be verified')
        return
      }
      await rejectVerificationItem(item.id, item.type, reason)
      setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'flagged', reason } : i))
    } catch (err) {
      setError('Failed to reject item')
      logger.error(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

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

      <VerificationQueue
        items={queue}
        loading={loading}
        error={error}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}
