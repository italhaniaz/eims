/**
 * Tier Gating & Dynamic Feature Scoping Engine
 * Enforces strict educational hierarchy scoping: School vs College vs University vs Composite
 * Now backed by the Central Feature Registry in `src/config/features/`
 */

import { getPortalFeatures, getAllowedRoutes } from '../config/features'

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

export { getPortalFeatures, getAllowedRoutes }

