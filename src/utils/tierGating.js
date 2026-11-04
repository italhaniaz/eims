/**
 * Tier Gating & Dynamic Feature Scoping Engine
 * Enforces strict educational hierarchy scoping: School vs College vs University vs Composite
 * Now backed by the Central Feature Registry in `src/config/features/`
 */

import { getPortalFeatures, getAllowedRoutes } from '../config/features/index.js'

export const TIER_LEVEL_MAP = {
  school: ['preschool', 'elementary', 'secondary'],
  college: ['higher-secondary', 'college'],
  undergraduate: ['university'],
  university: ['university']
}

/**
 * Resolves full tier configuration, allowed levels, allowed wings, UI terminology,
 * and feature profiles for any given institute object.
 */
export const getInstituteTierConfig = (institute) => {
  return getPortalFeatures(institute)
}

/**
 * Extracts and normalizes tier key ('school' | 'college' | 'university' | 'custom')
 */
export const resolveInstituteTier = (institute) => {
  if (!institute) return 'school'
  const config = getPortalFeatures(institute)
  return config.tier || 'school'
}

/**
 * Determines whether a given class name is strictly allowed for the specified institute tier.
 * School: Strictly Grade 1 to Grade 10 (and preschool/nursery/prep if registered).
 * College: Strictly Intermediate (11th, 12th, F.Sc, ICS, I.Com, FA) and Associate Degrees (ADP).
 * University: Strictly Degree Programs & Semesters (BS, BBA, MS, MBA, Semesters 1-8).
 */
export const isClassAllowedForTier = (className = '', institute = null) => {
  if (!className) return false
  const norm = String(className).toLowerCase().trim()
  const tier = resolveInstituteTier(institute)

  // Composite / Multi-tier institutes (e.g. Beaconhouse Central) permit all enrolled levels
  if (tier === 'custom') {
    return true
  }

  // --- 1. SCHOOL TIER ENFORCEMENT ---
  if (tier === 'school') {
    // Strictly REJECT college intermediate & associate degrees
    const hasCollegeKeyword = 
      norm.includes('f.sc') || norm.includes('fsc') || 
      norm.includes('ics') || norm.includes('i.com') || norm.includes('icom') ||
      norm.includes('fa ') || norm.includes('hssc') || norm.includes('intermediate') ||
      norm.includes('11th') || norm.includes('12th') ||
      norm.includes('1st year') || norm.includes('2nd year') ||
      norm.includes('a-level') || norm.includes('a level') ||
      norm.includes('adp') || norm.includes('associate') || norm.includes('dae')
    if (hasCollegeKeyword) return false

    // Strictly REJECT university degree programs & semesters
    const hasUniversityKeyword =
      norm.includes('bs ') || norm.includes('bs-') || norm.includes('bscs') ||
      norm.includes('bsse') || norm.includes('bsai') || norm.includes('bsds') ||
      norm.includes('bsit') || norm.includes('bba') || norm.includes('ms ') ||
      norm.includes('ms-') || norm.includes('mscs') || norm.includes('mba') ||
      norm.includes('mphil') || norm.includes('phd') || norm.includes('semester') ||
      norm.includes('bachelor') || norm.includes('master') || norm.includes('undergraduate')
    if (hasUniversityKeyword) return false

    // Early Childhood Education
    if (
      norm.includes('nursery') || norm.includes('prep') || norm.includes('kg') ||
      norm.includes('kindergarten') || norm.includes('playgroup') || norm.includes('montessori')
    ) {
      return true
    }

    // Number extraction for School: Must be Grade/Class 1 through 10
    const numMatch = norm.match(/\b([1-9]|10)(st|nd|rd|th)?\b/)
    if (numMatch) {
      const gradeNum = parseInt(numMatch[1], 10)
      if (gradeNum >= 1 && gradeNum <= 10) {
        return (
          norm.includes('grade') || norm.includes('class') || 
          norm.includes('matric') || norm.includes('middle') ||
          norm.includes('primary') || norm.includes('o-level') ||
          norm.includes('o level') || norm.includes('ssc') ||
          norm.startsWith('grade') || norm.startsWith('class') ||
          /\b([1-9]|10)(st|nd|rd|th)\s+grade\b/.test(norm)
        )
      }
    }

    // General fallback for elementary/secondary keywords
    return norm.includes('grade') || norm.includes('class') || norm.includes('matric')
  }

  // --- 2. COLLEGE TIER ENFORCEMENT ---
  if (tier === 'college') {
    // Strictly REJECT school primary/middle/matric grades 1 to 10
    const isSchoolGrade = 
      /\b([1-9]|10)(st|nd|rd|th)?\s*(grade|class)\b/.test(norm) ||
      /\b(grade|class)\s*([1-9]|10)\b/.test(norm) ||
      norm.includes('primary') || norm.includes('middle') ||
      norm.includes('nursery') || norm.includes('playgroup') || norm.includes('prep')
    if (isSchoolGrade) return false

    // Strictly REJECT advanced university BS semester 5-8 / MS degrees
    if (
      norm.includes('semester 3') || norm.includes('semester 4') ||
      norm.includes('semester 5') || norm.includes('semester 6') ||
      norm.includes('semester 7') || norm.includes('semester 8') ||
      norm.includes('ms ') || norm.includes('mscs') || norm.includes('mba') ||
      norm.includes('mphil') || norm.includes('phd')
    ) {
      return false
    }

    // ALLOW intermediate & college keywords
    const isCollegeProgram =
      norm.includes('11th') || norm.includes('12th') ||
      norm.includes('1st year') || norm.includes('2nd year') ||
      norm.includes('f.sc') || norm.includes('fsc') ||
      norm.includes('ics') || norm.includes('i.com') || norm.includes('icom') ||
      norm.includes('fa ') || norm.includes('hssc') || norm.includes('intermediate') ||
      norm.includes('a-level') || norm.includes('a level') ||
      norm.includes('adp') || norm.includes('associate') || norm.includes('dae')
    return isCollegeProgram
  }

  // --- 3. UNIVERSITY TIER ENFORCEMENT ---
  if (tier === 'university') {
    // Strictly REJECT school grades 1 to 10
    const isSchoolGrade =
      /\b([1-9]|10)(st|nd|rd|th)?\s*(grade|class)\b/.test(norm) ||
      /\b(grade|class)\s*([1-9]|10)\b/.test(norm) ||
      norm.includes('primary') || norm.includes('middle') || norm.includes('matric') ||
      norm.includes('nursery') || norm.includes('playgroup') || norm.includes('prep')
    if (isSchoolGrade) return false

    // Strictly REJECT intermediate college classes
    const isIntermediate =
      norm.includes('f.sc') || norm.includes('fsc') ||
      norm.includes('11th') || norm.includes('12th') ||
      norm.includes('1st year') || norm.includes('2nd year') ||
      norm.includes('hssc') || norm.includes('matric')
    if (isIntermediate) return false

    // ALLOW University programs & semesters
    return (
      norm.includes('bs') || norm.includes('bachelor') ||
      norm.includes('semester') || norm.includes('bba') ||
      norm.includes('ms') || norm.includes('master') ||
      norm.includes('mba') || norm.includes('mphil') ||
      norm.includes('phd') || norm.includes('undergraduate') ||
      norm.includes('cohort')
    )
  }

  return true
}

/**
 * Calculates a precise numeric sort rank for natural class sequencing.
 * Guarantees Grade 1 to Grade 10 order for School without alphabetic distortion (1, 2, ..., 9, 10).
 */
export const calculateClassSortRank = (className = '', institute = null) => {
  const norm = String(className || '').toLowerCase().trim()
  const tier = resolveInstituteTier(institute)

  if (tier === 'school') {
    if (norm.includes('playgroup')) return 0.1
    if (norm.includes('nursery')) return 0.2
    if (norm.includes('prep')) return 0.3
    if (norm.includes('kg') || norm.includes('kindergarten')) return 0.4

    // Extract exact grade number (1 to 10)
    const numMatch = norm.match(/\b([1-9]|10)(st|nd|rd|th)?\b/)
    if (numMatch) {
      return parseInt(numMatch[1], 10)
    }
    return 50
  }

  if (tier === 'college') {
    let base = 100
    if (norm.includes('11th') || norm.includes('1st year') || norm.includes('part i') || norm.includes('part 1')) {
      base = 110
    } else if (norm.includes('12th') || norm.includes('2nd year') || norm.includes('part ii') || norm.includes('part 2')) {
      base = 120
    } else if (norm.includes('adp') || norm.includes('associate')) {
      base = 130
    }

    if (norm.includes('pre-med')) return base + 1
    if (norm.includes('pre-eng')) return base + 2
    if (norm.includes('ics')) return base + 3
    if (norm.includes('i.com') || norm.includes('icom')) return base + 4
    if (norm.includes('fa')) return base + 5
    return base + 9
  }

  if (tier === 'university') {
    const semMatch = norm.match(/semester\s*(\d+)/i)
    if (semMatch) {
      return 200 + parseInt(semMatch[1], 10)
    }
    if (norm.includes('bs')) return 201
    if (norm.includes('bba')) return 210
    if (norm.includes('ms') || norm.includes('master') || norm.includes('mba')) return 250
    return 290
  }

  // Fallback natural sort
  const anyNum = norm.match(/\d+/)
  return anyNum ? parseInt(anyNum[0], 10) : 500
}

/**
 * Filters a raw classes collection for a given institute and ensures:
 * 1. Campus scoping (belongs to institute or matching tier)
 * 2. Strict educational tier enforcement (School = Grade 1-10 only)
 * 3. Natural numeric sequence sorting (1, 2, ..., 9, 10)
 */
export const filterClassesByInstituteTier = (classes = [], institute = null) => {
  if (!Array.isArray(classes)) return []
  const instId = institute?.id

  return classes
    .filter(c => {
      if (!c || !c.name) return false
      // Campus isolation: If class has instituteId and it belongs to another institute, reject
      if (c.instituteId && instId && c.instituteId !== instId) {
        return false
      }
      // Strict Tier validation
      return isClassAllowedForTier(c.name, institute)
    })
    .sort((a, b) => {
      const rankA = calculateClassSortRank(a.name, institute)
      const rankB = calculateClassSortRank(b.name, institute)
      if (rankA !== rankB) return rankA - rankB
      return a.name.localeCompare(b.name)
    })
}

/**
 * Returns distinct, sorted class name strings for dropdowns, filters, and forms.
 * Aggregates both configured classes and active students, with strict tier and campus gating.
 */
export const getDistinctInstituteClassNames = (classes = [], students = [], institute = null) => {
  const set = new Set()
  const instId = institute?.id

  // 1. Collect from classes table
  if (Array.isArray(classes)) {
    classes.forEach(c => {
      if (!c || !c.name) return
      if (c.instituteId && instId && c.instituteId !== instId) return
      if (isClassAllowedForTier(c.name, institute)) {
        set.add(c.name.trim())
      }
    })
  }

  // 2. Collect from students directory
  if (Array.isArray(students)) {
    students.forEach(s => {
      if (!s || !s.className) return
      if (s.instituteId && instId && s.instituteId !== instId) return
      if (isClassAllowedForTier(s.className, institute)) {
        set.add(s.className.trim())
      }
    })
  }

  // Sort by natural numeric tier rank
  return Array.from(set).sort((a, b) => {
    const rankA = calculateClassSortRank(a, institute)
    const rankB = calculateClassSortRank(b, institute)
    if (rankA !== rankB) return rankA - rankB
    return a.localeCompare(b)
  })
}

export { getPortalFeatures, getAllowedRoutes }
