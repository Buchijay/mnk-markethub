// Mock Verification Queue service
// Replace with actual API calls to your backend

export const getVerificationQueue = async (filter: string = "all") => {
  try {
    // Generate mock data for demonstration
    const mockQueue = [
      {
        id: "v1",
        type: "vendor" as const,
        title: "Premium Electronics Store",
        submittedBy: "seller@example.com",
        submittedDate: "2024-02-10",
        status: "pending" as const,
      },
      {
        id: "v2",
        type: "product" as const,
        title: "Wireless Headphones - High Quality",
        submittedBy: "Tech Store",
        submittedDate: "2024-02-09",
        status: "flagged" as const,
        reason: "Incomplete product description. Please add specifications.",
      },
      {
        id: "v3",
        type: "property" as const,
        title: "Luxury 4BR Penthouse",
        submittedBy: "realtor@example.com",
        submittedDate: "2024-02-08",
        status: "pending" as const,
      },
      {
        id: "v4",
        type: "vehicle" as const,
        title: "2023 BMW M340i",
        submittedBy: "Auto Sales Inc",
        submittedDate: "2024-02-07",
        status: "approved" as const,
      },
    ]

    // Filter based on status
    let filtered = mockQueue
    if (filter === "pending") {
      filtered = mockQueue.filter((item) => item.status === "pending")
    } else if (filter === "flagged") {
      filtered = mockQueue.filter((item) => item.status === "flagged")
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return filtered
  } catch (error) {
    console.error("Error fetching verification queue:", error)
    throw error
  }
}
