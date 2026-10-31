import React from 'react'
import { Eye, Plus } from 'lucide-react'

// Pre-defined Tailwind class maps ensuring 100% static analysis compatibility
const COLOR_SCHEMES = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    showAllText: 'text-blue-600 hover:text-blue-700',
    btnBg: 'bg-blue-50/90 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200/60',
  },
  indigo: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    showAllText: 'text-indigo-600 hover:text-indigo-700',
    btnBg: 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 border border-indigo-200/60',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    showAllText: 'text-emerald-600 hover:text-emerald-700',
    btnBg: 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200/60',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    showAllText: 'text-amber-600 hover:text-amber-700',
    btnBg: 'bg-amber-50/90 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200/60',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    showAllText: 'text-rose-600 hover:text-rose-700',
    btnBg: 'bg-rose-50/90 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/60',
  },
  cyan: {
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    showAllText: 'text-cyan-600 hover:text-cyan-700',
    btnBg: 'bg-cyan-50/90 hover:bg-cyan-100 text-cyan-600 hover:text-cyan-700 border border-cyan-200/60',
  },
  purple: {
    iconBg: 'bg-[#f5eeff]',
    iconColor: 'text-purple-600',
    showAllText: 'text-purple-600 hover:text-purple-700',
    btnBg: 'bg-[#f5eeff] hover:bg-purple-100 text-purple-700 hover:text-purple-800 border border-purple-200/70',
  }
}

export const StatCard = ({ 
  title, 
  label,
  value, 
  icon: Icon, 
  badge, 
  change,
  badgePositive = true,
  color = 'blue',
  iconBg,
  iconColor,
  // Actions bottom bar matching reference design
  showActions = true,
  showAllText = 'Show all',
  onShowAll,
  onView,
  viewTooltip = 'View all details',
  onAdd,
  addTooltip = 'Quick add entry'
}) => {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.blue
  const resolvedIconBg = iconBg || scheme.iconBg
  const resolvedIconColor = iconColor || scheme.iconColor

  const cardTitle = title || label
  const cardBadge = badge || change

  const hasActionFooter = showActions !== false

  const handleShowAll = (e) => {
    if (onShowAll) onShowAll(e)
    else if (onView) onView(e)
  }

  const handleView = (e) => {
    if (onView) onView(e)
    else if (onShowAll) onShowAll(e)
  }

  const handleAdd = (e) => {
    if (onAdd) onAdd(e)
    else if (onView) onView(e)
    else if (onShowAll) onShowAll(e)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Title & Category Icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 tracking-wide">{cardTitle}</span>
          {Icon && (
            <div className={`w-9 h-9 rounded-xl ${resolvedIconBg} flex items-center justify-center ${resolvedIconColor} transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Metric Value & Optional Badge */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {cardBadge && (
            <span title={typeof cardBadge === 'string' ? cardBadge : undefined}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 max-w-full truncate ${
              badgePositive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}>
              {cardBadge}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer Bar: Show all link on left + Eye & Add circle buttons on right */}
      {hasActionFooter && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Show All Text Link */}
          <button
            type="button"
            onClick={handleShowAll}
            className={`text-xs font-semibold ${scheme.showAllText} hover:underline focus:outline-none transition-colors cursor-pointer select-none`}
          >
            {showAllText}
          </button>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Eye View Button */}
            <button
              type="button"
              onClick={handleView}
              title={viewTooltip}
              aria-label={viewTooltip}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${scheme.btnBg} flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-xs`}
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>

            {/* Plus Add Button */}
            <button
              type="button"
              onClick={handleAdd}
              title={addTooltip}
              aria-label={addTooltip}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${scheme.btnBg} flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-xs`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatCard
