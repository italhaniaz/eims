import React, { useState, useEffect, useMemo } from 'react'
import { 
  BookMarked, 
  Video, 
  BookOpen, 
  FileText, 
  Plus, 
  Search, 
  Download, 
  ExternalLink, 
  Filter, 
  Trash2, 
  Laptop, 
  GraduationCap, 
  X, 
  Check, 
  Eye, 
  Layers, 
  Clock, 
  User, 
  Play, 
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const LearningResourcesView = ({ currentInstitute }) => {
  const { toast } = useToast()
  const campusName = currentInstitute?.name || 'Main Campus'
  const storageKey = `sms_campus_learning_${currentInstitute?.id || 'default'}`

  const defaultResources = [
    {
      id: 'LMS-101',
      title: 'Quadratic Equations & Matrices Handouts',
      subject: 'Mathematics',
      className: 'Grade 10',
      type: 'PDF Notes',
      instructor: 'Prof. Tariq Jamil',
      fileSize: '4.2 MB',
      uploadDate: '2026-10-24',
      downloads: 48,
      url: 'https://example.com/math-quadratics.pdf',
      description: 'Comprehensive chapter notes including solved exercise problems and board examination formulas.'
    },
    {
      id: 'LMS-102',
      title: 'Organic Chemistry: Hydrocarbons Lecture Series',
      subject: 'Chemistry',
      className: 'First Year (Grade 11)',
      type: 'Video Lecture',
      instructor: 'Dr. Nadia Hashmi',
      fileSize: '45 mins (HD)',
      uploadDate: '2026-10-22',
      downloads: 72,
      url: 'https://youtube.com/watch?v=sample-chem',
      description: 'In-depth explanation of alkanes, alkenes reaction mechanisms and laboratory test preparations.'
    },
    {
      id: 'LMS-103',
      title: 'Newtonian Mechanics & Gravitation Slides',
      subject: 'Physics',
      className: 'First Year (Grade 11)',
      type: 'Presentation Slides',
      instructor: 'Syed Ali Raza',
      fileSize: '8.1 MB',
      uploadDate: '2026-10-20',
      downloads: 65,
      url: 'https://example.com/physics-mechanics.pptx',
      description: 'Illustrated PowerPoint slides explaining circular motion, momentum conservation, and orbital physics.'
    },
    {
      id: 'LMS-104',
      title: 'Annual Board Exam Past Papers (2020-2025 Solved)',
      subject: 'Computer Science',
      className: 'Grade 10',
      type: 'Past Paper',
      instructor: 'Engr. Bilal Khan',
      fileSize: '12.4 MB',
      uploadDate: '2026-10-18',
      downloads: 110,
      url: 'https://example.com/cs-past-papers.pdf',
      description: 'Five years compiled solved examination papers with coding solutions and practical guidelines.'
    },
    {
      id: 'LMS-105',
      title: 'English Grammar & Essay Composition Guide',
      subject: 'English',
      className: 'Grade 9',
      type: 'Syllabus & Guide',
      instructor: 'Amina Batool',
      fileSize: '3.6 MB',
      uploadDate: '2026-10-15',
      downloads: 94,
      url: 'https://example.com/english-guide.pdf',
      description: 'Official marking scheme, essay structural templates, and common vocabulary expressions.'
    }
  ]

  const [resources, setResources] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : defaultResources
    } catch {
      return defaultResources
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(resources))
    } catch (e) {
      console.error('Failed to sync learning resources to storage', e)
    }
  }, [resources, storageKey])

  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'videos' | 'syllabus' | 'pastpapers'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('ALL')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    className: 'Grade 10',
    type: 'PDF Notes',
    instructor: '',
    url: '',
    description: ''
  })

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesSearch = 
        res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSubject = selectedSubject === 'ALL' || res.subject === selectedSubject
      const matchesClass = selectedClass === 'ALL' || res.className === selectedClass

      let matchesTab = true
      if (activeTab === 'notes') matchesTab = res.type === 'PDF Notes' || res.type === 'Presentation Slides'
      else if (activeTab === 'videos') matchesTab = res.type === 'Video Lecture'
      else if (activeTab === 'syllabus') matchesTab = res.type === 'Syllabus & Guide'
      else if (activeTab === 'pastpapers') matchesTab = res.type === 'Past Paper'

      return matchesSearch && matchesSubject && matchesClass && matchesTab
    })
  }, [resources, searchTerm, selectedSubject, selectedClass, activeTab])

  const handleAddResource = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast?.error?.('Please enter a resource title.')
      return
    }

    const newRes = {
      id: `LMS-${Date.now()}`,
      title: formData.title.trim(),
      subject: formData.subject,
      className: formData.className,
      type: formData.type,
      instructor: formData.instructor.trim() || 'Campus Faculty',
      fileSize: formData.type === 'Video Lecture' ? 'Live/Video Stream' : '3.8 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
      url: formData.url.trim() || '#',
      description: formData.description.trim() || 'No additional description provided.'
    }

    setResources(prev => [newRes, ...prev])
    toast?.success?.(`"${newRes.title}" published to campus learning repository!`)
    setIsAddModalOpen(false)
    setFormData({
      title: '',
      subject: 'Mathematics',
      className: 'Grade 10',
      type: 'PDF Notes',
      instructor: '',
      url: '',
      description: ''
    })
  }

  const handleDeleteResource = (id, title) => {
    if (window.confirm(`Delete "${title}" from the learning resources?`)) {
      setResources(prev => prev.filter(r => r.id !== id))
      toast?.info?.('Resource removed from library.')
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111c30] via-[#1a2d52] to-[#1e3a6a] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#234277]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Digital Learning & Educational Resources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Learning Systems & Educational Resources
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Curated lecture notes, recorded classes, past examination papers, and curriculum syllabus for teachers and students of {campusName}.
            </p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Resource</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Materials</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{resources.length}</span>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <BookMarked className="w-3 h-3" /> Campus Repository
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Study Notes & Slides</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {resources.filter(r => r.type === 'PDF Notes' || r.type === 'Presentation Slides').length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Handouts & Chapters</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Video Classes</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {resources.filter(r => r.type === 'Video Lecture').length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Recorded Lectures</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Past Papers & Syllabus</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {resources.filter(r => r.type === 'Past Paper' || r.type === 'Syllabus & Guide').length}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Exam Preparation</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Study Notes & Handouts</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Lectures & Online Classes</span>
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus & Curriculum</span>
        </button>
        <button
          onClick={() => setActiveTab('pastpapers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'pastpapers'
              ? 'bg-[#111c30] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Past Papers & Question Banks</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources, topics, or faculty..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="English">English</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Classes / Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="First Year (Grade 11)">First Year (Grade 11)</option>
            <option value="Second Year (Grade 12)">Second Year (Grade 12)</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80">
            <BookMarked className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-base font-bold text-slate-700">No resources found</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or subject filters.</p>
          </div>
        ) : (
          filteredResources.map(res => (
            <div 
              key={res.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {res.subject}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {res.className}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <User className="w-3 h-3 text-slate-400" /> {res.instructor}
                  </span>
                  <span>{res.fileSize}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {res.uploadDate}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      toast?.info?.(`Downloading "${res.title}"...`)
                    }}
                    title="Download / View"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Access</span>
                  </button>

                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    title="Delete Resource"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Upload Learning Resource</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Thermodynamics Complete Handouts"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="First Year (Grade 11)">First Year (Grade 11)</option>
                    <option value="Second Year (Grade 12)">Second Year (Grade 12)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Format *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="PDF Notes">PDF Notes / Document</option>
                    <option value="Video Lecture">Video Lecture / Zoom Link</option>
                    <option value="Presentation Slides">Presentation Slides (PPT)</option>
                    <option value="Past Paper">Past Paper / Solved Paper</option>
                    <option value="Syllabus & Guide">Syllabus & Curriculum Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instructor / Faculty</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Tariq Jamil"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File URL or Online Meeting Link</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/... or https://zoom.us/j/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Topic Outlines</label>
                <textarea
                  rows={3}
                  placeholder="Summary of topics covered, exercise problems solved, or lecture objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Resource</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearningResourcesView