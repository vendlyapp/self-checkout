'use client'

interface DiscountStatsCardsProps {
  stats: {
    total: number
    active: number
    inactive: number
  }
}

export default function DiscountStatsCards({ stats }: DiscountStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Total Codes */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Total Codes:</p>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>

      {/* Active Codes */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Aktive Codes:</p>
        <p className="text-2xl font-bold text-[#25D076]">{stats.active}</p>
      </div>

      {/* Inactive Codes */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Inaktive Codes:</p>
        <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
      </div>
    </div>
  )
}

