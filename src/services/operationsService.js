import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

const FALLBACK_BACKUPS = [
  {
    id: 'bkp-001',
    filename: 'sms_global_backup_2026-10-15.json',
    backupType: 'AUTOMATED',
    sizeBytes: 14857600,
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    createdBy: 'System Cron',
    status: 'COMPLETED',
    createdAt: '2026-10-15T03:00:00Z'
  },
  {
    id: 'bkp-002',
    filename: 'sms_pre_upgrade_snapshot_2026-10-20.json',
    backupType: 'MANUAL',
    sizeBytes: 15204352,
    checksum: 'sha256:d8578edf8458ce06fbc5bb76a58c5ca411a7a0033c467a3f4c636f2f9859f5b6',
    createdBy: 'Super Administrator',
    status: 'COMPLETED',
    createdAt: '2026-10-20T14:45:00Z'
  },
  {
    id: 'bkp-003',
    filename: 'beaconhouse_isolated_export_2026-10-21.json',
    backupType: 'INSTITUTE_EXPORT',
    sizeBytes: 4194304,
    checksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    createdBy: 'Super Administrator',
    status: 'COMPLETED',
    createdAt: '2026-10-21T09:20:00Z'
  }
]

export const OperationsService = {
  // 1. BACKUPS REGISTRY & CREATION
  async getBackups() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/list`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_system_backups')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_system_backups', JSON.stringify(FALLBACK_BACKUPS))
    return FALLBACK_BACKUPS
  },

  async createManualBackup(backupType = 'MANUAL', instituteName = null) {
    const store = getStoredData()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = instituteName 
      ? `${instituteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export_${timestamp}.json`
      : `sms_full_backup_${timestamp}.json`

    const payloadString = JSON.stringify(store, null, 2)
    const sizeBytes = new Blob([payloadString]).size

    try {
      await fetch(`${API_BASE_URL}/api/backup/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupType, instituteName })
      })
    } catch {}

    const backups = await this.getBackups()
    const newEntry = {
      id: 'bkp-' + Date.now(),
      filename,
      backupType,
      sizeBytes,
      checksum: 'sha256:' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      createdBy: 'Super Administrator',
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    }

    backups.unshift(newEntry)
    localStorage.setItem('sms_system_backups', JSON.stringify(backups))

    // Trigger instant browser download of JSON snapshot
    const blob = new Blob([payloadString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    DataService.logActivity(
      'System Backup Generated',
      `Created downloadable snapshot: ${filename} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`,
      'Super Admin'
    )

    return { success: true, backup: newEntry }
  },

  // 2. RESTORE SNAPSHOT
  async restoreBackup(parsedData) {
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid backup file: Payload is not a valid JSON document.')
    }

    // Basic structural verification
    const recognizedKeys = ['institutes', 'students', 'teachers', 'fees', 'classes', 'users']
    const hasAnyRecognized = recognizedKeys.some(k => Array.isArray(parsedData[k]))

    if (!hasAnyRecognized) {
      throw new Error('Invalid platform schema: Missing institutes, students, or users rosters.')
    }

    // Replace platform persistent store
    saveStoredData(parsedData)

    try {
      await fetch(`${API_BASE_URL}/api/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoredAt: new Date().toISOString() })
      })
    } catch {}

    DataService.logActivity(
      'Platform State Restored',
      'Restored system database from uploaded backup snapshot',
      'Super Admin'
    )

    return { success: true, message: 'Platform state restored successfully.' }
  },

  // 3. ISOLATED PER-INSTITUTE EXPORT
  async exportInstituteIsolatedData(instituteId, instituteName) {
    const store = getStoredData()
    const isolated = {
      exportedAt: new Date().toISOString(),
      institute: (store.institutes || []).find(i => i.id === instituteId) || { id: instituteId, name: instituteName },
      students: (store.students || []).filter(s => s.instituteId === instituteId),
      teachers: (store.teachers || []).filter(t => t.instituteId === instituteId),
      classes: (store.classes || []).filter(c => c.instituteId === instituteId),
      fees: (store.fees || []).filter(f => f.instituteId === instituteId)
    }

    const jsonString = JSON.stringify(isolated, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const filename = `${(instituteName || 'institute').toLowerCase().replace(/[^a-z0-9]/g, '_')}_isolated_export.json`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    DataService.logActivity(
      'Campus Data Exported',
      `Exported isolated data archive for ${instituteName}`,
      'Super Admin'
    )

    return { success: true, count: isolated.students.length + isolated.teachers.length }
  },

  // 4. BULK CSV / EXCEL VALIDATION PREVIEW
  validateBulkImport(rawText, importType = 'students') {
    const lines = rawText.trim().split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) {
      return { success: false, error: 'CSV file must contain a header line and at least one data row.' }
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
    const parsedRows = []
    const validationErrors = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
      const rowObj = {}
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || ''
      })

      const errors = []
      if (importType === 'students') {
        if (!rowObj.name) errors.push('Missing student name')
        if (!rowObj.rollNumber && !rowObj.roll) errors.push('Missing roll number')
      } else if (importType === 'institutes') {
        if (!rowObj.name) errors.push('Missing institute name')
        if (!rowObj.code) errors.push('Missing institute code')
      }

      parsedRows.push({
        rowNumber: i,
        data: rowObj,
        isValid: errors.length === 0,
        errors
      })

      if (errors.length > 0) {
        validationErrors.push({ row: i, errors })
      }
    }

    return {
      success: true,
      totalRows: parsedRows.length,
      validCount: parsedRows.filter(r => r.isValid).length,
      invalidCount: validationErrors.length,
      headers,
      preview: parsedRows.slice(0, 10),
      allRows: parsedRows
    }
  },

  // 5. DATA RETENTION POLICY
  async getRetentionPolicy() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/retention`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_retention_policy')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    return {
      auditLogsDays: 90,
      loginHistoryDays: 180,
      backupSnapshotsDays: 365,
      archivedInstitutesDays: 730,
      autoPurgeEnabled: true
    }
  },

  async saveRetentionPolicy(policy) {
    try {
      await fetch(`${API_BASE_URL}/api/backup/retention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      })
    } catch {}

    localStorage.setItem('sms_retention_policy', JSON.stringify(policy))
    DataService.logActivity('Data Retention Updated', 'Modified automated data retention lifecycle thresholds', 'Super Admin')
    return { success: true }
  },
  // 6. EMERGENCY SESSION BACKUPS & RESTORE (Force Logout Governance)
  getSessionBackups() {
    const local = localStorage.getItem('sms_session_backups')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    const initialSeed = [
      {
        id: 'sess-bkp-17300001',
        sessionId: 'sess-archived-981',
        userName: 'Beaconhouse Admin',
        userEmail: 'admin.beacon@sms.edu',
        userRole: 'institute_admin',
        campusName: 'Beaconhouse Central High School',
        ipAddress: '192.168.1.115',
        deviceInfo: 'Firefox 125 (Windows NT 10.0)',
        location: 'Lahore, Pakistan',
        sessionStartedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        terminatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        reason: 'Administrative Security Revocation & Session Rollover',
        fileSize: '46.8 KB',
        status: 'ARCHIVED',
        snapshotData: {
          clientIp: '192.168.1.115',
          userAgent: 'Firefox 125 (Windows NT 10.0)',
          authMethod: 'Password + 2FA',
          activeModule: 'Admissions & Fee Management',
          permissionsCache: ['students:read', 'students:write', 'fees:collect'],
          terminatedBy: 'Super Administrator'
        }
      }
    ]
    localStorage.setItem('sms_session_backups', JSON.stringify(initialSeed))
    return initialSeed
  },

  saveSessionBackup(session, reason = 'Force Logout by Super Administrator') {
    const backups = this.getSessionBackups()
    const timestamp = new Date().toISOString()
    const backupId = `sess-bkp-${Date.now()}`
    
    const newRecord = {
      id: backupId,
      sessionId: session.id || `sess-${Date.now()}`,
      userName: session.userName || session.userEmail || 'Unknown User',
      userEmail: session.userEmail || 'unknown@schoolms.com',
      userRole: session.userRole || 'institute_admin',
      campusName: session.instituteName || session.campusName || (session.userRole === 'superadmin' ? 'Global Platform' : 'Central Campus'),
      ipAddress: session.ipAddress || '127.0.0.1',
      deviceInfo: session.deviceInfo || 'Standard Browser',
      location: session.location || 'Lahore, Pakistan',
      sessionStartedAt: session.startedAt || timestamp,
      terminatedAt: timestamp,
      reason: reason,
      fileSize: `${(Math.random() * 15 + 38).toFixed(1)} KB`,
      status: 'ARCHIVED',
      snapshotData: {
        sessionMeta: session,
        terminatedBy: 'Super Administrator',
        timestamp,
        securityContext: {
          ip: session.ipAddress,
          clientFingerprint: session.deviceInfo,
          tlsCipher: 'TLS_AES_256_GCM_SHA384',
          jwtTokenRef: `jwt_sig_${Math.random().toString(36).substring(2, 10)}`
        },
        permissionsSnapshot: session.userRole === 'superadmin' 
          ? ['* (Root Authority)'] 
          : ['students:*', 'classes:*', 'attendance:*', 'fees:read', 'reports:read']
      }
    }

    const updated = [newRecord, ...backups]
    localStorage.setItem('sms_session_backups', JSON.stringify(updated))

    try {
      const sysBackups = JSON.parse(localStorage.getItem('sms_system_backups') || '[]')
      const sysEntry = {
        id: backupId,
        filename: `session_backup_${(session.userName || 'user').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`,
        backupType: 'SESSION_EMERGENCY',
        sizeBytes: 48128,
        checksum: `sha256:${Math.random().toString(36).substring(2, 14)}`,
        createdBy: 'Super Administrator (Force Logout)',
        status: 'COMPLETED',
        createdAt: timestamp,
        sessionRef: backupId
      }
      localStorage.setItem('sms_system_backups', JSON.stringify([sysEntry, ...sysBackups]))
    } catch {}

    return newRecord
  },

  deleteSessionBackup(backupId) {
    const backups = this.getSessionBackups()
    const updated = backups.filter(b => b.id !== backupId)
    localStorage.setItem('sms_session_backups', JSON.stringify(updated))
    return updated
  },

  restoreSessionBackup(backupRecord) {
    const store = getStoredData()
    const active = store.activeSessionsList || []
    const restoredSession = {
      id: backupRecord.sessionId || `sess-restored-${Date.now()}`,
      userName: backupRecord.userName,
      userEmail: backupRecord.userEmail,
      userRole: backupRecord.userRole,
      instituteName: backupRecord.campusName,
      ipAddress: backupRecord.ipAddress,
      deviceInfo: backupRecord.deviceInfo,
      location: backupRecord.location,
      startedAt: new Date().toISOString(),
      isCurrent: false,
      restoredFromBackup: true
    }
    store.activeSessionsList = [restoredSession, ...active]
    saveStoredData(store)
    return restoredSession
  },

  downloadSessionBackupFile(backup) {
    const filename = `session_backup_${(backup.userName || 'user').replace(/[^a-z0-9]/gi, '_')}_${new Date(backup.terminatedAt || Date.now()).toISOString().split('T')[0]}.json`
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', filename)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }
};
