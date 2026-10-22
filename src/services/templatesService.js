import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

const FALLBACK_TEMPLATES = [
  {
    id: 'tpl-grade-1',
    templateType: 'GRADING_SYSTEM',
    title: 'Standard Secondary Percentage Scale',
    code: 'GRADE-STD-SEC',
    description: 'Standard secondary matric & O-level letter grades with numerical bounds',
    data: [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, points: 4.0, remarks: 'Outstanding Achievement' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89, points: 3.7, remarks: 'Excellent Mastery' },
      { grade: 'B', minPercentage: 70, maxPercentage: 79, points: 3.0, remarks: 'Very Good' },
      { grade: 'C', minPercentage: 60, maxPercentage: 69, points: 2.0, remarks: 'Satisfactory' },
      { grade: 'D', minPercentage: 50, maxPercentage: 59, points: 1.0, remarks: 'Pass Threshold' },
      { grade: 'F', minPercentage: 0, maxPercentage: 49, points: 0.0, remarks: 'Fail / Re-sit' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'tpl-grade-2',
    templateType: 'GRADING_SYSTEM',
    title: 'HEC 4.0 GPA Higher Education Scale',
    code: 'GRADE-HEC-GPA',
    description: 'Higher Education Commission standardized semester GPA scale',
    data: [
      { grade: 'A', minPercentage: 85, maxPercentage: 100, points: 4.0, remarks: 'High Honors' },
      { grade: 'A-', minPercentage: 80, maxPercentage: 84, points: 3.67, remarks: 'Honors' },
      { grade: 'B+', minPercentage: 75, maxPercentage: 79, points: 3.33, remarks: 'Superior' },
      { grade: 'B', minPercentage: 71, maxPercentage: 74, points: 3.0, remarks: 'Good' },
      { grade: 'B-', minPercentage: 68, maxPercentage: 70, points: 2.67, remarks: 'Above Average' },
      { grade: 'C+', minPercentage: 64, maxPercentage: 67, points: 2.33, remarks: 'Average' },
      { grade: 'C', minPercentage: 60, maxPercentage: 63, points: 2.0, remarks: 'Satisfactory' },
      { grade: 'F', minPercentage: 0, maxPercentage: 59, points: 0.0, remarks: 'Failing Grade' }
    ],
    isDefault: false,
    pushedCount: 1,
    lastPushedAt: '2026-10-10T14:30:00Z'
  },
  {
    id: 'tpl-fee-1',
    templateType: 'FEE_HEAD',
    title: 'Comprehensive School Fee Heads',
    code: 'FEE-COMP-SCH',
    description: 'Pre-configured standard school fee heads in PKR',
    data: [
      { name: 'Monthly Tuition Fee', category: 'Academic', defaultAmount: 12000, refundable: false },
      { name: 'Computer & IT Lab Fee', category: 'Facilities', defaultAmount: 1500, refundable: false },
      { name: 'Library Dues & Journal Fund', category: 'Academic', defaultAmount: 800, refundable: false },
      { name: 'Transport & Bus Logistics', category: 'Transport', defaultAmount: 4500, refundable: false },
      { name: 'Annual Examination Charge', category: 'Exam', defaultAmount: 3000, refundable: false },
      { name: 'Security Deposit (Admission)', category: 'Registration', defaultAmount: 10000, refundable: true }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: '2026-10-16T09:15:00Z'
  },
  {
    id: 'tpl-desig-1',
    templateType: 'DESIGNATION',
    title: 'Standard Academic & Campus Staff Designations',
    code: 'DESIG-CORP-STD',
    description: 'Standardized designations and administrative pay tiers',
    data: [
      { title: 'Executive Principal / Rector', department: 'Executive Management', level: 'Grade 20', role: 'Head of Institute' },
      { title: 'Vice Principal / Academic Dean', department: 'Academic Affairs', level: 'Grade 19', role: 'Academic Direction' },
      { title: 'Head of Department (HoD)', department: 'Academic Departments', level: 'Grade 18', role: 'Faculty Management' },
      { title: 'Senior Subject Lecturer', department: 'Faculty', level: 'Grade 17', role: 'Instruction & Mentorship' },
      { title: 'Laboratory Demonstrator', department: 'Science Laboratories', level: 'Grade 14', role: 'Lab Supervision' },
      { title: 'Chief Campus Accountant', department: 'Accounts & Finance', level: 'Grade 16', role: 'Finance & Cashier' },
      { title: 'Central Librarian', department: 'Library', level: 'Grade 15', role: 'Book & Resource Catalog' },
      { title: 'Transport & Fleet Supervisor', department: 'Logistics', level: 'Grade 12', role: 'Fleet & Routes' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: '2026-10-14T11:45:00Z'
  },
  {
    id: 'tpl-subj-1',
    templateType: 'SUBJECT_TEMPLATE',
    title: 'Core National Secondary Curriculum',
    code: 'SUBJ-NAT-SEC',
    description: 'Standard secondary school subjects with credit hours and standardized codes',
    data: [
      { name: 'Mathematics & Algebra', code: 'MTH-101', credits: 4, category: 'Core Science' },
      { name: 'Physics & Practical Lab', code: 'PHY-101', credits: 4, category: 'Core Science' },
      { name: 'Chemistry & Laboratory', code: 'CHM-101', credits: 4, category: 'Core Science' },
      { name: 'Biology & Life Sciences', code: 'BIO-101', credits: 4, category: 'Core Science' },
      { name: 'Computer Science & Programming', code: 'CSC-101', credits: 4, category: 'Technical' },
      { name: 'English Language & Composition', code: 'ENG-101', credits: 3, category: 'Humanities' },
      { name: 'Islamic Studies / Ethics', code: 'ISL-101', credits: 2, category: 'Social Studies' },
      { name: 'Pakistan Studies & History', code: 'PKS-101', credits: 2, category: 'Social Studies' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: '2026-10-18T16:20:00Z'
  }
]

export const TemplatesService = {
  async getTemplates() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/templates`)
      if (res.ok) return await res.json()
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('global_templates').select('*')
      if (!error && data && data.length > 0) return data
    }

    const local = localStorage.getItem('sms_global_templates')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_global_templates', JSON.stringify(FALLBACK_TEMPLATES))
    return FALLBACK_TEMPLATES
  },

  async saveTemplate(tplData) {
    try {
      if (tplData.id && !tplData.id.startsWith('new-')) {
        const res = await fetch(`${API_BASE_URL}/api/templates/${tplData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tplData)
        })
        if (res.ok) {
          DataService.logActivity('Template Updated', `Updated master template: ${tplData.title}`, 'Super Admin')
          return await res.json()
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tplData)
        })
        if (res.ok) {
          DataService.logActivity('Template Created', `Created global master template: ${tplData.title}`, 'Super Admin')
          return await res.json()
        }
      }
    } catch {}

    const templates = await this.getTemplates()
    let saved
    if (tplData.id && templates.some(t => t.id === tplData.id)) {
      const idx = templates.findIndex(t => t.id === tplData.id)
      templates[idx] = { ...templates[idx], ...tplData, lastPushedAt: new Date().toISOString() }
      saved = templates[idx]
    } else {
      saved = {
        ...tplData,
        id: 'tpl-' + Date.now(),
        code: tplData.code || 'TPL-' + Math.floor(100 + Math.random() * 900),
        pushedCount: 0,
        lastPushedAt: null
      }
      templates.push(saved)
    }

    localStorage.setItem('sms_global_templates', JSON.stringify(templates))
    DataService.logActivity('Template Saved', `Configured global template: ${saved.title}`, 'Super Admin')
    return { success: true, template: saved }
  },

  async deleteTemplate(id) {
    try {
      await fetch(`${API_BASE_URL}/api/templates/${id}`, { method: 'DELETE' })
    } catch {}

    const templates = await this.getTemplates()
    const updated = templates.filter(t => t.id !== id)
    localStorage.setItem('sms_global_templates', JSON.stringify(updated))
    DataService.logActivity('Template Removed', `Deleted global template ID: ${id}`, 'Super Admin')
    return { success: true }
  },

  async pushTemplateToInstitutes(templateId, targetInstituteIds = []) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/templates/${templateId}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetInstituteIds })
      })
      if (res.ok) {
        // Also sync locally
      }
    } catch {}

    const templates = await this.getTemplates()
    const tpl = templates.find(t => t.id === templateId)
    if (!tpl) return { success: false, error: 'Template not found' }

    tpl.pushedCount = (tpl.pushedCount || 0) + (targetInstituteIds.length || 1)
    tpl.lastPushedAt = new Date().toISOString()
    localStorage.setItem('sms_global_templates', JSON.stringify(templates))

    // If template is SUBJECT_TEMPLATE, push subjects into the application storage
    if (tpl.templateType === 'SUBJECT_TEMPLATE' && Array.isArray(tpl.data)) {
      const store = getStoredData()
      const existingSubjects = store.subjects || []
      let addedCount = 0

      tpl.data.forEach(item => {
        const exists = existingSubjects.some(s => (s.code && s.code.toLowerCase() === (item.code || '').toLowerCase()) || (s.name && s.name.toLowerCase() === item.name.toLowerCase()))
        if (!exists) {
          existingSubjects.push({
            id: 'subj-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            name: item.name,
            code: item.code,
            credits: item.credits || 3,
            category: item.category || 'General',
            programId: store.programs?.[0]?.id || ''
          })
          addedCount++
        }
      })

      store.subjects = existingSubjects
      saveStoredData(store)
    }

    DataService.logActivity(
      'Template Pushed to Institutes',
      `Synchronized template "${tpl.title}" across ${targetInstituteIds.length || 1} institute campus(es)`,
      'Super Admin'
    )

    return {
      success: true,
      message: `Template "${tpl.title}" successfully pushed to ${targetInstituteIds.length || 1} institute(s).`,
      template: tpl
    }
  }
}
