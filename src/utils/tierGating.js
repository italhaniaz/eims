/**
 * Tier Gating & Dynamic Feature Scoping Engine
 * Enforces strict educational hierarchy scoping: School vs College vs University vs Composite
 */

export const TIER_LEVEL_MAP = {
  school: ['preschool', 'elementary', 'secondary'],
  college: ['higher-secondary', 'college'],
  undergraduate: ['university'],
  university: ['university']
}

/**
 * Resolves full tier configuration, allowed levels, allowed wings, and UI terminology
 * for any given institute object.
 */
export const getInstituteTierConfig = (institute) => {
  if (!institute) {
    return {
      type: 'School',
      enabledTiers: ['school'],
      allowedLevelIds: ['preschool', 'elementary', 'secondary'],
      portalTitle: 'School Administration',
      roleBadge: 'School Admin',
      portalTypeLabel: 'School Portal (K-10)',
      isSchool: true,
      isCollege: false,
      isUniversity: false,
      isMultiTier: false,
      isLevelAllowed: (id) => id === 'all' || ['preschool', 'elementary', 'secondary'].includes(id),
      isWingAllowed: (wingId) => wingId === 'school',
      terminology: {
        classes: 'Classes & Sections',
        classUnit: 'Class',
        sectionUnit: 'Section',
        teacherUnit: 'Class Teacher',
        exams: 'Examinations & Marks',
        certificates: 'Certificates (SLC/Conduct)',
        curriculum: 'Curriculum & Subjects',
        idLabel: 'Student Roll No'
      }
    }
  }

  const rawType = (institute.type || 'School').trim()
  
  // Normalize enabledTiers
  let enabledTiers = []
  if (Array.isArray(institute.enabledTiers) && institute.enabledTiers.length > 0) {
    enabledTiers = institute.enabledTiers.map(t => t.toLowerCase())
  } else {
    const lType = rawType.toLowerCase()
    if (lType === 'school') enabledTiers = ['school']
    else if (lType === 'college') enabledTiers = ['college']
    else if (lType === 'university' || lType === 'undergraduate') enabledTiers = ['undergraduate']
    else enabledTiers = ['school', 'college'] // Default hybrid
  }

  // Calculate set of allowed academic program level IDs
  const allowedLevelsSet = new Set()
  enabledTiers.forEach(tier => {
    const levels = TIER_LEVEL_MAP[tier] || []
    levels.forEach(lvl => allowedLevelsSet.add(lvl))
  })

  // Booleans
  const hasSchool = enabledTiers.includes('school')
  const hasCollege = enabledTiers.includes('college')
  const hasUniversity = enabledTiers.includes('undergraduate') || enabledTiers.includes('university')

  const isSchoolOnly = hasSchool && !hasCollege && !hasUniversity
  const isCollegeOnly = hasCollege && !hasSchool && !hasUniversity
  const isUniversityOnly = hasUniversity && !hasSchool && !hasCollege
  const isMultiTier = enabledTiers.length > 1

  // Resolve Portal Branding
  let portalTitle = 'Campus Administration'
  let roleBadge = 'Campus Admin'
  let portalTypeLabel = 'Composite Campus'

  if (isSchoolOnly) {
    portalTitle = 'School Administration'
    roleBadge = 'School Principal'
    portalTypeLabel = 'School Portal (K-10)'
  } else if (isCollegeOnly) {
    portalTitle = 'Degree College Administration'
    roleBadge = 'College Principal'
    portalTypeLabel = 'College Portal (11-12 & ADP)'
  } else if (isUniversityOnly) {
    portalTitle = 'University Administration'
    roleBadge = 'Dean / Registrar'
    portalTypeLabel = 'University Portal (BS & Undergrad)'
  } else if (isMultiTier) {
    portalTitle = 'Comprehensive Campus Administration'
    roleBadge = 'Campus Director'
    portalTypeLabel = 'Multi-Tier Campus'
  }

  // Dynamic Contextual Terminology for UI
  const terminology = {
    classes: isUniversityOnly ? 'Degree Programs & Semesters' : isCollegeOnly ? 'Disciplines & Batches' : 'Classes & Sections',
    classUnit: isUniversityOnly ? 'Degree Program' : isCollegeOnly ? 'Academic Discipline' : 'Class',
    sectionUnit: isUniversityOnly ? 'Semester Batch' : isCollegeOnly ? 'Section / Stream' : 'Section',
    teacherUnit: isUniversityOnly ? 'Faculty / Professor' : isCollegeOnly ? 'Lecturer / Professor' : 'Class Teacher',
    exams: isUniversityOnly ? 'Semester Examinations & GPA' : isCollegeOnly ? 'Board & Send-up Exams' : 'Term Examinations & Marks',
    certificates: isUniversityOnly ? 'Transcripts & Degree Attestation' : isCollegeOnly ? 'College Leaving (CLC) & Character' : 'School Leaving (SLC) & Character',
    curriculum: isUniversityOnly ? 'Course Syllabus & Modules' : isCollegeOnly ? 'Intermediate Syllabus' : 'Curriculum & Subjects',
    idLabel: isUniversityOnly ? 'University Reg. No' : isCollegeOnly ? 'College / Board Roll No' : 'Student Roll No'
  }

  return {
    rawType,
    enabledTiers,
    allowedLevelIds: Array.from(allowedLevelsSet),
    isLevelAllowed: (levelId) => {
      if (!levelId || levelId === 'all') return true
      return allowedLevelsSet.has(levelId)
    },
    isWingAllowed: (wingId) => {
      if (wingId === 'all') return isMultiTier
      return enabledTiers.includes(wingId)
    },
    isSchoolOnly,
    isCollegeOnly,
    isUniversityOnly,
    isMultiTier,
    hasSchool,
    hasCollege,
    hasUniversity,
    portalTitle,
    roleBadge,
    portalTypeLabel,
    terminology,
    defaultLevel: isSchoolOnly ? 'elementary' : isCollegeOnly ? 'higher-secondary' : isUniversityOnly ? 'university' : 'all'
  }
}
