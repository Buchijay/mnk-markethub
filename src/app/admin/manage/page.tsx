"use client"

import { useState } from "react"
import ManageTabs from "@/components/admin/ManageTabs"
import VendorsTab from "@/components/admin/tabs/VendorsTab"
import ProductsTab from "@/components/admin/tabs/ProductsTab"
import PropertiesTab from "@/components/admin/tabs/PropertiesTab"
import VehiclesTab from "@/components/admin/tabs/VehiclesTab"
import UsersTab from "@/components/admin/tabs/UsersTab"
import OrdersTab from "@/components/admin/tabs/OrdersTab"

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState("vendors")

  const tabs = [
    { id: "vendors", label: "Vendors" },
    { id: "products", label: "Products" },
    { id: "properties", label: "Properties" },
    { id: "vehicles", label: "Vehicles" },
    { id: "users", label: "Users" },
    { id: "orders", label: "Orders" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "vendors":
        return <VendorsTab />
      case "products":
        return <ProductsTab />
      case "properties":
        return <PropertiesTab />
      case "vehicles":
        return <VehiclesTab />
      case "users":
        return <UsersTab />
      case "orders":
        return <OrdersTab />
      default:
        return null
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage</h1>

      <ManageTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  )
}
