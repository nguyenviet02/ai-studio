export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="mt-6">
      <nav className="flex gap-1 p-1 rounded-2xl bg-surface-elevated border border-border inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-300 ease-out cursor-pointer
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
