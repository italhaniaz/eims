export const PROGRAM_LEVELS = [
  {
    id: 'all',
    tierNumber: 0,
    title: 'All Program Levels',
    shortTitle: 'All Levels',
    code: 'ALL',
    badge: 'Campus-wide',
    bracket: 'Whole Campus',
    description: 'Comprehensive aggregated view across all school wings from Pre-School / Early Years to Secondary Matric & O-Levels.',
    grades: 'Playgroup to Grade 10',
    typicalAge: 'All School Ages (3 - 16 Years)',
    color: 'slate',
    categories: [
      { 
        name: 'Pre-School / Early Years', 
        span: 'Playgroup - KG', 
        board: 'Early Years Foundation Stage (EYFS)',
        subjects: ['English Phonics', 'Basic Numbers', 'Sensory & Motor Skills', 'Visual Art & Play', 'Urdu Haroof'] 
      },
      { 
        name: 'Elementary Education', 
        span: 'Grades 1 - 8', 
        board: 'Curriculum Wing',
        subjects: ['English', 'Mathematics', 'General Science', 'Urdu', 'Social Studies', 'Computer Basics'] 
      },
      { 
        name: 'Secondary Education', 
        span: 'Grades 9 - 10', 
        board: 'BISE / Cambridge O-Levels',
        subjects: ['Physics', 'Chemistry', 'Biology / CS', 'Mathematics', 'English Language', 'Pakistan Studies'] 
      }
    ]
  },
  {
    id: 'preschool',
    tierNumber: 0.5,
    title: 'Pre-School / Early Years',
    shortTitle: 'Pre-School (Playgroup, Nursery, Prep, KG)',
    code: 'PRE',
    badge: 'Playgroup - KG',
    bracket: 'Early Childhood Care (ECCE)',
    description: 'Foundational Early Childhood Education (Playgroup, Nursery, Prep, KG) focused on motor, phonetic, and sensory development.',
    grades: 'Playgroup, Nursery, Prep, KG',
    typicalAge: '2.5 - 5 Years',
    color: 'pink',
    categories: [
      { 
        name: 'Early Years Foundation', 
        span: 'Playgroup - KG', 
        board: 'Early Years Foundation Stage (EYFS)',
        subjects: ['English Phonics & Rhymes', 'Basic Numbers & Counting', 'Sensory & Motor Skills', 'Visual Art & Play', 'Urdu Haroof-e-Tahajji'] 
      }
    ]
  },
  {
    id: 'elementary',
    tierNumber: 1,
    title: 'Elementary Level',
    shortTitle: 'Elementary (1-8)',
    code: 'ELEM',
    badge: 'Grade 1 - 8',
    bracket: 'Foundation School',
    description: 'Foundational Primary & Middle schooling focused on core literacy, numeracy, science, and ethical values.',
    grades: 'Grade 1 to Grade 8',
    typicalAge: '5 - 13 Years',
    color: 'emerald',
    categories: [
      { 
        name: 'Primary Section', 
        span: 'Grade 1 - 5', 
        board: 'Elementary Curriculum Wing',
        subjects: ['English Language', 'Urdu Literature', 'Foundational Mathematics', 'General Science', 'Islamiat', 'Visual Arts']
      },
      { 
        name: 'Middle Section', 
        span: 'Grade 6 - 8', 
        board: 'Elementary Examination Board',
        subjects: ['Pre-Algebra & Geometry', 'Integrated Science', 'Social Studies & Geography', 'Computer Literacy', 'English & Urdu']
      }
    ]
  },
  {
    id: 'secondary',
    tierNumber: 2,
    title: 'Secondary Level',
    shortTitle: 'Secondary (9-10)',
    code: 'SEC',
    badge: 'Grade 9 - 10',
    bracket: 'High School',
    description: 'Secondary School Certificate (SSC) Matriculation and Cambridge International O-Levels / IGCSE.',
    grades: 'Grade 9 & Grade 10',
    typicalAge: '14 - 16 Years',
    color: 'blue',
    categories: [
      { 
        name: 'Matriculation (Science Group)', 
        span: 'Grade 9 & 10', 
        board: 'Board of Intermediate & Secondary Education (BISE)',
        subjects: ['Physics', 'Chemistry', 'Biology / Computer Science', 'Mathematics', 'English Compulsory', 'Pakistan Studies']
      },
      { 
        name: 'Matriculation (Arts & Humanities)', 
        span: 'Grade 9 & 10', 
        board: 'Board of Intermediate & Secondary Education (BISE)',
        subjects: ['General Mathematics', 'General Science', 'Civics & Economics', 'Islamic Studies', 'Urdu Literature']
      },
      { 
        name: 'Cambridge O-Levels (IGCSE)', 
        span: 'O-1 & O-2', 
        board: 'Cambridge Assessment International Education (CAIE)',
        subjects: ['English Language 1123', 'Mathematics Syllabus D', 'Physics 5054', 'Chemistry 5070', 'Computer Science 2210']
      }
    ]
  }
]

// Helper function to map student's class name to a school program level
export const detectProgramLevel = (className = '') => {
  const normalized = className.toLowerCase().trim()

  if (
    normalized.includes('playgroup') || normalized.includes('nursery') ||
    normalized.includes('prep') || normalized.includes('kindergarten') ||
    normalized.includes('kg') || normalized.includes('pre-school') ||
    normalized.includes('preschool') || normalized.includes('montessori') ||
    normalized.includes('ecce')
  ) {
    return 'preschool'
  }

  if (
    normalized.includes('9th') || normalized.includes('10th') || 
    normalized.includes('matric') || normalized.includes('o-level') || 
    normalized.includes('o level') || normalized.includes('ssc')
  ) {
    return 'secondary'
  }

  if (
    normalized.includes('1st') || normalized.includes('2nd') || normalized.includes('3rd') || 
    normalized.includes('4th') || normalized.includes('5th') || normalized.includes('6th') || 
    normalized.includes('7th') || normalized.includes('8th') || normalized.includes('grade 1') ||
    normalized.includes('grade 2') || normalized.includes('grade 3') || normalized.includes('grade 4') ||
    normalized.includes('grade 5') || normalized.includes('grade 6') || normalized.includes('grade 7') ||
    normalized.includes('grade 8') || normalized.includes('primary') || normalized.includes('middle')
  ) {
    return 'elementary'
  }

  return 'all'
}

// Helper to normalize any class object so it always exposes a rich `sections` array
export const normalizeClassSections = (c) => {
  if (!c) return []
  if (Array.isArray(c.sections) && c.sections.length > 0) {
    return c.sections
  }
  if (c.section) {
    const parts = c.section.split(',').map(s => s.trim()).filter(Boolean)
    return parts.map((part, idx) => ({
      id: `sec-${idx + 1}`,
      name: part,
      roomNo: c.roomNo || `Room 10${idx + 1}`,
      capacity: Math.round((c.capacity || 40) / Math.max(1, parts.length)),
      enrolled: Math.round((c.enrolled || 0) / Math.max(1, parts.length)),
      classTeacher: c.classTeacher || 'Teacher In-Charge'
    }))
  }
  return [
    {
      id: 'sec-1',
      name: 'Section A',
      roomNo: c.roomNo || 'Room 101',
      capacity: c.capacity || 40,
      enrolled: c.enrolled || 0,
      classTeacher: c.classTeacher || 'Teacher In-Charge'
    }
  ]
}

// Built-in presets for 1-Click Standard Tier Classes Setup
export const TIER_DEFAULT_CLASSES = {
  preschool: [
    {
      name: 'Playgroup',
      programLevel: 'preschool',
      sections: [
        { id: 'sec-pg-1', name: 'Section A', roomNo: 'Room 001', capacity: 25, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-pg-2', name: 'Section B', roomNo: 'Room 002', capacity: 25, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: 'Nursery',
      programLevel: 'preschool',
      sections: [
        { id: 'sec-nur-1', name: 'Section A', roomNo: 'Room 003', capacity: 25, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-nur-2', name: 'Section B', roomNo: 'Room 004', capacity: 25, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: 'Prep',
      programLevel: 'preschool',
      sections: [
        { id: 'sec-prep-1', name: 'Section A', roomNo: 'Room 005', capacity: 30, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-prep-2', name: 'Section B', roomNo: 'Room 006', capacity: 30, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: 'Kindergarten (KG)',
      programLevel: 'preschool',
      sections: [
        { id: 'sec-kg-1', name: 'Section A', roomNo: 'Room 007', capacity: 30, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-kg-2', name: 'Section B', roomNo: 'Room 008', capacity: 30, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    }
  ],
  elementary: [
    {
      name: '1st Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-1g-1', name: 'Section A', roomNo: 'Room 101', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-1g-2', name: 'Section B', roomNo: 'Room 102', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '2nd Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-2g-1', name: 'Section A', roomNo: 'Room 103', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-2g-2', name: 'Section B', roomNo: 'Room 104', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '3rd Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-3g-1', name: 'Section A', roomNo: 'Room 105', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-3g-2', name: 'Section B', roomNo: 'Room 106', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '4th Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-4g-1', name: 'Section A', roomNo: 'Room 107', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-4g-2', name: 'Section B', roomNo: 'Room 108', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '5th Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-5g-1', name: 'Section A', roomNo: 'Room 109', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-5g-2', name: 'Section B', roomNo: 'Room 110', capacity: 35, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '6th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-6g-1', name: 'Section A', roomNo: 'Room 201', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-6g-2', name: 'Section B', roomNo: 'Room 202', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '7th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-7g-1', name: 'Section A', roomNo: 'Room 203', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-7g-2', name: 'Section B', roomNo: 'Room 204', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    },
    {
      name: '8th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-8g-1', name: 'Section A', roomNo: 'Room 205', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' },
        { id: 'sec-8g-2', name: 'Section B', roomNo: 'Room 206', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Co-ed', medium: 'English' }
      ]
    }
  ],
  secondary: [
    {
      name: '9th Grade (Matric Science)',
      programLevel: 'secondary',
      sections: [
        { id: 'sec-9s-1', name: 'Section A', roomNo: 'Room 301', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Boys', medium: 'English' },
        { id: 'sec-9s-2', name: 'Section B', roomNo: 'Room 302', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Girls', medium: 'English' }
      ]
    },
    {
      name: '10th Grade (Matric Science)',
      programLevel: 'secondary',
      sections: [
        { id: 'sec-10s-1', name: 'Section A', roomNo: 'Room 303', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Boys', medium: 'English' },
        { id: 'sec-10s-2', name: 'Section B', roomNo: 'Room 304', capacity: 40, enrolled: 0, classTeacher: '', shift: 'Morning', gender: 'Girls', medium: 'English' }
      ]
    }
  ]
}

export const getDefaultClassesForTier = (tierId) => {
  return TIER_DEFAULT_CLASSES[tierId] || []
}

// Standard preset class names selectable from dropdown
export const STANDARD_TIER_CLASS_NAMES = {
  preschool: [
    'Playgroup',
    'Nursery',
    'Prep',
    'Kindergarten (KG)',
    'Montessori Junior',
    'Montessori Senior',
    'Early Childhood Care (ECCE)'
  ],
  elementary: [
    'Grade 1 (Primary)',
    'Grade 2 (Primary)',
    'Grade 3 (Primary)',
    'Grade 4 (Primary)',
    'Grade 5 (Primary)',
    'Grade 6 (Middle)',
    'Grade 7 (Middle)',
    'Grade 8 (Middle)',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8'
  ],
  secondary: [
    '9th Grade (Matric Science)',
    '9th Grade (Matric Arts)',
    '10th Grade (Matric Science)',
    '10th Grade (Matric Arts)',
    'Cambridge O-Level (O-1)',
    'Cambridge O-Level (O-2)'
  ]
}

// Computes natural numeric sort rank based on tier & grade
export const calculateClassSortOrder = (className = '', tierId = 'elementary') => {
  const norm = className.toLowerCase()
  const numMatch = norm.match(/\d+/)
  const gradeNum = numMatch ? parseInt(numMatch[0], 10) : 0

  switch (tierId) {
    case 'preschool':
      if (norm.includes('playgroup')) return 1
      if (norm.includes('nursery')) return 2
      if (norm.includes('prep')) return 3
      if (norm.includes('kg') || norm.includes('kindergarten')) return 4
      return 5
    case 'elementary':
      return gradeNum ? gradeNum * 10 : 50
    case 'secondary':
      if (norm.includes('9th') || norm.includes('o-1')) return 90
      if (norm.includes('10th') || norm.includes('o-2')) return 100
      return gradeNum ? gradeNum * 10 : 90
    default:
      return 100
  }
}
