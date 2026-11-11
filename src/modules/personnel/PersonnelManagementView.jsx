import React, { useState, useEffect } from 'react'
import { Users, ShieldCheck, ChevronRight } from 'lucide-react'
import RoleManagementView from './RoleManagementView'
import StaffManagementView from './StaffManagementView'

export default function PersonnelManagementView({ defaultTab = 'staff', onRouteChange }) {
  // tab: 'staff' | 'roles'
  const [activeTab, setActiveTab] = useState(
    defaultTab === 'roles' || defaultTab === 'users-roles' ? 'roles' : 'staff'
  )

  useEffect(() => {
    if (defaultTab === 'roles' || defaultTab === 'users-roles') {
      setActiveTab('roles')
    } else if (defaultTab === 'staff' || defaultTab === 'users-all') {
      setActiveTab('staff')
    }
  }, [defaultTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (onRouteChange) {
      if (tab === 'roles') onRouteChange('users-roles')
      else onRouteChange('users-all')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Personnel Navigation / Sub-nav Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span>Personnel Management</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-white">
            {activeTab === 'staff' ? 'Staff (Manage Staff)' : 'Role & Permission'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabChange('staff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('roles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role & Permission</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'staff' ? (
        <StaffManagementView onNavigateToRoles={() => handleTabChange('roles')} />
      ) : (
        <RoleManagementView onNavigateToStaff={() => handleTabChange('staff')} />
      )}
    </div>
  )
}
