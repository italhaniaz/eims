export const PROGRAM_LEVELS = [
  {
    id: 'all',
    tierNumber: 0,
    title: 'All Program Levels',
    shortTitle: 'All Levels',
    code: 'ALL',
    badge: 'Campus-wide',
    bracket: 'Whole Campus',
    description: 'Comprehensive aggregated view across all educational tiers from Primary schooling to University programs.',
    grades: 'Grades 1 to Postgraduate',
    typicalAge: 'All Ages (5 - 24+ Years)',
    color: 'slate',
    categories: [
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
      },
      { 
        name: 'Higher Secondary Education', 
        span: 'Grades 11 - 12', 
        board: 'BISE / Cambridge A-Levels',
        subjects: ['Pre-Medical', 'Pre-Engineering', 'Computer Science (ICS)', 'Commerce (I.Com)', 'A-Levels'] 
      },
      { 
        name: 'College Education', 
        span: 'Associate Degrees', 
        board: 'Affiliated University',
        subjects: ['ADP in Computer Science', 'ADP in Business Administration', 'Technical Engineering (DAE)'] 
      },
      { 
        name: 'University Education', 
        span: 'Undergraduate & Graduate', 
        board: 'Higher Education Commission (HEC)',
        subjects: ['BS Computer Science', 'BS Software Engineering', 'BBA Honors', 'MS / MPhil Programs'] 
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
  },
  {
    id: 'higher-secondary',
    tierNumber: 3,
    title: 'Higher Secondary Level',
    shortTitle: 'HSSC (11-12)',
    code: 'HSSC',
    badge: 'Grade 11 - 12',
    bracket: 'College / Inter',
    description: 'Higher Secondary School Certificate (HSSC / Intermediate) and Cambridge International A-Levels.',
    grades: 'Grade 11 & Grade 12',
    typicalAge: '16 - 18 Years',
    color: 'indigo',
    categories: [
      { 
        name: 'F.Sc Pre-Medical', 
        span: '11th & 12th', 
        board: 'BISE Intermediate Board',
        subjects: ['Biology (Anatomy & Genetics)', 'Chemistry (Organic & Physical)', 'Physics', 'English', 'Urdu & Islamic Studies']
      },
      { 
        name: 'F.Sc Pre-Engineering', 
        span: '11th & 12th', 
        board: 'BISE Intermediate Board',
        subjects: ['Mathematics (Calculus & Vectors)', 'Physics (Modern Physics)', 'Chemistry', 'English', 'Pakistan Studies']
      },
      { 
        name: 'ICS (Computer Science)', 
        span: '11th & 12th', 
        board: 'BISE Intermediate Board',
        subjects: ['Computer Science (C & Database)', 'Mathematics', 'Physics or Statistics', 'English', 'Urdu']
      },
      { 
        name: 'I.Com & FA General', 
        span: '11th & 12th', 
        board: 'BISE Intermediate Board',
        subjects: ['Principles of Accounting', 'Economics & Commercial Geography', 'Business Math', 'English', 'Urdu']
      },
      { 
        name: 'Cambridge A-Levels', 
        span: 'AS & A2 Levels', 
        board: 'Cambridge Assessment International Education (CAIE)',
        subjects: ['Pure Mathematics 9709', 'Physics 9702', 'Chemistry 9701', 'Computer Science 9618']
      }
    ]
  },
  {
    id: 'college',
    tierNumber: 4,
    title: 'College Level',
    shortTitle: 'College (ADP)',
    code: 'COLLEGE',
    badge: 'Associate Degrees',
    bracket: 'Higher College',
    description: '2-Year Associate Degree Programs (ADP) and 3-Year Technical Engineering Diplomas (DAE).',
    grades: 'Semester 1 to 4',
    typicalAge: '18 - 20 Years',
    color: 'amber',
    categories: [
      { 
        name: 'ADP in Computer Science (ADP-CS)', 
        span: '2-Year Degree (4 Semesters)', 
        board: 'Affiliated Public University',
        subjects: ['Programming Fundamentals', 'Object Oriented Programming', 'Database Systems', 'Data Communication & Networks']
      },
      { 
        name: 'ADP in Business Administration (ADP-BBA)', 
        span: '2-Year Degree (4 Semesters)', 
        board: 'Affiliated Public University',
        subjects: ['Financial Accounting', 'Principles of Marketing', 'Business Communication', 'Macroeconomics']
      },
      { 
        name: 'DAE (Diploma of Associate Engineering)', 
        span: '3-Year Technical Diploma', 
        board: 'Punjab Board of Technical Education (PBTE)',
        subjects: ['Applied Electrical Technology', 'Mechanical Engineering Workshop', 'Electronics Circuits', 'Industrial Management']
      }
    ]
  },
  {
    id: 'university',
    tierNumber: 5,
    title: 'University Level',
    shortTitle: 'University (BS/MS)',
    code: 'UNI',
    badge: 'Higher Ed (HEC)',
    bracket: 'University Faculty',
    description: '4-Year Bachelor of Science (BS Honors) and 2-Year Postgraduate Masters / MPhil degree programs.',
    grades: 'BS / MS / MPhil',
    typicalAge: '19 - 24+ Years',
    color: 'purple',
    categories: [
      { 
        name: 'BS Computer Science (BSCS)', 
        span: '4-Year Degree (8 Semesters)', 
        board: 'Higher Education Commission (HEC) Recognized',
        subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Artificial Intelligence & ML', 'Software Architecture', 'Senior FYP']
      },
      { 
        name: 'BS Software Engineering (BSSE)', 
        span: '4-Year Degree (8 Semesters)', 
        board: 'Higher Education Commission (HEC) Recognized',
        subjects: ['Software Requirements Engineering', 'Software Quality Assurance', 'Cloud Computing', 'Web Frameworks & DevOps']
      },
      { 
        name: 'BBA (Bachelor of Business Admin)', 
        span: '4-Year Degree (8 Semesters)', 
        board: 'Higher Education Commission (HEC) Recognized',
        subjects: ['Strategic Management', 'Corporate Finance', 'Human Resource Management', 'Supply Chain & Operations']
      },
      { 
        name: 'MS / MPhil Programs', 
        span: '2-Year Postgraduate (4 Semesters)', 
        board: 'Higher Education Commission (HEC) Recognized',
        subjects: ['Advanced Research Methodologies', 'Distributed Computing', 'Deep Learning & Neural Networks', 'MPhil Thesis']
      }
    ]
  }
]

// Helper function to map student's class name to a program level
export const detectProgramLevel = (className = '') => {
  const normalized = className.toLowerCase().trim()

  if (
    normalized.includes('1st year') || normalized.includes('2nd year') ||
    normalized.includes('11th') || normalized.includes('12th') || 
    normalized.includes('fsc') || normalized.includes('f.sc') || 
    normalized.includes('ics') || normalized.includes('i.com') || 
    normalized.includes('fa') || normalized.includes('a-level') || 
    normalized.includes('a level') || normalized.includes('inter') ||
    normalized.includes('hssc')
  ) {
    return 'higher-secondary'
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

  if (
    normalized.includes('9th') || normalized.includes('10th') || 
    normalized.includes('matric') || normalized.includes('o-level') || 
    normalized.includes('o level') || normalized.includes('ssc')
  ) {
    return 'secondary'
  }

  if (
    normalized.includes('adp') || normalized.includes('associate') || 
    normalized.includes('dae') || normalized.includes('diploma')
  ) {
    return 'college'
  }

  if (
    normalized.includes('bs') || normalized.includes('bachelor') || 
    normalized.includes('ms') || normalized.includes('mphil') || 
    normalized.includes('master') || normalized.includes('phd')
  ) {
    return 'university'
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
  elementary: [
    {
      name: '1st Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-1g-1', name: 'Super Section', roomNo: 'Room 101', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: 'sec-1g-2', name: 'Section A', roomNo: 'Room 102', capacity: 35, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '2nd Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-2g-1', name: 'Super Section', roomNo: 'Room 103', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: 'sec-2g-2', name: 'Section A', roomNo: 'Room 104', capacity: 35, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '3rd Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-3g-1', name: 'Super Section', roomNo: 'Room 105', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: 'sec-3g-2', name: 'Section A', roomNo: 'Room 106', capacity: 35, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '4th Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-4g-1', name: 'Super Section', roomNo: 'Room 107', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: 'sec-4g-2', name: 'Section A', roomNo: 'Room 108', capacity: 35, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '5th Grade (Primary)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-5g-1', name: 'Super Section', roomNo: 'Room 109', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: 'sec-5g-2', name: 'Section A', roomNo: 'Room 110', capacity: 35, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '6th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-6g-1', name: 'Super Section', roomNo: 'Room 201', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-6g-2', name: 'Section A', roomNo: 'Room 202', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '7th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-7g-1', name: 'Super Section', roomNo: 'Room 203', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-7g-2', name: 'Section A', roomNo: 'Room 204', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '8th Grade (Middle)',
      programLevel: 'elementary',
      sections: [
        { id: 'sec-8g-1', name: 'Super Section', roomNo: 'Room 205', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-8g-2', name: 'Section A', roomNo: 'Room 206', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    }
  ],
  secondary: [
    {
      name: '9th Grade (Matric Science)',
      programLevel: 'secondary',
      sections: [
        { id: 'sec-9s-1', name: 'Super Section', roomNo: 'Room 301', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-9s-2', name: 'Section A', roomNo: 'Room 302', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-9s-3', name: 'Section B', roomNo: 'Room 303', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '10th Grade (Matric Science)',
      programLevel: 'secondary',
      sections: [
        { id: 'sec-10s-1', name: 'Super Section', roomNo: 'Room 304', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-10s-2', name: 'Section A', roomNo: 'Room 305', capacity: 40, enrolled: 0, classTeacher: '' },
        { id: 'sec-10s-3', name: 'Section B', roomNo: 'Room 306', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    }
  ],
  'higher-secondary': [
    {
      name: '11th Grade (F.Sc Pre-Medical)',
      programLevel: 'higher-secondary',
      sections: [
        { id: 'sec-11m-1', name: 'Super Section', roomNo: 'Hall 401', capacity: 45, enrolled: 0, classTeacher: '' },
        { id: 'sec-11m-2', name: 'Section A', roomNo: 'Hall 402', capacity: 45, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '11th Grade (ICS Computer Science)',
      programLevel: 'higher-secondary',
      sections: [
        { id: 'sec-11c-1', name: 'Super Section', roomNo: 'Hall 403', capacity: 45, enrolled: 0, classTeacher: '' },
        { id: 'sec-11c-2', name: 'Section A', roomNo: 'Hall 404', capacity: 45, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: '12th Grade (F.Sc Pre-Engineering)',
      programLevel: 'higher-secondary',
      sections: [
        { id: 'sec-12e-1', name: 'Super Section', roomNo: 'Hall 405', capacity: 45, enrolled: 0, classTeacher: '' },
        { id: 'sec-12e-2', name: 'Section A', roomNo: 'Hall 406', capacity: 45, enrolled: 0, classTeacher: '' }
      ]
    }
  ],
  college: [
    {
      name: 'ADP in Computer Science (ADP-CS)',
      programLevel: 'college',
      sections: [
        { id: 'sec-adp-1', name: 'Morning Batch', roomNo: 'Block B-101', capacity: 50, enrolled: 0, classTeacher: '' },
        { id: 'sec-adp-2', name: 'Evening Batch', roomNo: 'Block B-102', capacity: 50, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: 'ADP in Business Administration (ADP-BBA)',
      programLevel: 'college',
      sections: [
        { id: 'sec-adpb-1', name: 'Morning Batch', roomNo: 'Block B-103', capacity: 50, enrolled: 0, classTeacher: '' }
      ]
    }
  ],
  university: [
    {
      name: 'BS Computer Science (BSCS)',
      programLevel: 'university',
      sections: [
        { id: 'sec-bscs-1', name: 'Super Section', roomNo: 'Lab Complex 1', capacity: 50, enrolled: 0, classTeacher: '' },
        { id: 'sec-bscs-2', name: 'Section Alpha', roomNo: 'Lab Complex 2', capacity: 50, enrolled: 0, classTeacher: '' }
      ]
    },
    {
      name: 'BS Software Engineering (BSSE)',
      programLevel: 'university',
      sections: [
        { id: 'sec-bsse-1', name: 'Super Section', roomNo: 'Software Hall 1', capacity: 45, enrolled: 0, classTeacher: '' },
        { id: 'sec-bsse-2', name: 'Section Alpha', roomNo: 'Software Hall 2', capacity: 45, enrolled: 0, classTeacher: '' }
      ]
    }
  ]
}

export const getDefaultClassesForTier = (tierId) => {
  return TIER_DEFAULT_CLASSES[tierId] || []
}
