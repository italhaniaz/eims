import React from 'react'

/**
 * Modern Executive Skeleton Fallback for Module Transitions
 * Matches the layout of Institute & Superadmin views to prevent layout jumps.
 */
export const ModuleSkeletonLoader = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Micro Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500/20 overflow-hidden z-50">
        <div className="h-full bg-emerald-600 w-1/3 animate-[shimmer_1.5s_infinite] rounded-full"></div>
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-slate-200 rounded-md"></div>
          <div className="h-7 w-56 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
          <div className="h-9 w-32 bg-emerald-200 rounded-xl"></div>
        </div>
      </div>

      {/* KPI Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="h-7 w-24 bg-slate-300 rounded-md"></div>
            <div className="h-2.5 w-20 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content / Table Area Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="h-10 w-72 bg-slate-100 rounded-xl"></div>
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-slate-100 rounded-xl"></div>
            <div className="h-10 w-28 bg-slate-100 rounded-xl"></div>
          </div>
        </div>

        {/* Rows */}
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map(row => (
            <div key={row} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-slate-200 rounded"></div>
                  <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-3 w-20 bg-slate-100 rounded"></div>
              <div className="h-3 w-16 bg-slate-100 rounded"></div>
              <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModuleSkeletonLoader
