/**
 * Central Feature Registry & Portal Resolver
 * Resolves full feature configuration, navigation layout, operational widgets,
 * terminology, and route guards based on Institute Tier & Subscription.
 */

import { COMMON_ROUTES, COMMON_TERMINOLOGY, COMMON_DASHBOARD_SHORTCUTS } from './common.features.js'
import { SCHOOL_FEATURES } from './school.features.js'
import { COLLEGE_FEATURES } from './college.features.js'
import { UNIVERSITY_FEATURES } from './university.features.js'
import { CUSTOM_FEATURES } from './custom.features.js'

export const FEATURE_REGISTRY = {
  school: SCHOOL_FEATURES,
  college: COLLEGE_FEATURES,
  university: UNIVERSITY_FEATURES,
  custom: CUSTOM_FEATURES
}

/**
 * Resolves the active feature profile for any institute.
 * @param {Object} institute - The current active institute object.
 * @returns {Object} Complete feature profile including navigation, sentinels, shortcuts, and route guards.
 */
export const getPortalFeatures = (institute) => {
  if (!institute) {
    return decorateFeatureProfile(SCHOOL_FEATURES)
  }

  const idStr = String(institute.id || '').toLowerCase()
  const codeStr = String(institute.code || institute.registrationCode || '').toLowerCase()
  const nameStr = String(institute.name || institute.instituteName || '').toLowerCase()
  const scopeStr = String(institute.scope || institute.roleTitle || '').toLowerCase()
  const rawType = String(institute.type || institute.planType || institute.instituteType || '').trim().toLowerCase()
  const tiersArr = Array.isArray(institute.tiers) ? institute.tiers.map(t => String(t).toLowerCase()) : []
  const enabledTiersArr = Array.isArray(institute.enabledTiers) ? institute.enabledTiers.map(t => String(t).toLowerCase()) : []

  let selectedTier = 'school'

  // 1. Explicit University Matcher
  if (
    rawType.includes('uni') ||
    rawType.includes('undergrad') ||
    rawType.includes('higher') ||
    rawType.includes('degree') ||
    idStr === 'inst-4' ||
    idStr.includes('ias') ||
    codeStr.includes('ias') ||
    codeStr.includes('uni') ||
    nameStr.includes('university') ||
    nameStr.includes('undergraduate') ||
    nameStr.includes('applied sciences') ||
    nameStr.includes('degree') ||
    scopeStr.includes('dean') ||
    scopeStr.includes('registrar') ||
    scopeStr.includes('rector') ||
    scopeStr.includes('hec') ||
    scopeStr.includes('controller') ||
    tiersArr.includes('undergraduate') ||
    tiersArr.includes('university') ||
    enabledTiersArr.includes('undergraduate') ||
    enabledTiersArr.includes('university')
  ) {
    selectedTier = 'university'
  }
  // 2. Explicit College Matcher
  else if (
    rawType.includes('college') ||
    rawType.includes('inter') ||
    rawType.includes('hssc') ||
    idStr === 'inst-3' ||
    idStr.includes('ria') ||
    codeStr.includes('ria') ||
    codeStr.includes('col') ||
    nameStr.includes('college') ||
    nameStr.includes('roots') ||
    nameStr.includes('intermediate') ||
    nameStr.includes('hssc') ||
    scopeStr.includes('college') ||
    scopeStr.includes('hod') ||
    scopeStr.includes('bise') ||
    scopeStr.includes('fbise') ||
    tiersArr.includes('college') ||
    enabledTiersArr.includes('college')
  ) {
    selectedTier = 'college'
  }
  // 3. Explicit Multi-Tier / Custom Matcher
  else if (
    rawType.includes('custom') ||
    rawType.includes('hybrid') ||
    rawType.includes('multi') ||
    rawType.includes('composite') ||
    idStr === 'inst-1' ||
    idStr.includes('bhs') ||
    codeStr.includes('bhs') ||
    nameStr.includes('composite') ||
    nameStr.includes('beaconhouse') ||
    (enabledTiersArr.length > 1) ||
    (tiersArr.length > 1)
  ) {
    selectedTier = 'custom'
  }
  // 4. Default to School
  else {
    selectedTier = 'school'
  }

  const baseConfig = FEATURE_REGISTRY[selectedTier] || SCHOOL_FEATURES
  return decorateFeatureProfile(baseConfig)
}

/**
 * Helper to decorate feature profile with boolean flags and guard methods
 */
const decorateFeatureProfile = (config) => {
  const isSchool = config.tier === 'school'
  const isCollege = config.tier === 'college'
  const isUniversity = config.tier === 'university'
  const isMultiTier = config.tier === 'custom'

  return {
    ...config,
    isSchool,
    isCollege,
    isUniversity,
    isMultiTier,
    isSchoolOnly: isSchool,
    isCollegeOnly: isCollege,
    isUniversityOnly: isUniversity,
    hasSchool: isSchool || isMultiTier,
    hasCollege: isCollege || isMultiTier,
    hasUniversity: isUniversity || isMultiTier,

    // Fast check for allowed level IDs
    isLevelAllowed: (levelId) => {
      if (!levelId || levelId === 'all') return isMultiTier
      return config.allowedLevelIds.includes(levelId)
    },

    // Fast check for allowed wings in top navbar
    isWingAllowed: (wingId) => {
      if (!wingId || wingId === 'all') return isMultiTier
      if (wingId === 'school') return isSchool || isMultiTier
      if (wingId === 'college') return isCollege || isMultiTier
      if (wingId === 'university') return isUniversity || isMultiTier
      return false
    },

    // Fast route guard
    isRouteAllowed: (route) => {
      if (!route) return false
      return config.allowedRoutes.includes(route)
    }
  }
}

/**
 * Helper to get list of allowed routes for an institute
 */
export const getAllowedRoutes = (institute) => {
  const features = getPortalFeatures(institute)
  return features.allowedRoutes || COMMON_ROUTES
}

export {
  COMMON_ROUTES,
  COMMON_TERMINOLOGY,
  COMMON_DASHBOARD_SHORTCUTS,
  SCHOOL_FEATURES,
  COLLEGE_FEATURES,
  UNIVERSITY_FEATURES,
  CUSTOM_FEATURES
}
