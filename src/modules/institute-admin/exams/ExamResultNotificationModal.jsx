// src/modules/institute-admin/exams/ExamResultNotificationModal.jsx
import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Copy, 
  ExternalLink, 
  Check, 
  Send, 
  Phone, 
  User, 
  Award,
  Sparkles
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { generateResultWhatsAppUrl } from './examService'

export const ExamResultNotificationModal = ({
  isOpen,
  onClose,
  marksheet,
  currentInstitute,
  rank = null
}) => {
  const [phone, setPhone] = useState(marksheet?.phone || marksheet?.parentPhone || marksheet?.guardianPhone || '')
  const [copied, setCopied] = useState(false)
  const [langMode, setLangMode] = useState('bilingual') // 'bilingual' | 'english' | 'urdu'

  useEffect(() => {
    if (marksheet) {
      setPhone(marksheet.phone || marksheet.parentPhone || marksheet.guardianPhone || '')
      setCopied(false)
    }
  }, [marksheet])

  if (!marksheet) return null

  const instituteName = currentInstitute?.name || 'Beaconhouse Central High School'
  const rankText = rank ? `Position #${rank}` : ''

  const englishBody = `Official Examination Result Notification\n` +
    `Institute: ${instituteName}\n` +
    `Dear Parent/Guardian,\n` +
    `The terminal examination result for ${marksheet.studentName} (Roll No: ${marksheet.rollNumber}) has been declared.\n\n` +
    `• Examination: ${marksheet.term}\n` +
    `• Class: ${marksheet.className}\n` +
    `• Total Marks: ${marksheet.totalObtained} / ${marksheet.totalMax} (${marksheet.percentage})\n` +
    `• Final Grade: ${marksheet.overallGrade}\n` +
    (rankText ? `• Merit Standing: ${rankText}\n` : '') +
    `\nDetailed Mark Certificate (DMC) can be collected from the administration office.`

  const urduBody = `محترم والدین،\n` +
    `طالب علم ${marksheet.studentName} (رول نمبر: ${marksheet.rollNumber}) کا ${marksheet.term} کا آفیشل رزلٹ جاری کر دیا گیا ہے۔\n` +
    `حاصل کردہ نمبر: ${marksheet.totalObtained}/${marksheet.totalMax} (${marksheet.percentage})\n` +
    `گریڈ: ${marksheet.overallGrade}\n` +
    (rankText ? `کلاس پوزیشن: ${rankText}\n` : '') +
    `ادارہ: ${instituteName}`

  let activeMessage = `${englishBody}\n\n---\n${urduBody}`
  if (langMode === 'english') activeMessage = englishBody
  if (langMode === 'urdu') activeMessage = urduBody

  const whatsappUrl = generateResultWhatsAppUrl({
    phone,
    studentName: marksheet.studentName,
    rollNumber: marksheet.rollNumber,
    className: marksheet.className,
    term: marksheet.term,
    totalObtained: marksheet.totalObtained,
    totalMax: marksheet.totalMax,
    percentage: marksheet.percentage,
    grade: marksheet.overallGrade,
    rank,
    instituteName
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Examination Result to Parents"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        {/* Student Summary Card */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{marksheet.studentName}</h4>
              <p className="text-[11px] text-slate-500 font-mono">Roll No: {marksheet.rollNumber} • {marksheet.className}</p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-black text-slate-800 block">{marksheet.totalObtained} / {marksheet.totalMax}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
              Grade {marksheet.overallGrade} ({marksheet.percentage})
            </span>
          </div>
        </div>

        {/* Recipient Phone & Language Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Parent WhatsApp / Mobile No
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +923001234567"
              className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Message Template Format
            </label>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setLangMode('bilingual')}
                className={`flex-1 py-1 rounded transition-colors ${
                  langMode === 'bilingual' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Bilingual
              </button>
              <button
                type="button"
                onClick={() => setLangMode('english')}
                className={`flex-1 py-1 rounded transition-colors ${
                  langMode === 'english' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLangMode('urdu')}
                className={`flex-1 py-1 rounded transition-colors ${
                  langMode === 'urdu' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                اردو
              </button>
            </div>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              Live Dispatch Preview
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Includes official credentials & marks
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-700 max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed text-[11px]">
            {activeMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy SMS Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Web</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ExamResultNotificationModal
