import React, { useState, useRef } from 'react'
import { 
  X, 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { detectProgramLevel } from '../../../constants/academicLevels'

export const ClassCsvImportModal = ({
  isOpen,
  onClose,
  currentInstitute,
  currentSession = '2026-2027',
  onImportClasses
}) => {
  const [csvFile, setCsvFile] = useState(null)
  const [parsedClasses, setParsedClasses] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const headers = [
      'ClassName',
      'Level',
      'AcademicSession',
      'SectionName',
      'RoomNo',
      'Capacity',
      'Shift',
      'Gender',
      'Medium'
    ]
    const sampleRows = [
      'Grade 9,secondary,2026-2027,Section A,Room 101,40,Morning,Co-ed,English',
      'Grade 9,secondary,2026-2027,Section B,Room 102,40,Morning,Co-ed,English',
      '11th Grade (FSc Pre-Med),higher-secondary,2026-2027,Section A,Hall 401,45,Morning,Co-ed,English'
    ]
    const content = [headers.join(','), ...sampleRows].join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Classes_and_Sections_Import_Template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle File Input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setParseErrors(['Invalid file format. Please upload a .csv file.'])
      return
    }

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (!text) return

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
      if (lines.length <= 1) {
        setParseErrors(['The uploaded CSV is empty or only contains headers.'])
        setParsedClasses([])
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
      const nameIdx = headers.findIndex(h => h.includes('class') || h.includes('name'))
      const levelIdx = headers.findIndex(h => h.includes('level') || h.includes('tier'))
      const sessionIdx = headers.findIndex(h => h.includes('session'))
      const secIdx = headers.findIndex(h => h.includes('sec'))
      const roomIdx = headers.findIndex(h => h.includes('room'))
      const capIdx = headers.findIndex(h => h.includes('cap'))
      const shiftIdx = headers.findIndex(h => h.includes('shift'))
      const genderIdx = headers.findIndex(h => h.includes('gender'))
      const medIdx = headers.findIndex(h => h.includes('med'))

      const classMap = new Map() // className -> classObj
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
        const className = nameIdx >= 0 ? row[nameIdx] : row[0]
        if (!className || className.trim().length < 2) {
          errors.push(`Row ${i + 1}: Class name is missing or invalid.`)
          continue
        }

        const cleanClass = className.trim()
        const lvl = levelIdx >= 0 && row[levelIdx] ? row[levelIdx] : detectProgramLevel(cleanClass)
        const sess = sessionIdx >= 0 && row[sessionIdx] ? row[sessionIdx] : currentSession
        const secName = secIdx >= 0 && row[secIdx] ? row[secIdx] : 'Section A'
        const roomNo = roomIdx >= 0 && row[roomIdx] ? row[roomIdx] : `Room ${100 + i}`
        const capacity = capIdx >= 0 && Number(row[capIdx]) ? Number(row[capIdx]) : 40
        const shift = shiftIdx >= 0 && row[shiftIdx] ? row[shiftIdx] : 'Morning'
        const gender = genderIdx >= 0 && row[genderIdx] ? row[genderIdx] : 'Co-ed'
        const medium = medIdx >= 0 && row[medIdx] ? row[medIdx] : 'English'

        if (!classMap.has(cleanClass)) {
          classMap.set(cleanClass, {
            name: cleanClass,
            programLevel: lvl,
            academicSession: sess,
            instituteId: currentInstitute?.id || 'inst-1',
            sections: []
          })
        }

        const target = classMap.get(cleanClass)
        // Check duplicate section within same class
        if (target.sections.some(s => s.name.toLowerCase() === secName.toLowerCase())) {
          errors.push(`Row ${i + 1}: Duplicate section "${secName}" for class "${cleanClass}". Skipped duplicate row.`)
          continue
        }

        target.sections.push({
          id: `sec-${Date.now()}-${i}`,
          name: secName,
          roomNo,
          capacity,
          shift,
          gender,
          medium,
          enrolled: 0
        })
      }

      // Finalize enriched classes
      const results = Array.from(classMap.values()).map(c => ({
        ...c,
        capacity: c.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0),
        section: c.sections.map(s => s.name).join(', '),
        roomNo: c.sections[0]?.roomNo || 'Room 101',
        enrolled: 0
      }))

      setParsedClasses(results)
      setParseErrors(errors)
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (parsedClasses.length === 0) return
    onImportClasses(parsedClasses)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Classes & Sections via CSV"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Template download callout */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <strong className="text-slate-800 block">Download Official Import Template</strong>
            <span className="text-slate-400 text-[11px]">CSV schema pre-formatted with all required columns</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload dropzone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition-all"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-slate-700">
            {csvFile ? csvFile.name : 'Click to select or drop .csv file here'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 5MB (.csv only)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
            <strong className="block font-bold">Import Warnings:</strong>
            {parseErrors.map((err, idx) => (
              <p key={idx} className="text-[11px]">• {err}</p>
            ))}
          </div>
        )}

        {/* Parsed classes preview */}
        {parsedClasses.length > 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
            <strong className="block">
              ✓ Ready to import {parsedClasses.length} class(es) with a total of {parsedClasses.reduce((acc, c) => acc + c.sections.length, 0)} section(s).
            </strong>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedClasses.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            Import {parsedClasses.length} Classes
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ClassCsvImportModal
