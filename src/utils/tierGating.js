/**
 * School Tier Gating & Class Sequencing Engine
 * Scoped strictly for School grades (Playgroup/Nursery/Prep/KG through Grade 1-10 / Matric / O-Levels).
 */

import { getPortalFeatures, getAllowedRoutes } from '../config/features/index.js'

export const TIER_LEVEL_MAP = {
  school: ['preschool', 'elementary', 'secondary']
}

/**
 * Resolves full school feature configuration and terminology.
 */
export const getInstituteTierConfig = (institute) => {
  return getPortalFeatures(institute)
}

/**
 * Resolves normalized tier key ('school')
 */
export const resolveInstituteTier = () => {
  return 'school'
}

/**
 * Validates that a class name belongs to the School grade range (Playgroup-KG, Grade 1-10, Matric, O-Levels).
 */
export const isClassAllowedForTier = (className = '') => {
  if (!className) return false
  const norm = String(className).toLowerCase().trim()

  // Early Childhood Education
  if (
    norm.includes('nursery') || norm.includes('prep') || norm.includes('kg') ||
    norm.includes('kindergarten') || norm.includes('playgroup') || norm.includes('montessori')
  ) {
    return true
  }

  // Number extraction for School: Grade/Class 1 through 10
  const numMatch = norm.match(/\b([1-9]|10)(st|nd|rd|th)?\b/)
  if (numMatch) {
    const gradeNum = parseInt(numMatch[1], 10)
    if (gradeNum >= 1 && gradeNum <= 10) {
      return true
    }
  }

  return (
    norm.includes('grade') || norm.includes('class') || norm.includes('matric') ||
    norm.includes('primary') || norm.includes('middle') || norm.includes('secondary') ||
    norm.includes('o-level') || norm.includes('o level') || norm.includes('ssc')
  )
}

/**
 * Calculates a precise numeric sort rank for natural class sequencing (Playgroup -> Nursery -> Prep -> KG -> Grade 1..10).
 */
export const calculateClassSortRank = (className = '') => {
  const norm = String(className || '').toLowerCase().trim()

  if (norm.includes('playgroup')) return 0.1
  if (norm.includes('nursery')) return 0.2
  if (norm.includes('prep')) return 0.3
  if (norm.includes('kg') || norm.includes('kindergarten')) return 0.4

  const numMatch = norm.match(/\b([1-9]|10)(st|nd|rd|th)?\b/)
  if (numMatch) {
    return parseInt(numMatch[1], 10)
  }

  const anyNum = norm.match(/\d+/)
  return anyNum ? parseInt(anyNum[0], 10) : 50
}

/**
 * Filters classes for a school campus and sorts them naturally from Playgroup to Grade 10.
 */
export const filterClassesByInstituteTier = (classes = [], institute = null) => {
  if (!Array.isArray(classes)) return []
  const instId = institute?.id

  return classes
    .filter(c => {
      if (!c || !c.name) return false
      if (c.instituteId && instId && c.instituteId !== instId) {
        return false
      }
      return isClassAllowedForTier(c.name)
    })
    .sort((a, b) => {
      const rankA = calculateClassSortRank(a.name)
      const rankB = calculateClassSortRank(b.name)
      if (rankA !== rankB) return rankA - rankB
      return a.name.localeCompare(b.name)
    })
}

/**
 * Returns distinct, sorted class name strings for dropdowns, filters, and forms.
 */
export const getDistinctInstituteClassNames = (classes = [], students = [], institute = null) => {
  const set = new Set()
  const instId = institute?.id

  if (Array.isArray(classes)) {
    classes.forEach(c => {
      if (!c || !c.name) return
      if (c.instituteId && instId && c.instituteId !== instId) return
      if (isClassAllowedForTier(c.name)) {
        set.add(c.name.trim())
      }
    })
  }

  if (Array.isArray(students)) {
    students.forEach(s => {
      if (!s || !s.className) return
      if (s.instituteId && instId && s.instituteId !== instId) return
      if (isClassAllowedForTier(s.className)) {
        set.add(s.className.trim())
      }
    })
  }

  return Array.from(set).sort((a, b) => {
    const rankA = calculateClassSortRank(a)
    const rankB = calculateClassSortRank(b)
    if (rankA !== rankB) return rankA - rankB
    return a.localeCompare(b)
  })
}

export { getPortalFeatures, getAllowedRoutes }
