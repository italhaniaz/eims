import React, { createContext, useContext, useState, useEffect } from 'react'
import { DataService, getStoredData, computeRealStats } from '../services/dataService'
import { PROGRAM_LEVELS } from '../constants/academicLevels'

const AppDataContext = createContext(null)

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(() => getStoredData())
  const [loading, setLoading] = useState(false)
  const [activeProgramLevel, setActiveProgramLevel] = useState('all')

  const refreshData = () => {
    const fresh = getStoredData()
    setData({ ...fresh })
    return fresh
  }

  const addItem = async (collection, item) => {
    setLoading(true)
    const created = await DataService.addItem(collection, item)
    const fresh = getStoredData()
    setData(prev => ({
      ...fresh,
      [collection]: fresh[collection] || [created, ...(prev[collection] || [])]
    }))
    setLoading(false)
    return created
  }

  const updateItem = async (collection, id, updates) => {
    setLoading(true)
    const updated = await DataService.updateItem(collection, id, updates)
    const fresh = getStoredData()
    setData(prev => ({
      ...fresh,
      [collection]: fresh[collection] || (prev[collection] || []).map(i => i.id === id ? { ...i, ...updates } : i)
    }))
    setLoading(false)
    return updated
  }

  const deleteItem = async (collection, id) => {
    setLoading(true)
    const res = await DataService.deleteItem(collection, id)
    const fresh = getStoredData()
    setData(prev => ({
      ...fresh,
      [collection]: fresh[collection] || (prev[collection] || []).filter(i => i.id !== id)
    }))
    setLoading(false)
    return res
  }

  const resetToZero = () => {
    const fresh = DataService.resetToZero()
    setData({ ...fresh })
  }

  const loadSampleTemplate = () => {
    const sample = DataService.loadSampleTemplate()
    setData({ ...sample })
  }

  const importData = (jsonData) => {
    const updated = DataService.importData(jsonData)
    setData({ ...updated })
    return updated
  }

  const exportData = () => {
    return DataService.exportData()
  }

  const validateBackup = (backupObj) => {
    return DataService.validateBackup(backupObj)
  }

  const rollbackLastRestore = () => {
    const restored = DataService.rollbackLastRestore()
    if (restored) refreshData()
    return restored
  }

  // Attendance Persistence Handlers
  const saveAttendance = (date, classKey, records) => {
    const res = DataService.saveAttendance(date, classKey, records)
    refreshData()
    return res
  }

  const getAttendance = (date, classKey) => {
    return DataService.getAttendance(date, classKey)
  }

  // Timetable Persistence Handlers
  const saveTimetable = (classKey, schedule) => {
    const res = DataService.saveTimetable(classKey, schedule)
    refreshData()
    return res
  }

  const getTimetable = (classKey) => {
    return DataService.getTimetable(classKey)
  }

  // Security Audit Logging Hook
  const logAuditEvent = (action, user, status = 'Success', ip = null) => {
    const entry = DataService.logAuditEvent(action, user, status, ip)
    refreshData()
    return entry
  }

  // Quick Action: generate and download report
  const generateReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportData = [
      ['Educational Institute Management System - Executive Platform Audit Report'],
      ['Generated At:', new Date().toLocaleString()],
      [''],
      ['Global Platform Metrics'],
      ['Total Users', (data.users || []).length],
      ['Total Institutes / Campuses', (data.institutes || []).length],
      ['Total Students Enrolled', (data.students || []).length],
      ['Total Faculty & Staff', (data.teachers || []).length],
      ['Total Transport Vehicles', (data.transport || []).length],
      ['Total Library Books', (data.library || []).length],
      [''],
      ['Institutes Roster'],
      ['ID', 'Name', 'Code', 'Principal', 'City', 'Phone', 'Affiliated Board']
    ]

    ;(data.institutes || []).forEach(inst => {
      reportData.push([
        inst.id,
        inst.name,
        inst.code,
        inst.principal || '',
        inst.city || '',
        inst.phone || '',
        inst.affiliatedBoard || ''
      ])
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + reportData.map(e => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `SMS_Executive_Report_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addItem('recentActivity', {
      text: `Admin downloaded executive CSV report with ${(data.institutes || []).length} institutes`,
      time: 'Just now',
      type: 'report',
      dotColor: '#10b981'
    })
  }

  const sendCommunicationBlast = (blastData) => {
    const newLog = {
      id: `comm-${Date.now()}`,
      title: blastData.title,
      channel: blastData.channel,
      audience: blastData.audience,
      recipientsCount: blastData.recipientsCount || 120,
      timestamp: new Date().toLocaleString(),
      status: 'Delivered',
      messagePreview: blastData.message
    }

    const currentLogs = data.communicationLogs || []
    const updated = [newLog, ...currentLogs]
    
    DataService.addItem('communicationLogs', newLog)
    refreshData()
    return newLog
  }

  // Real dynamic calculated stats computed from live data entities
  const calculatedStats = computeRealStats(data)

  return (
    <AppDataContext.Provider
      value={{
        stats: calculatedStats,
        institutes: data.institutes || [],
        departments: data.departments || [],
        examinationBodies: data.examinationBodies || [],
        academicYears: data.academicYears || [],
        programTypes: data.programTypes || [],
        programs: data.programs || [],
        subjects: data.subjects || [],
        studySchemes: data.studySchemes || [],
        recentActivity: data.recentActivity || [],
        users: data.users || [],
        students: data.students || [],
        teachers: data.teachers || [],
        classes: data.classes || [],
        fees: data.fees || [],
        exams: data.exams || [],
        notices: data.notices || [],
        timetable: data.timetable || {},
        attendance: data.attendance || {},
        transport: data.transport || [],
        library: data.library || [],
        bookIssues: data.bookIssues || [],
        admissionsPipeline: data.admissionsPipeline || [],
        auditLogs: data.auditLogs || [],
        communicationLogs: data.communicationLogs || [],
        instituteCampuses: data.instituteCampuses || [],
        instituteModules: data.instituteModules || [],
        activeProgramLevel,
        setActiveProgramLevel,
        programLevels: PROGRAM_LEVELS,
        loading,
        refreshData,
        addItem,
        updateItem,
        deleteItem,
        resetToZero,
        loadSampleTemplate,
        importData,
        exportData,
        validateBackup,
        rollbackLastRestore,
        saveAttendance,
        getAttendance,
        saveTimetable,
        getTimetable,
        logAuditEvent,
        generateReport,
        sendCommunicationBlast
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider')
  }
  return context
}

export default AppDataContext
