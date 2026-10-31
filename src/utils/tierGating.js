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
      hasSchool: true,
      hasCollege: false,
      hasUniversity: false,
      isSchoolOnly: true,
      isCollegeOnly: false,
      isUniversityOnly: false,
      isLevelAllowed: (id) => id === 'all' || ['preschool', 'elementary', 'secondary'].includes(id),
      isWingAllowed: (wingId) => wingId === 'school',
      terminology: {
        classes: 'Classes & Sections',
        classUnit: 'Class',
        sectionUnit: 'Section',
        teacherUnit: 'Class Teacher',
        exams: 'Examinations & Marks',
        certificates: 'School Leaving (SLC) & Character',
        curriculum: 'Curriculum & Subjects',
        idLabel: 'Student Roll No'
      }
    }
  }

  // Deduce type accurately even if partial institute object is passed
  const idStr = String(institute.id || '').toLowerCase()
  const nameStr = String(institute.name || institute.instituteName || '').toLowerCase()
  const scopeStr = String(institute.scope || institute.roleTitle || '').toLowerCase()

  let rawType = (institute.type || institute.planType || institute.instituteType || '').trim()
  
  if (!rawType) {
    if (idStr === 'inst-3' || nameStr.includes('college') || nameStr.includes('roots') || scopeStr.includes('college')) {
      rawType = 'College'
    } else if (idStr === 'inst-4' || nameStr.includes('university') || nameStr.includes('applied sciences') || scopeStr.includes('university') || scopeStr.includes('dean') || scopeStr.includes('registrar')) {
      rawType = 'University'
    } else if (idStr === 'inst-1' || nameStr.includes('beaconhouse') || nameStr.includes('composite') || scopeStr.includes('composite')) {
      rawType = 'Custom'
    } else if (idStr === 'inst-2' || nameStr.includes('city school') || nameStr.includes('school')) {
      rawType = 'School'
    } else {
      rawType = 'School'
    }
  }
  
  // Normalize enabledTiers
  let enabledTiers = []
  if (Array.isArray(institute.enabledTiers) && institute.enabledTiers.length > 0) {
    enabledTiers = institute.enabledTiers.map(t => t.toLowerCase())
  } else {
    const lType = rawType.toLowerCase()
    if (idStr === 'inst-3' || lType === 'college' || nameStr.includes('college')) {
      enabledTiers = ['college']
    } else if (idStr === 'inst-4' || lType === 'university' || lType === 'undergraduate' || nameStr.includes('university')) {
      enabledTiers = ['undergraduate']
    } else if (idStr === 'inst-1' || lType === 'custom' || lType === 'hybrid') {
      enabledTiers = ['school', 'college']
    } else {
      enabledTiers = ['school']
    }
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
    classUnit: isUniversityOnly ? 'Degree Program' : isCollegeOnly ? 'Discipline' : 'Class',
    sectionUnit: isUniversityOnly ? 'Cohort / Batch' : isCollegeOnly ? 'Section / Group' : 'Section',
    teacherUnit: isUniversityOnly ? 'Professor' : isCollegeOnly ? 'Lecturer' : 'Class Teacher',
    exams: isUniversityOnly ? 'Semester Final Exams & GPA' : isCollegeOnly ? 'Board & College Annual Exams' : 'Term Examinations & Marks',
    certificates: isUniversityOnly ? 'Transcripts & Degree Attestation' : isCollegeOnly ? 'College Leaving (CLC) & Character' : 'School Leaving (SLC) & Character',
    curriculum: isUniversityOnly ? 'Degree Schemes & Courses' : isCollegeOnly ? 'Subject Streams & Syllabi' : 'Curriculum & Subjects',
    idLabel: isUniversityOnly ? 'Student Enrollment / Registration No' : isCollegeOnly ? 'College Roll Number' : 'Student Roll Number'
  }

  return {
    type: rawType,
    enabledTiers,
    allowedLevelIds: Array.from(allowedLevelsSet),
    portalTitle,
    roleBadge,
    portalTypeLabel,
    isSchool: hasSchool,
    isCollege: hasCollege,
    isUniversity: hasUniversity,
    isSchoolOnly,
    isCollegeOnly,
    isUniversityOnly,
    isMultiTier,
    hasSchool,
    hasCollege,
    hasUniversity,
    isLevelAllowed: (levelId) => {
      if (levelId === 'all') return true
      return allowedLevelsSet.has(levelId)
    },
    isWingAllowed: (wingId) => {
      if (wingId === 'all') return true
      if (wingId === 'school') return hasSchool
      if (wingId === 'college') return hasCollege
      if (wingId === 'undergraduate') return hasUniversity
      return false
    },
    terminology
  }
}
