interface ManageTabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

const ManageTabs = ({ tabs, activeTab, onTabChange }: ManageTabsProps) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 font-medium text-center transition border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ManageTabs
