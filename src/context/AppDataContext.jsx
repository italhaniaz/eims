import React, { createContext, useContext, useState, useEffect } from 'react'
import { DataService, getStoredData } from '../services/dataService'
import { PROGRAM_LEVELS } from '../constants/academicLevels'

const AppDataContext = createContext(null)

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(() => getStoredData())
  const [loading, setLoading] = useState(false)
  const [activeProgramLevel, setActiveProgramLevel] = useState('all')

  const refreshData = () => {
    setData({ ...getStoredData() })
  }

  const addItem = async (collection, item) => {
    setLoading(true)
    const created = await DataService.addItem(collection, item)
    refreshData()
    setLoading(false)
    return created
  }

  const updateItem = async (collection, id, updates) => {
    setLoading(true)
    const updated = await DataService.updateItem(collection, id, updates)
    refreshData()
    setLoading(false)
    return updated
  }

  const deleteItem = async (collection, id) => {
    setLoading(true)
    const res = await DataService.deleteItem(collection, id)
    refreshData()
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

  // Quick Action: generate and download report
  const generateReport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportData = [
      ['School Management System - Executive Platform Audit Report'],
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

  // Dynamic calculated stats
  const calculatedStats = {
    totalUsers: (data.users || []).length,
    totalInstitutes: (data.institutes || []).length,
    activeSessions: (data.users || []).length > 0 ? (data.users || []).length * 4 + 2 : 0,
    growthRate: (data.institutes || []).length > 0 ? `${((data.institutes || []).length * 11.4).toFixed(1)}%` : '0.0%'
  }

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
        saveAttendance,
        getAttendance,
        saveTimetable,
        getTimetable,
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
