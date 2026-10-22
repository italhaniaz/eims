/**
 * Academic Subjects Engine & Curriculum Utilities
 * Supports School (K-12), College (Intermediate), and University (Undergrad/Postgrad)
 */

export const ACADEMIC_TIERS = [
  { id: 'all', label: 'All Tiers', badge: 'Campus-Wide' },
  { id: 'school', label: 'School (K-12)', badge: 'Primary / Secondary' },
  { id: 'college', label: 'College Wing', badge: 'Intermediate / HSSC' },
  { id: 'university', label: 'University', badge: 'Higher Ed / Degree' }
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
    title: 'School K-12 Standard Curriculum',
    tier: 'school',
    description: 'Comprehensive 6-subject package covering elementary & secondary board requirements.',
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
    id: 'college_pre_medical',
    title: 'College Pre-Medical (HSSC)',
    tier: 'college',
    description: 'BISE & Federal Board aligned curriculum for Pre-Medical intermediate students.',
    subjects: [
      { name: 'Biology (Theory & Lab)', code: 'BIO-111', tier: 'college', type: 'core', credits: 4, theoryHours: 3, labHours: 3, totalMarks: 100, passingMarks: 33, description: 'Cell biology, Genetics, Human physiology, and Botany practicals.' },
      { name: 'Chemistry (Organic & Physical)', code: 'CHM-111', tier: 'college', type: 'core', credits: 4, theoryHours: 3, labHours: 3, totalMarks: 100, passingMarks: 33, description: 'Chemical kinetics, Organic synthesis, Thermochemistry, and volumetric analysis.' },
      { name: 'Physics (Mechanics & Heat)', code: 'PHY-111', tier: 'college', type: 'core', credits: 4, theoryHours: 3, labHours: 3, totalMarks: 100, passingMarks: 33, description: 'Vectors, Work and energy, Circular motion, Fluid dynamics, and lab experiments.' },
      { name: 'English Compulsory Part-I', code: 'ENG-111', tier: 'college', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'Book I short stories, One-act plays, and applied grammar.' },
      { name: 'Islamic Studies / Ethics', code: 'ISL-111', tier: 'college', type: 'general', credits: 2, theoryHours: 2, labHours: 0, totalMarks: 50, passingMarks: 17, description: 'Quranic verses, Hadith study, Islamic morals, and civic ethics.' }
    ]
  },
  {
    id: 'college_ics',
    title: 'College ICS (Computer Science)',
    tier: 'college',
    description: 'Curriculum designed for Computer Science students preparing for software & IT fields.',
    subjects: [
      { name: 'Computer Science & Programming', code: 'CS-112', tier: 'college', type: 'practical', credits: 4, theoryHours: 3, labHours: 3, totalMarks: 100, passingMarks: 33, description: 'Algorithms, Flowcharts, C / C++ syntax, loops, and lab practicals.' },
      { name: 'Mathematics (Calculus & Functions)', code: 'MTH-112', tier: 'college', type: 'core', credits: 4, theoryHours: 4, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'Number systems, Matrices, Trigonometry, and analytical geometry.' },
      { name: 'Physics Part-I', code: 'PHY-112', tier: 'college', type: 'core', credits: 4, theoryHours: 3, labHours: 2, totalMarks: 100, passingMarks: 33, description: 'Mechanics, Waves, Thermodynamics, and laboratory verification.' },
      { name: 'English Compulsory Part-I', code: 'ENG-112', tier: 'college', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 33, description: 'Intermediate English curriculum with letter and application writing.' }
    ]
  },
  {
    id: 'university_bcs',
    title: 'University BS Computer Science Core',
    tier: 'university',
    description: 'HEC-compliant undergraduate course foundation for computer science & engineering.',
    subjects: [
      { name: 'Programming Fundamentals', code: 'CS-101', tier: 'university', type: 'core', credits: 4, theoryHours: 3, labHours: 3, totalMarks: 100, passingMarks: 50, description: 'Problem solving, syntax, control structures, functions, pointers, and memory.' },
      { name: 'Calculus & Analytical Geometry', code: 'MTH-101', tier: 'university', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 50, description: 'Limits, Continuity, Differentiation, Integration, and vector calculus.' },
      { name: 'Discrete Structures', code: 'CS-102', tier: 'university', type: 'core', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 50, description: 'Propositional logic, Set theory, Graph theory, Combinatorics, and proof techniques.' },
      { name: 'Functional English & Technical Writing', code: 'ENG-101', tier: 'university', type: 'general', credits: 3, theoryHours: 3, labHours: 0, totalMarks: 100, passingMarks: 50, description: 'Academic writing, Technical documentation, Presentation skills, and communication.' }
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
