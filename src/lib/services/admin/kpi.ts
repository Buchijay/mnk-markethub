// Mock KPI data service
// Replace with actual API calls to your backend

export const getAdminKPIs = async () => {
  try {
    // Generate mock data for demonstration
    const mockKPIs = {
      totalRevenue: 245000,
      revenueChange: 12.5,
      totalOrders: 1234,
      ordersChange: 8.2,
      activeVendors: 87,
      vendorsChange: 3.1,
      activeUsers: 5432,
      usersChange: 15.7,
      pendingApprovals: 23,
      flaggedItems: 5,
      platformHealth: 98,
      revenueTrend: [
        { name: "Week 1", value: 40000 },
        { name: "Week 2", value: 48000 },
        { name: "Week 3", value: 52000 },
        { name: "Week 4", value: 61000 },
        { name: "Week 5", value: 55000 },
        { name: "Week 6", value: 63000 },
        { name: "Week 7", value: 70000 },
      ],
      ordersTrend: [
        { name: "Mon", value: 120 },
        { name: "Tue", value: 140 },
        { name: "Wed", value: 135 },
        { name: "Thu", value: 160 },
        { name: "Fri", value: 175 },
        { name: "Sat", value: 210 },
        { name: "Sun", value: 160 },
      ],
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return mockKPIs
  } catch (error) {
    console.error("Error fetching KPIs:", error)
    throw error
  }
}
