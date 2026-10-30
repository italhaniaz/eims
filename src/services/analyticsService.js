import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData } from './dataService'

import { API_BASE_URL } from './apiConfig'

const FALLBACK_SCHEDULED_REPORTS = []

export const AnalyticsService = {
  // 1. GET AGGREGATED CROSS-INSTITUTE DATA
  getCrossInstituteData(period = 'last30') {
    const store = getStoredData()
    const institutes = store.institutes || []
    const students = store.students || []
    const teachers = store.teachers || []
    const fees = store.fees || []

    if (institutes.length === 0) {
      return {
        period,
        summary: {
          totalInstitutes: 0,
          totalStudents: 0,
          totalTeachers: 0,
          avgAttendance: 0,
          avgFeeRecovery: 0,
          totalBilledPKR: 0,
          totalCollectedPKR: 0
        },
        comparisonList: [],
        topPerformers: {
          topAttendance: null,
          lowestAttendance: null,
          topFeeRecovery: null,
          lowestFeeRecovery: null,
          largestEnrollment: null
        }
      }
    }

    // Compute metrics for each genuine institute
    const comparisonList = institutes.map((inst, index) => {
      const instStudents = students.filter(s => s.instituteId === inst.id)
      const instTeachers = teachers.filter(t => t.instituteId === inst.id)

      const studentCount = instStudents.length > 0 ? instStudents.length : (Number(inst.totalStudents) || 0)
      const teacherCount = instTeachers.length > 0 ? instTeachers.length : (Number(inst.totalTeachers) || 0)
      const studentTeacherRatio = teacherCount > 0 ? `${Math.round(studentCount / teacherCount)}:1` : '0:1'

      // Real attendance rate or 0 if no records
      let attendanceRate = 0
      const instAttendance = store.attendance ? Object.values(store.attendance).filter(a => a.instituteId === inst.id) : []
      if (instAttendance.length > 0) {
        const present = instAttendance.filter(a => a.status === 'Present').length
        attendanceRate = Math.round((present / instAttendance.length) * 1000) / 10
      }

      // Real fee recovery calculation
      const instFees = fees.filter(f => f.instituteId === inst.id)
      let feeRecoveryRate = 0
      let totalBilledPKR = 0
      let totalCollectedPKR = 0

      if (instFees.length > 0) {
        const total = instFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
        const paid = instFees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
        if (total > 0) {
          totalBilledPKR = total
          totalCollectedPKR = paid
          feeRecoveryRate = Math.round((paid / total) * 1000) / 10
        }
      }

      const growthRate = '+0.0%'
      const health = feeRecoveryRate >= 90 && attendanceRate >= 90 ? 'Excellent' : feeRecoveryRate >= 80 ? 'Good' : 'Needs Attention'

      return {
        id: inst.id,
        name: inst.name,
        code: inst.code,
        type: inst.type || 'School',
        city: inst.city || 'Central Region',
        campusesCount: 1,
        studentCount,
        teacherCount,
        studentTeacherRatio,
        attendanceRate,
        feeRecoveryRate,
        totalBilledPKR,
        totalCollectedPKR,
        growthRate,
        health
      }
    })

    // Totals & Averages
    const totalStudents = comparisonList.reduce((sum, i) => sum + i.studentCount, 0)
    const totalTeachers = comparisonList.reduce((sum, i) => sum + i.teacherCount, 0)
    const avgAttendance = comparisonList.length > 0 ? Math.round((comparisonList.reduce((sum, i) => sum + i.attendanceRate, 0) / comparisonList.length) * 10) / 10 : 0
    const avgFeeRecovery = comparisonList.length > 0 ? Math.round((comparisonList.reduce((sum, i) => sum + i.feeRecoveryRate, 0) / comparisonList.length) * 10) / 10 : 0
    const totalBilled = comparisonList.reduce((sum, i) => sum + i.totalBilledPKR, 0)
    const totalCollected = comparisonList.reduce((sum, i) => sum + i.totalCollectedPKR, 0)

    // Rankings
    const sortedByAttendance = [...comparisonList].sort((a, b) => b.attendanceRate - a.attendanceRate)
    const sortedByRecovery = [...comparisonList].sort((a, b) => b.feeRecoveryRate - a.feeRecoveryRate)
    const sortedByStudents = [...comparisonList].sort((a, b) => b.studentCount - a.studentCount)

    return {
      period,
      summary: {
        totalInstitutes: comparisonList.length,
        totalStudents,
        totalTeachers,
        avgAttendance,
        avgFeeRecovery,
        totalBilledPKR: totalBilled,
        totalCollectedPKR: totalCollected
      },
      comparisonList,
      topPerformers: {
        topAttendance: sortedByAttendance[0] || null,
        lowestAttendance: sortedByAttendance[sortedByAttendance.length - 1] || null,
        topFeeRecovery: sortedByRecovery[0] || null,
        lowestFeeRecovery: sortedByRecovery[sortedByRecovery.length - 1] || null,
        largestEnrollment: sortedByStudents[0] || null
      }
    }
  },

  // 2. EXPORT ENHANCED MULTI-SHEET CSV REPORT
  exportExecutiveReportCSV() {
    const data = this.getCrossInstituteData()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    const lines = [
      ['========================================================================'],
      ['EDUCATIONAL INSTITUTE MANAGEMENT SYSTEM - CROSS-INSTITUTE EXECUTIVE AUDIT'],
      ['Generated At:', new Date().toLocaleString()],
      ['Platform Security Clearance:', 'Super Administrator Multi-Campus Authority'],
      ['Currency:', 'PKR (Pakistani Rupee)'],
      ['========================================================================'],
      [''],
      ['--- PLATFORM PERFORMANCE AGGREGATES ---'],
      ['Total Active Institutes / Campuses', data.summary.totalInstitutes],
      ['Total Student Body', data.summary.totalStudents],
      ['Total Faculty & Instructors', data.summary.totalTeachers],
      ['Cross-Campus Average Attendance', `${data.summary.avgAttendance}%`],
      ['Overall Fee Recovery Ratio', `${data.summary.avgFeeRecovery}%`],
      ['Total Semester Tuition Invoiced (PKR)', data.summary.totalBilledPKR.toLocaleString()],
      ['Total Collected & Deposited (PKR)', data.summary.totalCollectedPKR.toLocaleString()],
      ['Outstanding Deficit (PKR)', (data.summary.totalBilledPKR - data.summary.totalCollectedPKR).toLocaleString()],
      [''],
      ['--- CROSS-CAMPUS COMPARATIVE PERFORMANCE AUDIT ---'],
      [
        'Institute Name',
        'Code',
        'Type',
        'Campuses',
        'Students',
        'Faculty',
        'Ratio',
        'Attendance Rate',
        'Fee Recovery %',
        'MoM Growth',
        'Total Billed (PKR)',
        'Collected (PKR)',
        'Performance Health'
      ]
    ]

    data.comparisonList.forEach(inst => {
      lines.push([
        `"${inst.name}"`,
        inst.code,
        inst.type,
        inst.campusesCount,
        inst.studentCount,
        inst.teacherCount,
        inst.studentTeacherRatio,
        `${inst.attendanceRate}%`,
        `${inst.feeRecoveryRate}%`,
        inst.growthRate,
        inst.totalBilledPKR,
        inst.totalCollectedPKR,
        inst.health
      ])
    })

    lines.push([''])
    lines.push(['--- EXECUTIVE KPI RANKINGS ---'])
    lines.push(['Top Attendance Performer', `"${data.topPerformers.topAttendance?.name}"`, `${data.topPerformers.topAttendance?.attendanceRate}%`])
    lines.push(['Top Fee Recovery Performer', `"${data.topPerformers.topFeeRecovery?.name}"`, `${data.topPerformers.topFeeRecovery?.feeRecoveryRate}%`])
    lines.push(['Largest Student Population', `"${data.topPerformers.largestEnrollment?.name}"`, `${data.topPerformers.largestEnrollment?.studentCount} Students`])

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(l => l.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `EIMS_Executive_Analytics_Report_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    DataService.logActivity(
      'Executive Report Downloaded',
      'Generated comprehensive multi-campus cross-institute CSV audit snapshot',
      'Super Admin'
    )
  },

  // 3. SCHEDULED REPORTS
  async getScheduledReports() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/scheduled`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_scheduled_reports')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_scheduled_reports', JSON.stringify(FALLBACK_SCHEDULED_REPORTS))
    return FALLBACK_SCHEDULED_REPORTS
  },

  async saveScheduledReport(reportData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/scheduled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })
      if (res.ok) {
        DataService.logActivity('Report Scheduled', `Scheduled automated briefing: ${reportData.title}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const reports = await this.getScheduledReports()
    const newReport = {
      ...reportData,
      id: 'sch-' + Date.now(),
      isActive: true,
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 7 * 86400000).toISOString()
    }
    reports.push(newReport)
    localStorage.setItem('sms_scheduled_reports', JSON.stringify(reports))
    DataService.logActivity('Report Scheduled', `Scheduled recurring ${reportData.frequency} report in local store`, 'Super Admin')
    return { success: true, report: newReport }
  },

  async deleteScheduledReport(id) {
    try {
      await fetch(`${API_BASE_URL}/api/reports/scheduled/${id}`, { method: 'DELETE' })
    } catch {}

    const reports = await this.getScheduledReports()
    const updated = reports.filter(r => r.id !== id)
    localStorage.setItem('sms_scheduled_reports', JSON.stringify(updated))
    DataService.logActivity('Report Schedule Cancelled', `Removed scheduled briefing ID: ${id}`, 'Super Admin')
    return { success: true }
  }
}
