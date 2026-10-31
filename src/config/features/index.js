/**
 * Central Feature Registry & Portal Resolver
 * Resolves full feature configuration, navigation layout, operational widgets,
 * terminology, and route guards based on Institute Tier & Subscription.
 */

import { COMMON_ROUTES, COMMON_TERMINOLOGY, COMMON_DASHBOARD_SHORTCUTS } from './common.features'
import { SCHOOL_FEATURES } from './school.features'
import { COLLEGE_FEATURES } from './college.features'
import { UNIVERSITY_FEATURES } from './university.features'
import { CUSTOM_FEATURES } from './custom.features'

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
  const nameStr = String(institute.name || institute.instituteName || '').toLowerCase()
  const scopeStr = String(institute.scope || institute.roleTitle || '').toLowerCase()
  const rawType = String(institute.type || institute.planType || institute.instituteType || '').trim().toLowerCase()

  let selectedTier = 'school'

  if (
    rawType === 'college' || 
    idStr === 'inst-3' || 
    nameStr.includes('college') || 
    scopeStr.includes('college')
  ) {
    selectedTier = 'college'
  } else if (
    rawType === 'university' || 
    rawType === 'undergraduate' || 
    idStr === 'inst-4' || 
    nameStr.includes('university') || 
    scopeStr.includes('dean') || 
    scopeStr.includes('registrar')
  ) {
    selectedTier = 'university'
  } else if (
    rawType === 'custom' || 
    rawType === 'hybrid' || 
    idStr === 'inst-1' || 
    nameStr.includes('composite') || 
    nameStr.includes('beaconhouse')
  ) {
    selectedTier = 'custom'
  } else {
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
