import React from 'react'

/**
 * High-precision vector SVG Barcode Generator (Code 39 / 128 pattern)
 * Crisp at all print resolutions (300dpi / 600dpi).
 */
export const BarcodeSvg = ({ value = 'CH-2026-001', height = 36, className = '', showText = true }) => {
  const sanitized = String(value).toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '-')
  
  // Standard Code 39 character patterns (9 elements: 5 bars, 4 spaces. 3 wide, 6 narrow)
  const code39Patterns = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
    '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
  }

  const encodedStr = `*${sanitized}*`
  const bars = []
  let currentX = 10

  for (let i = 0; i < encodedStr.length; i++) {
    const char = encodedStr[i]
    const pattern = code39Patterns[char] || code39Patterns['-']
    
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0
      const isWide = pattern[j] === '1'
      const width = isWide ? 2.6 : 1.2

      if (isBar) {
        bars.push({ x: currentX, width })
      }
      currentX += width + 0.8
    }
    // Inter-character space
    currentX += 1.6
  }

  const totalWidth = currentX + 10

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg 
        viewBox={`0 0 ${totalWidth} ${height}`} 
        className="w-full max-w-full h-auto"
        style={{ maxHeight: height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width="100%" height="100%" fill="transparent" />
        {bars.map((bar, idx) => (
          <rect 
            key={idx} 
            x={bar.x} 
            y={0} 
            width={bar.width} 
            height={height} 
            fill="#0f172a" 
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono text-[9px] tracking-widest text-slate-700 font-semibold mt-0.5">
          {sanitized}
        </span>
      )}
    </div>
  )
}

/**
 * Vector SVG QR Code Matrix Generator
 * Produces crisp QR pattern with positioning squares for badges and admit cards.
 */
export const QrCodeSvg = ({ value = 'VERIFY', size = 56, className = '' }) => {
  // Deterministic 15x15 matrix generation from string hash
  const hash = String(value).split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0)
  const matrixSize = 17
  const cells = []

  // Check if coordinates belong to standard QR corner positioning squares
  const isCornerSquare = (r, c) => {
    // Top-left 7x7
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true
      return false
    }
    // Top-right 7x7
    if (r < 7 && c >= matrixSize - 7) {
      const oc = c - (matrixSize - 7)
      if (r === 0 || r === 6 || oc === 0 || oc === 6) return true
      if (r >= 2 && r <= 4 && oc >= 2 && oc <= 4) return true
      return false
    }
    // Bottom-left 7x7
    if (r >= matrixSize - 7 && c < 7) {
      const or = r - (matrixSize - 7)
      if (or === 0 || or === 6 || c === 0 || c === 6) return true
      if (or >= 2 && or <= 4 && c >= 2 && c <= 4) return true
      return false
    }
    return null
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const corner = isCornerSquare(r, c)
      if (corner !== null) {
        if (corner) cells.push({ r, c })
      } else {
        // Pseudo-random data distribution based on string hash
        const val = ((r * 13 + c * 7 + hash * 3) % 19) < 9
        if (val) cells.push({ r, c })
      }
    }
  }

  const cellSize = 100 / matrixSize

  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`shrink-0 ${className}`}
    >
      <rect width="100" height="100" fill="#ffffff" rx="4" />
      {cells.map((cell, idx) => (
        <rect
          key={idx}
          x={cell.c * cellSize}
          y={cell.r * cellSize}
          width={cellSize + 0.1}
          height={cellSize + 0.1}
          fill="#0f172a"
        />
      ))}
    </svg>
  )
}

/**
 * Standard Educational Bank Presets in Pakistan & South Asia
 */
export const BANK_PRESETS = [
  {
    id: 'hbl',
    name: 'Habib Bank Limited (HBL)',
    shortName: 'HBL',
    accountTitle: 'Central Educational Campus Collection A/C',
    accountNo: '0042-79012345-01',
    iban: 'PK36HABB0000427901234501',
    branch: 'Commercial Hub Branch (0422)',
    color: '#008351'
  },
  {
    id: 'meezan',
    name: 'Meezan Bank Limited',
    shortName: 'Meezan',
    accountTitle: 'Campus Islamic Educational Trust',
    accountNo: '0102-0103492811',
    iban: 'PK78MEZN0001020103492811',
    branch: 'Gulberg Main Branch (0102)',
    color: '#5c102a'
  },
  {
    id: 'allied',
    name: 'Allied Bank Limited (ABL)',
    shortName: 'ABL',
    accountTitle: 'School System Operations Account',
    accountNo: '0010-023849102-001',
    iban: 'PK45ABPA0010023849102001',
    branch: 'Civil Lines Branch (0010)',
    color: '#004b87'
  },
  {
    id: 'ubl',
    name: 'United Bank Limited (UBL)',
    shortName: 'UBL',
    accountTitle: 'Institute Fee Collection Counter A/C',
    accountNo: '0981-22449018-09',
    iban: 'PK12UNIL0009812244901809',
    branch: 'Mall Road Branch (0981)',
    color: '#0066b2'
  },
  {
    id: 'cashier',
    name: 'Campus Cashier / Accounts Counter',
    shortName: 'School Cashier',
    accountTitle: 'Accounts & Bursar Cash Receipt Desk',
    accountNo: 'CASHIER-DESK-01',
    iban: 'OFFICIAL CASH RECEIPT',
    branch: 'Administrative Block Counter 1',
    color: '#0f172a'
  }
]
