import { DataService, getStoredData, saveStoredData } from './dataService'

import { API_BASE_URL } from './apiConfig'

const FALLBACK_TICKETS = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-101',
    instituteName: 'Allama Iqbal Campus',
    requesterName: 'Talha (Principal)',
    requesterEmail: 'allamaiqbal@gmail.com',
    subject: 'Assistance with Fee Voucher Gateway Configuration',
    category: 'Billing & POS',
    priority: 'High',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    messages: [
      {
        sender: 'Talha (Principal)',
        role: 'Campus Admin',
        text: 'Assalam o Alaikum, we need assistance configuring our online fee challan generation format with 1Link biller code. Please verify our bank merchant profile.',
        time: '3 hours ago'
      }
    ]
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TKT-2026-102',
    instituteName: 'Kips College',
    requesterName: 'Prof. Tariq Mahmood',
    requesterEmail: 'tariq@kipscollege.edu.pk',
    subject: 'Intermediate Wing Board Examination Grade Scales',
    category: 'Academic Operations',
    priority: 'Medium',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    messages: [
      {
        sender: 'Prof. Tariq Mahmood',
        role: 'Campus Admin',
        text: 'Requesting assistance setting up BISE Gujranwala grade weighting percentages for 1st Year Pre-Medical exams.',
        time: 'Yesterday'
      },
      {
        sender: 'Super Administrator',
        role: 'Superadmin',
        text: 'We are reviewing your academic year configuration and will push the grade scales directly to your portal today.',
        time: '12 hours ago'
      }
    ]
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TKT-2026-098',
    instituteName: 'Punjab University',
    requesterName: 'Registrar Office',
    requesterEmail: 'registrar@pu.edu.pk',
    subject: 'Semester Examination Hall Admit Card Layout Customization',
    category: 'Exams & Grading',
    priority: 'Low',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    messages: [
      {
        sender: 'Registrar Office',
        role: 'Campus Admin',
        text: 'Need roll number barcode printed on BS 8th semester admit cards.',
        time: '3 days ago'
      },
      {
        sender: 'Super Administrator',
        role: 'Superadmin',
        text: 'Admit card barcode module has been enabled for your university wing.',
        time: '2 days ago'
      }
    ]
  }
]

const FALLBACK_APPROVALS = []

export const SupportService = {
  // 1. TICKETS
  async getTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_support_tickets')
    if (local) {
      try { 
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch {}
    }
    localStorage.setItem('sms_support_tickets', JSON.stringify(FALLBACK_TICKETS))
    return FALLBACK_TICKETS
  },

  async createTicket(ticketData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      })
      if (res.ok) return await res.json()
    } catch {}

    const tickets = await this.getTickets()
    const newId = `tkt-${Date.now()}`
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(tickets.length + 101).padStart(3, '0')}`
    const newTicket = {
      id: newId,
      ticketNumber,
      instituteName: ticketData.instituteName || 'Campus Administration',
      requesterName: ticketData.requesterName || 'Admin User',
      requesterEmail: ticketData.requesterEmail || 'admin@campus.edu.pk',
      subject: ticketData.subject,
      category: ticketData.category || 'General',
      priority: ticketData.priority || 'Medium',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender: ticketData.requesterName || 'Super Administrator',
          role: 'Superadmin',
          text: ticketData.message || ticketData.subject,
          time: 'Just now'
        }
      ]
    }
    tickets.unshift(newTicket)
    localStorage.setItem('sms_support_tickets', JSON.stringify(tickets))
    DataService.logActivity('Support Ticket Created', `Created ticket ${ticketNumber}: ${ticketData.subject}`, 'Super Admin')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_tickets_updated'))
    }
    return { success: true, ticket: newTicket }
  },

  async replyTicket(ticketId, replyText, newStatus = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'Super Administrator', text: replyText, newStatus })
      })
      if (res.ok) {
        DataService.logActivity('Support Ticket Replied', `Replied to ticket ${ticketId}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const tickets = await this.getTickets()
    const t = tickets.find(t => t.id === ticketId)
    if (t) {
      t.messages.push({
        sender: 'Super Administrator',
        role: 'Superadmin',
        text: replyText,
        time: 'Just now'
      })
      if (newStatus) t.status = newStatus
      t.updatedAt = new Date().toISOString()
      localStorage.setItem('sms_support_tickets', JSON.stringify(tickets))
      DataService.logActivity('Support Ticket Replied', `Replied to ticket ${t.ticketNumber}`, 'Super Admin')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_tickets_updated'))
      }
      return { success: true, ticket: t }
    }
    return { success: false }
  },

  async updateTicketStatus(ticketId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) return await res.json()
    } catch {}

    const tickets = await this.getTickets()
    const t = tickets.find(t => t.id === ticketId)
    if (t) {
      t.status = status
      t.updatedAt = new Date().toISOString()
      localStorage.setItem('sms_support_tickets', JSON.stringify(tickets))
      DataService.logActivity('Support Ticket Updated', `Marked ticket ${t.ticketNumber} as ${status}`, 'Super Admin')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_tickets_updated'))
      }
      return { success: true, ticket: t }
    }
    return { success: false }
  },

  // 2. APPROVAL QUEUE
  async getApprovals() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/approvals`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_approval_requests')
    if (local) {
      try { 
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    localStorage.setItem('sms_approval_requests', JSON.stringify(FALLBACK_APPROVALS))
    return FALLBACK_APPROVALS
  },

  async approveRequest(id, notes = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/api/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      if (res.ok) {
        DataService.logActivity('Approval Request Granted', `Approved request ID: ${id}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const list = await this.getApprovals()
    const item = list.find(a => a.id === id)
    if (item) {
      item.status = 'APPROVED'
      item.reviewerNotes = notes || 'Approved by Super Administrator'
      localStorage.setItem('sms_approval_requests', JSON.stringify(list))

      // If this was an onboarding request with an instituteId, activate the institute in storedData
      if (item.requestType === 'INSTITUTE_ONBOARDING' && item.instituteId) {
        try {
          const currentData = getStoredData()
          let inst = null
          if (currentData && currentData.institutes) {
            inst = currentData.institutes.find(i => i.id === item.instituteId)
            if (inst) {
              inst.status = 'Active'
              inst.lifecycleStatus = 'Active'
              inst.subscriptionStatus = 'ACTIVE'
            }
          }

          // Create/activate user account for institute admin so they can login immediately
          if (currentData && (item.details || inst)) {
            currentData.users = currentData.users || []
            const email = ((item.details && item.details.email) || (inst && inst.email) || '').toLowerCase().trim()
            if (email) {
              const existingIdx = currentData.users.findIndex(u => (u.email || '').toLowerCase() === email)
              const userObj = {
                id: existingIdx !== -1 ? currentData.users[existingIdx].id : `usr-inst-${Date.now().toString().slice(-4)}`,
                name: (item.details && (item.details.contactPerson || item.details.adminName)) || (inst && inst.contactPerson) || 'Principal Administrator',
                email: email,
                password: (item.details && item.details.adminPassword) || (inst && inst.adminPassword) || 'admin123',
                role: 'institute_admin',
                roleId: 'institute_admin',
                instituteId: item.instituteId,
                instituteName: item.instituteName,
                status: 'Active',
                phone: (item.details && item.details.phone) || (inst && inst.phone) || '',
                createdAt: new Date().toISOString()
              }
              if (existingIdx !== -1) {
                currentData.users[existingIdx] = { ...currentData.users[existingIdx], ...userObj }
              } else {
                currentData.users.push(userObj)
              }
            }
          }
          saveStoredData(currentData)

          // Activate the subscription in sms_institute_subscriptions
          const localSubs = localStorage.getItem('sms_institute_subscriptions')
          if (localSubs) {
            try {
              const subs = JSON.parse(localSubs)
              const sub = subs.find(s => s.instituteId === item.instituteId)
              if (sub) {
                sub.status = 'ACTIVE'
                localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
              }
            } catch {}
          }
        } catch (e) {
          console.error('Error activating institute on approval:', e)
        }
      }

      DataService.logActivity('Approval Request Granted', `Approved: "${item.title}"`, 'Super Admin')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_approvals_updated'))
      }
      return { success: true, request: item }
    }
    return { success: false }
  },

  async rejectRequest(id, reason = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/api/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (res.ok) {
        DataService.logActivity('Approval Request Declined', `Declined request ID: ${id}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const list = await this.getApprovals()
    const item = list.find(a => a.id === id)
    if (item) {
      item.status = 'REJECTED'
      item.reviewerNotes = reason || 'Declined by Super Administrator'
      localStorage.setItem('sms_approval_requests', JSON.stringify(list))
      DataService.logActivity('Approval Request Declined', `Declined: "${item.title}"`, 'Super Admin')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_approvals_updated'))
      }
      return { success: true, request: item }
    }
    return { success: false }
  },

  // 3. PLATFORM CONTENT CMS
  async getContent(key) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/${key}`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem(`sms_content_${key}`)
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    return null
  },

  async saveContent(key, data) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) return await res.json()
    } catch {}

    localStorage.setItem(`sms_content_${key}`, JSON.stringify(data))
    DataService.logActivity('CMS Content Updated', `Updated legal CMS key: ${key}`, 'Super Admin')
    return { success: true, content: data }
  }
}
