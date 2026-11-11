/**
 * Central Feature Registry & Portal Resolver
 * Scoped strictly for School Management System (Pre-School, Elementary, Secondary K-10).
 */

import { COMMON_ROUTES, COMMON_TERMINOLOGY, COMMON_DASHBOARD_SHORTCUTS } from './common.features.js'
import { SCHOOL_FEATURES } from './school.features.js'

export const FEATURE_REGISTRY = {
  school: SCHOOL_FEATURES
}

/**
 * Helper to decorate the school feature profile with guard methods
 */
const decorateFeatureProfile = (config) => {
  return {
    ...config,
    isSchool: true,
    isSchoolOnly: true,
    isMultiTier: false,
    hasSchool: true,

    // Fast check for allowed level IDs
    isLevelAllowed: (levelId) => {
      if (!levelId || levelId === 'all') return true
      return config.allowedLevelIds.includes(levelId)
    },

    // Fast check for allowed wings
    isWingAllowed: (wingId) => {
      return !wingId || wingId === 'all' || wingId === 'school'
    },

    // Fast route guard
    isRouteAllowed: (route) => {
      if (!route) return false
      return config.allowedRoutes.includes(route)
    }
  }
}

/**
 * Resolves the active feature profile for any school campus.
 * @returns {Object} Complete school feature profile.
 */
export const getPortalFeatures = () => {
  return decorateFeatureProfile(SCHOOL_FEATURES)
}

/**
 * Helper to get list of allowed routes for a school
 */
export const getAllowedRoutes = () => {
  return SCHOOL_FEATURES.allowedRoutes || COMMON_ROUTES
}

export {
  COMMON_ROUTES,
  COMMON_TERMINOLOGY,
  COMMON_DASHBOARD_SHORTCUTS,
  SCHOOL_FEATURES
}
