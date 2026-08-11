// packages/utils/src/matching.ts
// Matching Algorithm for BukieBrainJobs
// Based on TECHNICAL_SPEC.md Section 13

import type { Job } from '@bukiebrainjobs/api-types'
import type { TaskerProfile, TaskerSkill } from '@bukiebrainjobs/api-types'

// Local type for Job skills since JobSkill is not in api-types yet
type JobSkill = {
  id: string
  skillId: string
  name: string
  required?: boolean
  niceToHave?: boolean
}

function toNum(val: number | { toNumber(): number } | null | undefined): number {
  if (val === null || val === undefined) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'object' && typeof (val as { toNumber?: unknown }).toNumber === 'function') {
    return (val as { toNumber(): number }).toNumber()
  }
  return Number(val) || 0
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Weights for different matching factors (sum to 100%)
const MATCHING_WEIGHTS = {
  // Location: Proximity to job location (30%)
  LOCATION_PROXIMITY: 0.30,
  
  // Skills: How well Tasker's skills match job requirements (25%)
  SKILL_MATCH: 0.25,
  
  // Availability: Is Tasker available and within working hours (20%)
  AVAILABILITY: 0.20,
  
  // Experience: Years of experience (10%)
  EXPERIENCE: 0.10,
  
  // Rating: Tasker's average rating (10%)
  RATING: 0.10,
  
  // Response rate: How quickly Tasker responds to invitations (5%)
  RESPONSE_RATE: 0.05,
}

// Distance thresholds (in km)
const DISTANCE_THRESHOLDS = {
  IDEAL: 5,      // Ideal distance
  GOOD: 15,      // Good distance
  ACCEPTABLE: 30, // Acceptable distance
  MAX: 100,      // Maximum distance for matching
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MatchingCandidate {
  taskerProfile: TaskerProfile & {
    user: {
      id: string
      firstName: string
      lastName: string
      phone: string
      avatarUrl?: string
      latitude?: number
      longitude?: number
    }
    skills: TaskerSkill[]
  }
  score: number
  distanceKm: number
  matchingSkills: string[]
  missingSkills: string[]
}

interface MatchingResult {
  candidates: MatchingCandidate[]
  topMatch: MatchingCandidate | null
  totalCandidates: number
}

interface MatchingOptions {
  maxDistanceKm?: number
  minRating?: number
  requiredSkills?: string[]
  limit?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Haversine Distance Calculation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * 
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Location Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate location score based on distance
 * @param distanceKm Distance in kilometers
 * @returns Score from 0 to 100
 */
function calculateLocationScore(distanceKm: number): number {
  if (distanceKm <= DISTANCE_THRESHOLDS.IDEAL) {
    return 100
  } else if (distanceKm <= DISTANCE_THRESHOLDS.GOOD) {
    // Linear interpolation between IDEAL and GOOD
    return 100 - ((distanceKm - DISTANCE_THRESHOLDS.IDEAL) / 
                (DISTANCE_THRESHOLDS.GOOD - DISTANCE_THRESHOLDS.IDEAL)) * 20
  } else if (distanceKm <= DISTANCE_THRESHOLDS.ACCEPTABLE) {
    // Linear interpolation between GOOD and ACCEPTABLE
    return 80 - ((distanceKm - DISTANCE_THRESHOLDS.GOOD) / 
               (DISTANCE_THRESHOLDS.ACCEPTABLE - DISTANCE_THRESHOLDS.GOOD)) * 40
  } else if (distanceKm <= DISTANCE_THRESHOLDS.MAX) {
    // Linear interpolation between ACCEPTABLE and MAX
    return 40 - ((distanceKm - DISTANCE_THRESHOLDS.ACCEPTABLE) / 
               (DISTANCE_THRESHOLDS.MAX - DISTANCE_THRESHOLDS.ACCEPTABLE)) * 40
  } else {
    return 0
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Skills Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate skills match score
 * @param jobSkills Skills required for the job
 * @param taskerSkills Skills possessed by the Tasker
 * @returns Score from 0 to 100, and arrays of matching/missing skills
 */
function calculateSkillsScore(
  jobSkills: JobSkill[],
  taskerSkills: TaskerSkill[]
): { score: number; matchingSkills: string[]; missingSkills: string[] } {
  const requiredSkillIds = new Set(jobSkills.map(js => js.skillId))
  const taskerSkillIds = new Set(taskerSkills.map(bws => bws.skillId))
  
  // Count matching skills
  const matchingSkillIds = [...requiredSkillIds].filter(skillId => 
    taskerSkillIds.has(skillId)
  )
  
  const matchingSkills = jobSkills
    .filter(js => matchingSkillIds.includes(js.skillId))
    .map(js => js.skillId)
  
  const missingSkills = jobSkills
    .filter(js => !taskerSkillIds.has(js.skillId))
    .map(js => js.skillId)
  
  // Calculate score based on percentage of required skills matched
  const matchPercentage = (matchingSkills.length / requiredSkillIds.size) * 100
  
  // If all skills match, give perfect score
  if (matchingSkills.length === requiredSkillIds.size) {
    return { score: 100, matchingSkills, missingSkills }
  }
  
  // If at least 75% match, scale from 75-99
  if (matchPercentage >= 75) {
    return { 
      score: 75 + (matchPercentage - 75), 
      matchingSkills, 
      missingSkills 
    }
  }
  
  // If at least 50% match, scale from 50-74
  if (matchPercentage >= 50) {
    return { 
      score: 50 + (matchPercentage - 50) * 0.95, 
      matchingSkills, 
      missingSkills 
    }
  }
  
  // Below 50% match, scale from 0-49
  return { 
    score: matchPercentage * 0.9, 
    matchingSkills, 
    missingSkills 
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Availability Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate availability score
 * @param isAvailable Whether Tasker is available
 * @param scheduledStartAt Job scheduled start time
 * @param workingHoursStart Tasker's working hours start
 * @param workingHoursEnd Tasker's working hours end
 * @returns Score from 0 to 100
 */
function calculateAvailabilityScore(
  isAvailable: boolean,
  scheduledStartAt: Date,
  workingHoursStart: number,
  workingHoursEnd: number
): number {
  if (!isAvailable) {
    return 0
  }
  
  const startHour = scheduledStartAt.getHours()
  
  // Check if job is within working hours
  if (startHour >= workingHoursStart && startHour < workingHoursEnd) {
    return 100
  }
  
  // If job is 1-2 hours outside working hours
  if (startHour >= workingHoursStart - 2 && startHour <= workingHoursEnd + 2) {
    return 70
  }
  
  // If job is 3-4 hours outside working hours
  if (startHour >= workingHoursStart - 4 && startHour <= workingHoursEnd + 4) {
    return 40
  }
  
  // Job is too far outside working hours
  return 10
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Experience Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate experience score based on years of experience
 * @param yearsExperience Years of experience
 * @returns Score from 0 to 100
 */
function calculateExperienceScore(yearsExperience: number): number {
  // Cap at 20 years
  const cappedYears = Math.min(yearsExperience, 20)
  
  // Linear scale: 0 years = 0, 1 year = 20, 2 years = 40, ..., 5+ years = 100
  if (cappedYears >= 5) {
    return 100
  }
  return cappedYears * 20
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rating Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate rating score
 * @param averageRating Average rating (0-5)
 * @param totalReviews Total number of reviews
 * @returns Score from 0 to 100
 */
function calculateRatingScore(averageRating: number, totalReviews: number): number {
  if (totalReviews === 0) {
    // No reviews yet, give neutral score
    return 50
  }
  
  // Scale rating to 0-100 and boost based on number of reviews
  const baseScore = (averageRating / 5) * 100
  
  // Review count boost (up to 10% bonus for many reviews)
  const reviewBoost = Math.min(totalReviews / 10, 10)
  
  return Math.min(baseScore + reviewBoost, 100)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Response Rate Scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate response rate score
 * @param responseRate Response rate (0-1)
 * @returns Score from 0 to 100
 */
function calculateResponseRateScore(responseRate: number): number {
  return responseRate * 100
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Matching Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate overall match score for a Tasker against a job
 */
function calculateMatchScore(
  job: Job & { skills: JobSkill[] },
  candidate: TaskerProfile & { 
    user: { id: string; firstName: string; lastName: string; phone: string; avatarUrl?: string }
    skills: TaskerSkill[]
  },
  jobLocation: { lat: number; lng: number }
): MatchingCandidate {
  // Calculate distance
  const distanceKm = haversineDistance(
    jobLocation.lat,
    jobLocation.lng,
    toNum(candidate.user.latitude),
    toNum(candidate.user.longitude)
  )
  
  // Calculate individual scores
  const locationScore = calculateLocationScore(distanceKm)
  const { score: skillsScore, matchingSkills, missingSkills } = calculateSkillsScore(
    job.skills,
    candidate.skills
  )
  const availabilityScore = calculateAvailabilityScore(
    candidate.isAvailable,
    new Date(job.scheduledStartAt),
    candidate.workingHoursStart,
    candidate.workingHoursEnd
  )
  const experienceScore = calculateExperienceScore(candidate.yearsExperience)
  const ratingScore = calculateRatingScore(
    toNum(candidate.averageRating),
    candidate.totalReviews || 0
  )
  const responseRateScore = calculateResponseRateScore(
    toNum(candidate.responseRate)
  )
  
  // Calculate weighted score
  const score = 
    (locationScore * MATCHING_WEIGHTS.LOCATION_PROXIMITY) +
    (skillsScore * MATCHING_WEIGHTS.SKILL_MATCH) +
    (availabilityScore * MATCHING_WEIGHTS.AVAILABILITY) +
    (experienceScore * MATCHING_WEIGHTS.EXPERIENCE) +
    (ratingScore * MATCHING_WEIGHTS.RATING) +
    (responseRateScore * MATCHING_WEIGHTS.RESPONSE_RATE)
  
  return {
    taskerProfile: candidate,
    score,
    distanceKm,
    matchingSkills,
    missingSkills,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Find matching Taskers for a job
 * @param job The job to find matches for
 * @param candidates List of Tasker profiles to consider
 * @param options Matching options
 * @returns Matching result with ranked candidates
 */
export function findMatches(
  job: Job & { skills: JobSkill[] },
  candidates: Array<TaskerProfile & {
    user: { id: string; firstName: string; lastName: string; phone: string; avatarUrl?: string }
    skills: TaskerSkill[]
  }>,
  options: MatchingOptions = {}
): MatchingResult {
  const {
    maxDistanceKm = DISTANCE_THRESHOLDS.MAX,
    minRating = 0,
    requiredSkills = [],
    limit = 10,
  } = options
  
  // Filter candidates by basic criteria
  const filteredCandidates = candidates.filter(candidate => {
    // Check minimum rating
    if (toNum(candidate.averageRating) < minRating) {
      return false
    }
    
    // Check distance limit
    const distanceKm = haversineDistance(
      toNum(job.latitude),
      toNum(job.longitude),
      toNum(candidate.user.latitude),
      toNum(candidate.user.longitude)
    )
    if (distanceKm > maxDistanceKm) {
      return false
    }
    
    // Check required skills
    if (requiredSkills.length > 0) {
      const candidateSkillIds = candidate.skills.map(s => s.skillId)
      const hasRequiredSkills = requiredSkills.every(skillId => 
        candidateSkillIds.includes(skillId)
      )
      if (!hasRequiredSkills) {
        return false
      }
    }
    
    // Check availability
    if (!candidate.isAvailable) {
      return false
    }
    
    return true
  })
  
  // Calculate scores for each candidate
  const scoredCandidates = filteredCandidates.map(candidate =>
    calculateMatchScore(job, candidate, {
      lat: toNum(job.latitude),
      lng: toNum(job.longitude),
    })
  )
  
  // Sort by score (descending)
  const sortedCandidates = scoredCandidates.sort((a, b) => b.score - a.score)
  
  // Apply limit
  const resultCandidates = sortedCandidates.slice(0, limit)
  
  return {
    candidates: resultCandidates,
    topMatch: resultCandidates[0] || null,
    totalCandidates: filteredCandidates.length,
  }
}

/**
 * Score a single candidate for a job (for testing)
 */
export function scoreCandidate(
  job: Job & { skills: JobSkill[] },
  candidate: TaskerProfile & {
    user: { id: string; firstName: string; lastName: string; phone: string; avatarUrl?: string }
    skills: TaskerSkill[]
  }
): MatchingCandidate {
  return calculateMatchScore(job, candidate, {
    lat: toNum(job.latitude),
    lng: toNum(job.longitude),
  })
}

/**
 * Simple version for matching without full data
 */
export function simpleMatch(
  jobLat: number,
  jobLng: number,
  candidateLat: number,
  candidateLng: number,
  candidateRating: number = 0,
  candidateAvailable: boolean = true
): number {
  const distanceKm = haversineDistance(jobLat, jobLng, candidateLat, candidateLng)
  const locationScore = calculateLocationScore(distanceKm)
  const availabilityScore = candidateAvailable ? 100 : 0
  const ratingScore = calculateRatingScore(candidateRating, 0)
  
  // Simplified scoring for quick matching
  return (
    locationScore * 0.5 + 
    availabilityScore * 0.3 + 
    ratingScore * 0.2
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  MATCHING_WEIGHTS,
  DISTANCE_THRESHOLDS,
  haversineDistance,
  calculateLocationScore,
  calculateSkillsScore,
  calculateAvailabilityScore,
  calculateExperienceScore,
  calculateRatingScore,
  calculateResponseRateScore,
}

export type { MatchingCandidate, MatchingResult, MatchingOptions }