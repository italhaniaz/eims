import React, { useState, useEffect } from 'react'
import { ShieldCheck, UserCheck, ChevronRight } from 'lucide-react'
import RoleManagementView from './RoleManagementView'
import AdminTeamControlView from '../platform/team/AdminTeamControlView'

export default function PersonnelManagementView({ defaultTab = 'roles', onRouteChange }) {
  // tab: 'roles' | 'team'
  const [activeTab, setActiveTab] = useState(
    defaultTab === 'team' || defaultTab === 'admin-team-control' ? 'team' : 'roles'
  )

  useEffect(() => {
    if (defaultTab === 'team' || defaultTab === 'admin-team-control') {
      setActiveTab('team')
    } else {
      setActiveTab('roles')
    }
  }, [defaultTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (onRouteChange) {
      if (tab === 'team') onRouteChange('admin-team-control')
      else onRouteChange('users-roles')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Personnel Navigation / Sub-nav Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span>Personnel Management</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-white">
            {activeTab === 'roles' ? 'Role & Permission' : 'Admin & Team Control'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabChange('roles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role &amp; Permission</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('team')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin &amp; Team Control</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'roles' ? (
        <RoleManagementView />
      ) : (
        <AdminTeamControlView onRouteChange={onRouteChange} />
      )}
    </div>
  )
}
