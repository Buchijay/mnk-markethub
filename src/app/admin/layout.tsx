import { ReactNode } from "react"
import AdminNav from "@/components/admin/AdminNav"

export const metadata = {
  title: "Admin Dashboard - MK Solution",
  description: "Admin panel for managing the marketplace",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
