import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

const FALLBACK_TICKETS = []

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
        if (Array.isArray(parsed)) {
          const demoKeywords = ['beaconhouse', 'city school', 'roots international']
          const filtered = parsed.filter(t => {
            if (!t) return false
            const str = ((t.instituteName || '') + (t.subject || '')).toLowerCase()
            if (demoKeywords.some(k => str.includes(k))) return false
            return true
          })
          if (filtered.length !== parsed.length) {
            localStorage.setItem('sms_support_tickets', JSON.stringify(filtered))
          }
          return filtered
        }
      } catch {}
    }
    return []
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
      try { return JSON.parse(local) } catch {}
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
          if (currentData && currentData.institutes) {
            const inst = currentData.institutes.find(i => i.id === item.instituteId)
            if (inst) {
              inst.status = 'Active'
              inst.lifecycleStatus = 'Active'
              inst.subscriptionStatus = 'ACTIVE'
              saveStoredData(currentData)
            }
          }
        } catch (e) {
          console.error('Error activating institute on approval:', e)
        }
      }

      DataService.logActivity('Approval Request Granted', `Approved: "${item.title}"`, 'Super Admin')
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
    DataService.logActivity('Platform Content Saved', `Updated CMS content for: ${key}`, 'Super Admin')
    return { success: true }
  }
}
