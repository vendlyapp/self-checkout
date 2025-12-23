'use client'

interface DiscountStatsCardsProps {
  stats: {
    total: number
    active: number
    inactive: number
    archived?: number
  }
  activeFilter: 'all' | 'active' | 'inactive'
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void
}

export default function DiscountStatsCards({ stats, activeFilter, onFilterChange }: DiscountStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Codes */}
      <button
        onClick={() => onFilterChange('all')}
        className={`bg-gray-50 rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
          activeFilter === 'all'
            ? 'border-[#25D076] bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <p className="text-sm text-gray-600 mb-2">Total Codes:</p>
        <p className={`text-2xl font-bold ${
          activeFilter === 'all' ? 'text-[#25D076]' : 'text-gray-900'
        }`}>
          {stats.total}
        </p>
      </button>

      {/* Active Codes */}
      <button
        onClick={() => onFilterChange('active')}
        className={`bg-gray-50 rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
          activeFilter === 'active'
            ? 'border-[#25D076] bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <p className="text-sm text-gray-600 mb-2">Aktive Codes:</p>
        <p className={`text-2xl font-bold ${
          activeFilter === 'active' ? 'text-[#25D076]' : 'text-[#25D076]'
        }`}>
          {stats.active}
        </p>
      </button>

      {/* Inactive Codes */}
      <button
        onClick={() => onFilterChange('inactive')}
        className={`bg-gray-50 rounded-xl p-4 border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
          activeFilter === 'inactive'
            ? 'border-gray-400 bg-gray-100 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <p className="text-sm text-gray-600 mb-2">Inaktive Codes:</p>
        <p className={`text-2xl font-bold ${
          activeFilter === 'inactive' ? 'text-gray-700' : 'text-gray-900'
        }`}>
          {stats.inactive}
        </p>
      </button>
    </div>
  )
}

