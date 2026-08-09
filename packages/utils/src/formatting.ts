// packages/utils/src/formatting.ts
// Formatting Utility Functions for BukieBrainJobs

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Date & Time Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format date for display
 * @param date Date to format
 * @param style Formatting style
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  style: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const options: Intl.DateTimeFormatOptions = {}
  
  switch (style) {
    case 'short':
      options.dateStyle = 'short'
      break
    case 'medium':
      options.dateStyle = 'medium'
      break
    case 'long':
      options.dateStyle = 'long'
      break
    case 'full':
      options.dateStyle = 'full'
      break
  }
  
  return new Intl.DateTimeFormat('en-NG', options).format(dateObj)
}

/**
 * Format time for display
 * @param date Date to format
 * @param style Formatting style
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  style: 'short' | 'medium' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const options: Intl.DateTimeFormatOptions = {}
  
  switch (style) {
    case 'short':
      options.timeStyle = 'short'
      break
    case 'medium':
      options.timeStyle = 'medium'
      break
  }
  
  return new Intl.DateTimeFormat('en-NG', options).format(dateObj)
}

/**
 * Format date and time together
 * @param date Date to format
 * @param dateStyle Date formatting style
 * @param timeStyle Time formatting style
 * @returns Formatted date-time string
 */
export function formatDateTime(
  date: Date | string,
  dateStyle: 'short' | 'medium' | 'long' = 'short',
  timeStyle: 'short' | 'medium' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle,
    timeStyle,
    hour12: true,
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date Date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w ago`
  } else if (diffMonths < 12) {
    return `${diffMonths}mo ago`
  } else {
    return `${diffYears}y ago`
  }
}

/**
 * Format duration in hours and minutes
 * @param durationHours Duration in hours (can be decimal)
 * @returns Formatted duration string (e.g., "2h 30m" or "3h")
 */
export function formatDuration(durationHours: number): string {
  const hours = Math.floor(durationHours)
  const minutes = Math.round((durationHours - hours) * 60)
  
  if (hours === 0) {
    return `${minutes}m`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${minutes}m`
  }
}

/**
 * Format time until a future date
 * @param futureDate Future date to count down to
 * @returns Formatted time until string
 */
export function formatTimeUntil(futureDate: Date | string): string {
  const dateObj = typeof futureDate === 'string' ? new Date(futureDate) : futureDate
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return 'Starting now'
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 60) {
    return `Starting in ${diffMinutes}m`
  } else if (diffHours < 24) {
    return `Starting in ${diffHours}h`
  } else if (diffDays < 7) {
    return `Starting in ${diffDays}d`
  } else {
    return `Starting on ${formatDate(dateObj, 'short')}`
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Distance Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @param precision Number of decimal places
 * @returns Formatted distance string
 */
export function formatDistance(
  distanceKm: number,
  precision: number = 1
): string {
  if (distanceKm < 1) {
    const distanceM = Math.round(distanceKm * 1000)
    return `${distanceM}m`
  } else if (distanceKm < 100) {
    return `${distanceKm.toFixed(precision)}km`
  } else {
    return `>${Math.floor(distanceKm)}km`
  }
}

/**
 * Format distance with full text
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string with full text
 */
export function formatDistanceFull(distanceKm: number): string {
  if (distanceKm < 1) {
    const distanceM = Math.round(distanceKm * 1000)
    return distanceM === 1 ? '1 meter away' : `${distanceM} meters away`
  } else {
    return distanceKm === 1 
      ? '1 km away' 
      : `${distanceKm.toFixed(1)} km away`
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rating Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format rating for display
 * @param rating Rating (0-5)
 * @param showDecimal Whether to show decimal places
 * @returns Formatted rating string
 */
export function formatRating(rating: number, showDecimal: boolean = true): string {
  if (rating === 0) {
    return 'No ratings yet'
  }
  
  return showDecimal ? rating.toFixed(1) : Math.round(rating).toString()
}

/**
 * Generate star rating array for UI display
 * @param rating Rating (0-5)
 * @param maxStars Maximum number of stars (default 5)
 * @returns Array of star objects with fill status
 */
export function generateStarRating(
  rating: number,
  maxStars: number = 5
): Array<{ filled: boolean; halfFilled: boolean; empty: boolean }> {
  const stars: Array<{ filled: boolean; halfFilled: boolean; empty: boolean }> = []
  
  for (let i = 1; i <= maxStars; i++) {
    const starValue = i
    const fillLevel = rating - (i - 1)
    
    if (fillLevel >= 1) {
      stars.push({ filled: true, halfFilled: false, empty: false })
    } else if (fillLevel >= 0.5) {
      stars.push({ filled: false, halfFilled: true, empty: false })
    } else {
      stars.push({ filled: false, halfFilled: false, empty: true })
    }
  }
  
  return stars
}

/**
 * Format rating with stars
 * @param rating Rating (0-5)
 * @returns Star string (e.g., "★★★★☆")
 */
export function formatStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return (
    '★'.repeat(fullStars) +
    (hasHalfStar ? '½' : '') +
    '☆'.repeat(emptyStars)
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Number Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format large numbers with abbreviations
 * @param num Number to format
 * @returns Formatted string (e.g., "1.5K", "2M", "1B")
 */
export function formatNumberShort(num: number): string {
  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B'
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format number with commas
 * @param num Number to format
 * @returns Formatted string with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Format percentage
 * @param value Value (0-1)
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return (value * 100).toFixed(decimals) + '%'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phone Number Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format Nigerian phone number for display
 * @param phone Phone number (e.g., +2348012345678)
 * @returns Formatted phone number (e.g., "080 1234 5678")
 */
export function formatNigerianPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If it starts with 234 (Nigeria country code), convert to local format
  if (digits.startsWith('234')) {
    const localNumber = digits.slice(3)
    return formatPhoneNumber(localNumber)
  }
  
  // If it starts with +234, convert to local format
  if (phone.startsWith('+234')) {
    const localNumber = phone.slice(4)
    return formatPhoneNumber(localNumber)
  }
  
  // If it starts with 0, format as local number
  if (digits.startsWith('0')) {
    return formatPhoneNumber(digits)
  }
  
  return phone
}

/**
 * Format phone number with proper grouping
 * @param phone Phone number digits
 * @returns Formatted phone number
 */
function formatPhoneNumber(phone: string): string {
  // Nigerian phone numbers are typically 11 digits
  if (phone.length === 11 && phone.startsWith('0')) {
    // Format as 0XXX XXX XXXX
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`
  } else if (phone.length === 10) {
    // Format as XXX XXX XXXX
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
  }
  return phone
}

/**
 * Mask phone number for privacy (show last 4 digits)
 * @param phone Phone number to mask
 * @returns Masked phone number (e.g., "+234***5678")
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length < 4) {
    return phone
  }
  
  const last4 = phone.slice(-4)
  const masked = '*'.repeat(phone.length - 4)
  
  return phone.startsWith('+234') 
    ? `+234${masked}${last4}`
    : `${masked}${last4}`
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Name Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format user name for display
 * @param firstName First name
 * @param lastName Last name
 * @param style Display style
 * @returns Formatted name string
 */
export function formatName(
  firstName: string,
  lastName: string,
  style: 'full' | 'short' | 'initial' = 'full'
): string {
  switch (style) {
    case 'full':
      return `${firstName} ${lastName}`.trim()
    case 'short':
      return firstName.trim()
    case 'initial':
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    default:
      return `${firstName} ${lastName}`.trim()
  }
}

/**
 * Generate initials from name
 * @param firstName First name
 * @param lastName Last name
 * @returns Initials string
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Status Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format job status for display
 * @param status Job status
 * @returns Formatted status string with proper casing
 */
export function formatJobStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format verification status for display
 * @param status Verification status
 * @returns Formatted status string
 */
export function formatVerificationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'UNVERIFIED': 'Not Verified',
    'PENDING': 'Verification Pending',
    'VERIFIED': 'Verified',
    'FAILED': 'Verification Failed',
    'SUSPENDED': 'Account Suspended',
  }
  
  return statusMap[status.toUpperCase()] || status
}

/**
 * Format payment status for display
 * @param status Payment status
 * @returns Formatted status string
 */
export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'AUTHORIZED': 'Authorized',
    'CAPTURED': 'Paid',
    'SPLIT_COMPLETE': 'Payment Complete',
    'REFUNDED': 'Refunded',
    'FAILED': 'Payment Failed',
  }
  
  return statusMap[status.toUpperCase()] || status
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// String Utilities
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalize first letter of string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Capitalize first letter of each word
 * @param str String to capitalize
 * @returns Title case string
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Convert to slug
 * @param str String to convert
 * @returns URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Error Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format error message for display
 * @param error Error object or string
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof Error) {
    // Capitalize first letter and remove trailing period if present
    return error.message
      .charAt(0)
      .toUpperCase() + 
      error.message.slice(1)
      .replace(/\.$/, '')
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as any).message as string
    return message
      .charAt(0)
      .toUpperCase() + 
      message.slice(1)
      .replace(/\.$/, '')
  }
  
  return 'An unexpected error occurred'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Address Formatting
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format address for display
 * @param address Address string
 * @param city City name
 * @param state State name
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  city?: string,
  state?: string
): string {
  const parts: string[] = []
  
  if (address) {
    parts.push(address)
  }
  if (city) {
    parts.push(city)
  }
  if (state) {
    parts.push(state)
  }
  
  return parts.join(', ')
}

/**
 * Generate short location string
 * @param city City name
 * @param state State name
 * @returns Short location string
 */
export function formatLocationShort(city?: string, state?: string): string {
  if (city && state) {
    return `${city}, ${state}`
  } else if (city) {
    return city
  } else if (state) {
    return state
  }
  return 'Location not specified'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Export all functions for easy importing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━