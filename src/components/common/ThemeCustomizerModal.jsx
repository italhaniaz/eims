import React, { useState } from 'react'
import { 
  Palette, 
  Moon, 
  Sun, 
  Check, 
  Globe, 
  Sparkles, 
  RotateCcw, 
  X, 
  Sliders, 
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react'
import { useTheme, THEME_PRESETS } from '../../context/ThemeContext'
import Modal from './Modal'

export const ThemeCustomizerModal = ({ isOpen, onClose }) => {
  const { 
    themeMode, 
    toggleThemeMode, 
    isDark, 
    preset, 
    setPreset, 
    customPrimary, 
    setCustomPrimary, 
    dir, 
    toggleDir, 
    locale, 
    setLocale,
    activeThemeConfig,
    chartPalette
  } = useTheme()

  const [hexInput, setHexInput] = useState(customPrimary)

  const handleColorChange = (newHex) => {
    setHexInput(newHex)
    setCustomPrimary(newHex)
  }

  const handleResetDefaults = () => {
    setPreset('college')
    if (isDark) toggleThemeMode()
    if (dir === 'rtl') toggleDir()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Theme Studio & Multi-Campus Design Tokens" 
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-slate-800 dark:text-slate-100">
        
        {/* SECTION 1: APPEARANCE MODE & DIRECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Light / Dark Mode */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Display Mode</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isDark ? 'Dark Theme (--bg: #0B1020)' : 'Light Theme (--bg: #F8FAFC)'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleThemeMode}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDark ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                  isDark ? 'translate-x-6 text-indigo-900' : 'translate-x-0 text-amber-600'
                }`}
              >
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>

          {/* LTR / RTL Urdu Direction */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Text Direction & Urdu</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {dir === 'rtl' ? 'RTL Mode (اردو تیار)' : 'LTR Mode (English Standard)'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { if (dir !== 'ltr') toggleDir() }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  dir === 'ltr' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                LTR
              </button>
              <button
                type="button"
                onClick={() => { if (dir !== 'rtl') toggleDir() }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  dir === 'rtl' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                اردو RTL
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: INSTITUTIONAL THEME PRESETS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Institutional Tier Presets
            </h4>
            <span className="text-[11px] text-slate-400">Instant multi-campus palette switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. School Preset */}
            <div
              onClick={() => setPreset('school')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                preset === 'school' 
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  🏫 School
                </span>
                {preset === 'school' && (
                  <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                #0EA5E9 + #F97316
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-[#0EA5E9] shadow-xs" title="Primary #0EA5E9" />
                <span className="w-5 h-5 rounded-md bg-[#F97316] shadow-xs" title="Secondary #F97316" />
                <span className="w-5 h-5 rounded-md bg-[#F59E0B] shadow-xs" title="Accent #F59E0B" />
                <span className="text-[10px] text-slate-400 ml-auto font-bold">K-10</span>
              </div>
            </div>

            {/* 2. College Preset */}
            <div
              onClick={() => setPreset('college')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                preset === 'college' 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  🏛️ College
                </span>
                {preset === 'college' && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                #4F46E5 + #14B8A6
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-[#4F46E5] shadow-xs" title="Primary #4F46E5" />
                <span className="w-5 h-5 rounded-md bg-[#14B8A6] shadow-xs" title="Secondary #14B8A6" />
                <span className="w-5 h-5 rounded-md bg-[#F59E0B] shadow-xs" title="Accent #F59E0B" />
                <span className="text-[10px] text-slate-400 ml-auto font-bold">Intermediate</span>
              </div>
            </div>

            {/* 3. University Preset */}
            <div
              onClick={() => setPreset('university')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                preset === 'university' 
                  ? 'border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  🎓 University
                </span>
                {preset === 'university' && (
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                #1E3A8A + #D4AF37
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-[#1E3A8A] shadow-xs" title="Primary #1E3A8A" />
                <span className="w-5 h-5 rounded-md bg-[#D4AF37] shadow-xs" title="Secondary #D4AF37" />
                <span className="w-5 h-5 rounded-md bg-[#B45309] shadow-xs" title="Accent #B45309" />
                <span className="text-[10px] text-slate-400 ml-auto font-bold">HEC Degree</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CUSTOM BRAND COLOR PICKER */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Custom Color Engine (Auto Shades)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick any primary brand color; hover states, soft tints and hero gradients are generated on the fly.
              </p>
            </div>
            {preset === 'custom' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                Active Custom
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={hexInput}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent p-0"
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-mono font-bold uppercase rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600"
                maxLength={7}
              />
            </div>

            {/* Quick Palette Swatches */}
            <div className="flex items-center gap-1.5">
              {[
                '#4F46E5', // Indigo SaaS
                '#059669', // Emerald
                '#0EA5E9', // Sky Blue
                '#7C3AED', // Violet
                '#EC4899', // Pink
                '#E11D48', // Rose
                '#D97706', // Amber
                '#0D9488'  // Teal
              ].map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => handleColorChange(swatch)}
                  className={`w-6 h-6 rounded-md transition-transform hover:scale-110 cursor-pointer shadow-2xs border ${
                    customPrimary === swatch && preset === 'custom' ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : 'border-black/10'
                  }`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: LIVE DESIGN TOKEN PREVIEW */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Live Token Sandbox Preview
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              --primary: {activeThemeConfig.primary}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Hero Gradient CTA Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Hero Gradient & CTA</span>
              <button
                type="button"
                className="btn-hero-gradient w-full py-2.5 px-4 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Primary SaaS Action Button</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Tokens Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Status Indicators</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Success #22C55E
                </span>
                <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Warning #F59E0B
                </span>
                <span className="px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> Error #EF4444
                </span>
                <span className="px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Info #0EA5E9
                </span>
              </div>
            </div>
          </div>

          {/* Chart Palette Swatches */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1.5">
              6-Color Analytics Chart Palette
            </span>
            <div className="flex items-center gap-2">
              {chartPalette.map((color, i) => (
                <div key={color} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full h-4 rounded-sm shadow-2xs"
                    style={{ backgroundColor: color }} 
                  />
                  <span className="text-[10px] font-mono text-slate-400">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to College Default</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer transition-all"
          >
            Save & Apply Tokens
          </button>
        </div>

      </div>
    </Modal>
  )
}

export default ThemeCustomizerModal
