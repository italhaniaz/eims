/**
 * Academic Subjects Engine & Curriculum Utilities
 * Supports School (Playgroup to Grade 10 / Matric / O-Levels)
 */

export const ACADEMIC_TIERS = [
  { id: 'all', label: 'All Tiers', badge: 'School-Wide' },
  { id: 'school', label: 'School (K-10)', badge: 'Primary / Middle / Secondary' }
]

export const SUBJECT_TYPES = [
  { id: 'core', label: 'Core / Compulsory', color: 'blue' },
  { id: 'elective', label: 'Elective Course', color: 'emerald' },
  { id: 'practical', label: 'Lab & Practical', color: 'purple' },
  { id: 'general', label: 'General Education', color: 'amber' },
  { id: 'project', label: 'Final Project / Thesis', color: 'rose' }
]

export const CURRICULUM_PRESETS = [
  {
    id: 'school_standard',
    title: 'School K-10 Standard Curriculum',
    tier: 'school',
    description: 'Comprehensive 6-subject package covering primary, middle & secondary school requirements.',
    subjects: [
      { name: 'Mathematics', code: 'MATH-101', tier: 'school', type: 'core', credits: 4, theoryHours: 4, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'Arithmetic, Algebra, Geometry, and practical problem solving.' },
      { name: 'English Language & Literature', code: 'ENG-101', tier: 'school', type: 'core', credits: 4, theoryHours: 4, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'Grammar, Reading comprehension, Creative writing, and Vocabulary.' },
      { name: 'Urdu Language & Grammar', code: 'URD-101', tier: 'school', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'National language literature, syntax, poetry, and essay writing.' },
      { name: 'General Science', code: 'SCI-101', tier: 'school', type: 'core', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 100, passingMarks: 33, description: 'Foundations of physical science, biological concepts, and environmental studies.' },
      { name: 'Pakistan Studies & Social Studies', code: 'PKS-101', tier: 'school', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 50, passingMarks: 17, description: 'History, geography, culture, and constitution of Pakistan.' },
      { name: 'Computer & Digital Literacy', code: 'CS-101', tier: 'school', type: 'practical', credits: 3, theoryHours: 2, labHours: 2, totalMarks: 75, passingMarks: 25, description: 'Basics of computing, typing, office productivity, and internet safety.' }
    ]
  },
  {
    id: 'school_matric_science',
    title: 'Matric Science Group (Grades 9-10)',
    tier: 'school',
    description: 'BISE & Federal Board aligned curriculum for Grades 9 & 10 Science students.',
    subjects: [
      { name: 'Biology (Theory & Practical)', code: 'BIO-901', tier: 'school', type: 'core', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 75, passingMarks: 25, description: 'Cell biology, Biodiversity, Human physiology, and Biology practicals.' },
      { name: 'Chemistry (Theory & Practical)', code: 'CHM-901', tier: 'school', type: 'core', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 75, passingMarks: 25, description: 'Atomic structure, Chemical bonding, Solutions, and lab experiments.' },
      { name: 'Physics (Theory & Practical)', code: 'PHY-901', tier: 'school', type: 'core', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 75, passingMarks: 25, description: 'Kinematics, Dynamics, Electricity, and Magnetism practicals.' },
      { name: 'Computer Science (SSC)', code: 'CS-901', tier: 'school', type: 'practical', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 75, passingMarks: 25, description: 'Problem solving, C programming basics, and digital logic.' },
      { name: 'Islamiat / Ethics', code: 'ISL-901', tier: 'school', type: 'general', credits: 2, theoryHours: 2, labHours: 0, totalMarks: 50, passingMarks: 17, description: 'Quranic verses, Hadith study, Islamic morals, and civic ethics.' }
    ]
  }
]

/**
 * Format CSV export of subjects catalog
 */
export const exportSubjectsToCSV = (subjects = [], programs = [], departments = [], instituteName = 'Campus') => {
  if (!subjects.length) {
    alert('No subjects available to export.')
    return
  }

  const progMap = new Map((programs || []).map(p => [p.id, p.name]))
  const deptMap = new Map((departments || []).map(d => [d.id, d.name]))

  const headers = [
    'Subject Code',
    'Subject Title',
    'Academic Tier',
    'Category / Type',
    'Credit Hours',
    'Theory Hours/Wk',
    'Lab Hours/Wk',
    'Total Marks',
    'Passing Marks',
    'Program',
    'Department',
    'Status',
    'Description'
  ]

  const rows = subjects.map(s => [
    `"${s.code || ''}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.tier || 'General').toUpperCase()}"`,
    `"${(s.type || 'Core').toUpperCase()}"`,
    s.credits || 4,
    s.theoryHours || 3,
    s.labHours || 0,
    s.totalMarks || 100,
    s.passingMarks || 33,
    `"${(progMap.get(s.programId) || 'All Programs').replace(/"/g, '""')}"`,
    `"${(deptMap.get(s.departmentId) || 'General Faculty').replace(/"/g, '""')}"`,
    `"${s.status || 'Active'}"`,
    `"${(s.description || '').replace(/"/g, '""')}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${instituteName.replace(/\s+/g, '_')}_Subjects_Directory_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
