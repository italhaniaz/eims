import React from 'react'
import { ChevronRight } from 'lucide-react'
import RoleManagementView from './RoleManagementView'

export default function PersonnelManagementView({ onRouteChange }) {
  return (
    <div className="space-y-6">
      {/* Top Personnel Navigation / Sub-nav Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span>Personnel Management</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-white">
            Role & Permission
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      <RoleManagementView />
    </div>
  )
}
