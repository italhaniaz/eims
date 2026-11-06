/**
 * Enterprise Security & Academic Calculation Utilities
 * Multi-Campus Architecture (School, College, University)
 */

/**
 * Masks Pakistani CNIC / B-Form for PII protection (e.g., 35201-*****89-1)
 * @param {string} cnic 
 * @param {boolean} isRevealed 
 * @returns {string}
 */
export const maskCnic = (cnic, isRevealed = false) => {
  if (!cnic || typeof cnic !== 'string') return cnic || ''
  if (isRevealed) return cnic
  const clean = cnic.trim()
  if (clean.length < 13) return clean
  // Standard format: 35201-1234567-1 -> 35201-*****67-1
  const parts = clean.split('-')
  if (parts.length === 3) {
    const mid = parts[1]
    const maskedMid = mid.length >= 4 
      ? '*'.repeat(mid.length - 2) + mid.slice(-2) 
      : '*****'
    return `${parts[0]}-${maskedMid}-${parts[2]}`
  }
  // Generic fallback masking
  return clean.slice(0, 5) + '*****' + clean.slice(-3)
}

/**
 * Masks phone numbers for guardian/student privacy (e.g., 0300-****334)
 * @param {string} phone 
 * @param {boolean} isRevealed 
 * @returns {string}
 */
export const maskPhone = (phone, isRevealed = false) => {
  if (!phone || typeof phone !== 'string') return phone || ''
  if (isRevealed) return phone
  const clean = phone.trim()
  if (clean.length < 9) return clean
  const parts = clean.split('-')
  if (parts.length === 2) {
    const num = parts[1]
    const maskedNum = num.length >= 4 
      ? '*'.repeat(num.length - 3) + num.slice(-3) 
      : '****'
    return `${parts[0]}-${maskedNum}`
  }
  return clean.slice(0, 4) + '****' + clean.slice(-3)
}

/**
 * Strict Pakistani CNIC format validator (e.g. 35201-1234567-1 or 13 digits)
 * @param {string} cnic 
 * @returns {boolean}
 */
export const validatePakistaniCnic = (cnic) => {
  if (!cnic || typeof cnic !== 'string') return false
  const clean = cnic.trim()
  return /^\d{5}-\d{7}-\d{1}$/.test(clean) || /^\d{13}$/.test(clean)
}

/**
 * Auto-format raw numbers into Pakistani CNIC structure (35201-1234567-1)
 * @param {string} val
 * @returns {string}
 */
export const formatPakistaniCnic = (val) => {
  if (!val) return ''
  const digits = String(val).replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`
}

/**
 * Strict Pakistani Mobile/Contact number validator (0300-1234567 or 03001234567)
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePakistaniPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  const clean = phone.trim()
  return /^03\d{2}-?\d{7}$/.test(clean) || /^\+923\d{9}$/.test(clean)
}

/**
 * Auto-format raw phone numbers into standard format (0300-1234567)
 * @param {string} val 
 * @returns {string}
 */
export const formatPakistaniPhone = (val) => {
  if (!val) return ''
  const digits = String(val).replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 4) return digits
  return `${digits.slice(0, 4)}-${digits.slice(4)}`
}

/**
 * Compresses and downscales image uploads client-side before base64 persistence
 * Prevents localStorage QuotaExceededError crashes (scales down to max 320x320 @ ~25KB JPEG).
 * @param {File|Blob} file 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality 
 * @returns {Promise<string>}
 */
export const compressImageFile = (file, maxWidth = 320, maxHeight = 320, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image element'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(e.target.result)
        }

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Basic defense-in-depth HTML text sanitizer to neutralize XSS payload injections
 * @param {string} dirtyStr 
 * @returns {string}
 */
export const sanitizeText = (dirtyStr) => {
  if (!dirtyStr || typeof dirtyStr !== 'string') return dirtyStr || ''
  return dirtyStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Official HEC Standard 4.00 Grade Point Calculator
 * Maps percentage or raw marks to HEC standard letter grade & GPA points
 * @param {number} marks 
 * @param {number} totalMarks 
 * @returns {{ grade: string, gpa: number, status: string }}
 */
export const calculateHecGpa = (marks, totalMarks = 100) => {
  if (totalMarks <= 0) return { grade: 'F', gpa: 0.0, status: 'Fail' }
  const percentage = Math.round((Number(marks) / Number(totalMarks)) * 100)

  if (percentage >= 85) return { grade: 'A', gpa: 4.0, status: 'Pass' }
  if (percentage >= 80) return { grade: 'A-', gpa: 3.67, status: 'Pass' }
  if (percentage >= 75) return { grade: 'B+', gpa: 3.33, status: 'Pass' }
  if (percentage >= 70) return { grade: 'B', gpa: 3.0, status: 'Pass' }
  if (percentage >= 65) return { grade: 'B-', gpa: 2.67, status: 'Pass' }
  if (percentage >= 61) return { grade: 'C+', gpa: 2.33, status: 'Pass' }
  if (percentage >= 58) return { grade: 'C', gpa: 2.0, status: 'Pass' }
  if (percentage >= 55) return { grade: 'C-', gpa: 1.67, status: 'Pass' }
  if (percentage >= 50) return { grade: 'D', gpa: 1.0, status: 'Pass' }
  return { grade: 'F', gpa: 0.0, status: 'Fail' }
}

/**
 * Calculates Semester GPA (SGPA) based on credit-hour weights
 * @param {Array<{ cr: number, marks: number, totalMarks?: number }>} enrolledCourses 
 * @returns {number} SGPA rounded to 2 decimal places
 */
export const calculateSemesterGpa = (enrolledCourses = []) => {
  if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) return 0.0
  let totalQualityPoints = 0
  let totalCreditHours = 0

  enrolledCourses.forEach(c => {
    const cr = Number(c.cr || c.creditHours || 3)
    const { gpa } = calculateHecGpa(c.marks || 0, c.totalMarks || 100)
    totalQualityPoints += cr * gpa
    totalCreditHours += cr
  })

  if (totalCreditHours <= 0) return 0.0
  return Number((totalQualityPoints / totalCreditHours).toFixed(2))
}

/**
 * Checks if a university student is on HEC Academic Probation (CGPA < 2.00)
 * @param {number|string} cgpa 
 * @param {number} threshold 
 * @returns {boolean}
 */
export const isAcademicProbation = (cgpa, threshold = 2.0) => {
  const val = Number(cgpa)
  if (isNaN(val)) return false
  return val < threshold
}

/**
 * Regulatory 75% attendance detention check (BISE College & HEC University rule)
 * @param {number|string} percentage 
 * @param {number} threshold 
 * @returns {boolean} True if student is detained / barred from exams
 */
export const isAttendanceDetained = (percentage, threshold = 75.0) => {
  const val = Number(percentage)
  if (isNaN(val)) return false
  return val < threshold
}

/**
 * Standard PKR currency formatting helper (e.g., ₨ 18,500)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const num = Number(amount)
  if (isNaN(num)) return `₨ 0`
  return `₨ ${num.toLocaleString('en-PK')}`
}

/**
 * Generates an institutional anti-tamper verification hash token for certificates & transcripts
 * Combines student registration, issue date, and an institutional salt into a verifiable checksum.
 * @param {string} studentId 
 * @param {string} certType 
 * @param {string} issueDate 
 * @returns {string} e.g. "VRF-9B4E-7C12"
 */
export const generateCertVerificationToken = (studentId, certType = 'SLC', issueDate = '') => {
  const seed = `${studentId || 'STD'}::${certType}::${issueDate || '2026'}::eims_tamper_guard`
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0')
  return `VRF-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

/**
 * Enterprise Password Strength & Entropy Evaluator
 * Tests length, character classes, entropy points, and returns score, label, CSS color and actionable guidance.
 * @param {string} password 
 * @returns {{
 *   score: number, // 0 to 4
 *   label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong',
 *   color: string,
 *   feedback: string[],
 *   hasMinLength: boolean,
 *   hasUpper: boolean,
 *   hasLower: boolean,
 *   hasNumber: boolean,
 *   hasSpecial: boolean,
 *   isValid: boolean
 * }}
 */
export const evaluatePasswordStrength = (password = '') => {
  const pwd = String(password || '')
  const hasMinLength = pwd.length >= 8
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)

  const feedback = []
  if (!hasMinLength) feedback.push('Minimum 8 characters')
  if (!hasUpper) feedback.push('At least one uppercase letter')
  if (!hasLower) feedback.push('At least one lowercase letter')
  if (!hasNumber) feedback.push('At least one number (0-9)')
  if (!hasSpecial) feedback.push('At least one special symbol (!@#$%^&*)')

  let points = 0
  if (pwd.length >= 8) points++
  if (pwd.length >= 12) points++
  if (hasUpper && hasLower) points++
  if (hasNumber) points++
  if (hasSpecial) points++

  let score = 0
  if (points <= 1) score = 0
  else if (points === 2) score = 1
  else if (points === 3) score = 2
  else if (points === 4) score = 3
  else score = 4

  const meta = [
    { label: 'Very Weak', color: 'text-red-500 bg-red-500' },
    { label: 'Weak', color: 'text-orange-500 bg-orange-500' },
    { label: 'Medium', color: 'text-amber-500 bg-amber-500' },
    { label: 'Strong', color: 'text-emerald-500 bg-emerald-500' },
    { label: 'Very Strong', color: 'text-indigo-500 bg-indigo-500' }
  ][score]

  return {
    score,
    label: meta.label,
    color: meta.color,
    feedback,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid: hasMinLength && (hasUpper || hasLower) && hasNumber
  }
}

