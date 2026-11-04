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
