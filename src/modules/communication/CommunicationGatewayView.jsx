import React, { useState, useMemo } from 'react'
import { MessageSquare, Send, CheckCircle2, PhoneCall, Smartphone, History, Zap, Check, Users, Calculator } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export const CommunicationGatewayView = () => {
  const { communicationLogs = [], sendCommunicationBlast, students = [], teachers = [], fees = [] } = useAppData()
  const { toast } = useToast()

  const [channel, setChannel] = useState('SMS')
  const [recipientGroup, setRecipientGroup] = useState('All Parents & Guardians')
  const [message, setMessage] = useState('')

  const quickTemplates = [
    {
      title: 'Fee Dues Reminder',
      text: 'Dear Parent, tuition fees for the current month are due by the 25th. Kindly deposit in HBL/School account to avoid late fee surcharge.'
    },
    {
      title: 'Student Absence Alert',
      text: 'Respected Guardian, your child was marked absent today in the morning roll-call. Please inform the class teacher if on leave.'
    },
    {
      title: 'Emergency Weather / Smog Holiday',
      text: 'Urgent Circular: As per government directives, the school campus will remain closed tomorrow due to weather/smog conditions.'
    },
    {
      title: 'Parent-Teacher Meeting Invitation',
      text: 'Dear Parents, PTM is scheduled for this Saturday from 09:00 AM to 01:00 PM. Your presence is cordially requested.'
    }
  ]

  // Dynamic recipient calculation
  const estimatedRecipients = useMemo(() => {
    switch (recipientGroup) {
      case 'Fee Defaulters Parents':
        return fees.filter(f => f.status !== 'Paid').length || 1
      case 'All Teaching Faculty':
        return teachers.length || 1
      case 'Class 9 & 10 Parents':
        return students.filter(s => (s.className || '').includes('10') || (s.className || '').includes('9')).length || students.length
      case 'Class 11 & 12 Parents':
        return students.filter(s => (s.className || '').includes('11') || (s.className || '').includes('12')).length || students.length
      default:
        return students.length || 1
    }
  }, [recipientGroup, students.length, teachers.length, fees])

  // SMS Characters & Page Estimation (Standard 160 GSM-7 characters per SMS page)
  const charCount = message.length
  const smsPages = Math.max(1, Math.ceil(charCount / 160))
  const remainingInCurrentPage = charCount === 0 ? 160 : (160 - (charCount % 160 || 160))
  const totalCreditsRequired = estimatedRecipients * smsPages

  const handleApplyTemplate = (tpl) => {
    setMessage(tpl.text)
    toast.info(`Applied template: "${tpl.title}"`)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please enter a message to broadcast.')
      return
    }

    sendCommunicationBlast({
      channel,
      recipientGroup,
      message,
      recipientsCount: estimatedRecipients
    })

    toast.success(`Broadcast dispatched via ${channel} to ${estimatedRecipients} recipients (${smsPages} SMS unit(s) each)!`)
    setMessage('')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SMS & WhatsApp Communication Gateway</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Broadcast automated SMS, WhatsApp alerts, and emergency notifications to parents & staff</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SMS Gateway: Active
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            WhatsApp API: Connected
          </span>
        </div>
      </div>

      {/* Main Two Columns: Composer & Quick Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Composer Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Compose Broadcast Dispatch</h2>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Delivery Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'SMS' ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>SMS Direct Gateway</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    channel === 'WhatsApp' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business API</span>
                </button>
              </div>
            </div>

            {/* Recipient Audience */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Recipient Audience</label>
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Target: ~{estimatedRecipients} Recipients</span>
                </span>
              </div>
              <select
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="All Parents & Guardians">All Registered Parents & Guardians</option>
                <option value="Fee Defaulters Parents">Fee Defaulters Parents Only</option>
                <option value="Class 9 & 10 Parents">Class 9 & 10 Matric Parents</option>
                <option value="Class 11 & 12 Parents">Class 11 & 12 Intermediate Parents</option>
                <option value="All Teaching Faculty">All Teaching Staff & Faculty</option>
              </select>
            </div>

            {/* Message Text with Live Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Message Text</label>
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                  <span className={charCount > 160 ? 'text-amber-600 font-bold' : ''}>
                    {charCount} chars
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{remainingInCurrentPage} left in Page {smsPages}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-purple-700">{smsPages} SMS Unit(s)</span>
                </div>
              </div>
              <textarea
                rows={4}
                required
                placeholder="Type your message or click any quick template on the right..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Real-time Dispatch Cost Estimator Badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span>Estimated Gateway Consumption:</span>
              </div>
              <div className="font-mono text-xs font-bold text-purple-800 bg-purple-100/70 px-2.5 py-1 rounded-md border border-purple-200">
                {estimatedRecipients} recipients × {smsPages} SMS = {totalCreditsRequired} Total Credits
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Broadcast Dispatch Now</span>
            </button>
          </form>
        </div>

        {/* Quick Templates on Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">1-Click Fast Templates</h3>
            </div>
            <p className="text-xs text-slate-400">Click to automatically populate message field:</p>

            <div className="space-y-2">
              {quickTemplates.map(tpl => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50/60 hover:border-purple-200 transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700 block">{tpl.title}</span>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tpl.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Broadcast Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>Recent Dispatches</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{communicationLogs.length} dispatches</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {communicationLogs.length > 0 ? (
                communicationLogs.map((log, i) => (
                  <div key={log.id || i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.channel} → {log.audience || log.recipientGroup}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{log.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{log.message || log.messagePreview}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{log.timestamp || log.sentAt}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No recent dispatches logged</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunicationGatewayView
