import { DataService } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

const FALLBACK_TICKETS = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-8901',
    instituteId: 'c1000000-0000-0000-0000-000000000001',
    instituteName: 'Beaconhouse Central High School',
    requesterName: 'Mrs. Rashida Khan',
    requesterEmail: 'admin.beacon@sms.edu',
    subject: 'Fee Challan custom bank barcode format inquiry',
    category: 'Finance',
    priority: 'Medium',
    status: 'IN_PROGRESS',
    messages: [
      { sender: 'Mrs. Rashida Khan', role: 'Institute Admin', text: 'We need to verify if the 1Link 1Bill barcode prefix matches our new bank branch code 0442.', time: 'Yesterday at 11:30 AM' },
      { sender: 'Super Administrator', role: 'Superadmin', text: 'The 1Link format has been updated to 18-digit consumer ID. You can verify it via the Challan Print Engine.', time: 'Yesterday at 02:15 PM' }
    ],
    createdAt: '2026-10-21T06:30:00Z',
    updatedAt: '2026-10-21T10:15:00Z'
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TKT-8902',
    instituteId: 'c1000000-0000-0000-0000-000000000002',
    instituteName: 'City School Model Town Campus',
    requesterName: 'Tariq Mehmood',
    requesterEmail: 'city.model@sms.edu',
    subject: 'Request for additional campus branch license',
    category: 'Billing',
    priority: 'High',
    status: 'OPEN',
    messages: [
      { sender: 'Tariq Mehmood', role: 'Institute Admin', text: 'We are inaugurating our Junior Model Town extension next month and need to add 1 additional campus slot.', time: 'Today at 09:15 AM' }
    ],
    createdAt: '2026-10-22T04:15:00Z',
    updatedAt: '2026-10-22T04:15:00Z'
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TKT-8903',
    instituteId: 'c1000000-0000-0000-0000-000000000003',
    instituteName: 'Roots International Academy',
    requesterName: 'Dr. Sajid Alvi',
    requesterEmail: 'roots.intl@sms.edu',
    subject: 'Assistance with HEC grading scale conversion',
    category: 'Academics',
    priority: 'Low',
    status: 'RESOLVED',
    messages: [
      { sender: 'Dr. Sajid Alvi', role: 'Institute Admin', text: 'Could you push the standard HEC 4.0 GPA matrix to our university portal?', time: '3 days ago' },
      { sender: 'Super Administrator', role: 'Superadmin', text: 'Template HEC 4.0 GPA Higher Education Scale has been successfully synchronized with your academic schemes.', time: '2 days ago' }
    ],
    createdAt: '2026-10-19T08:00:00Z',
    updatedAt: '2026-10-20T11:00:00Z'
  }
]

const FALLBACK_APPROVALS = [
  {
    id: 'appr-001',
    requestType: 'QUOTA_INCREASE',
    instituteId: 'c1000000-0000-0000-0000-000000000002',
    instituteName: 'City School Model Town Campus',
    title: 'Student Enrollment Quota Extension (+500 Students)',
    details: { currentQuota: 2000, requestedQuota: 2500, reason: 'Mid-term admission surge for O-Level sciences', plan: 'Professional Tier' },
    status: 'PENDING',
    reviewerNotes: null,
    createdAt: '2026-10-21T05:00:00Z'
  },
  {
    id: 'appr-002',
    requestType: 'INSTITUTE_ONBOARDING',
    instituteId: null,
    instituteName: 'Lahore Grammar Collegiate System',
    title: 'New Institute Affiliation Application',
    details: { city: 'Lahore', type: 'College', division: 'Lahore', principal: 'Dr. Asma Bilal', expectedStudents: 1200 },
    status: 'PENDING',
    reviewerNotes: null,
    createdAt: '2026-10-22T02:00:00Z'
  },
  {
    id: 'appr-003',
    requestType: 'FEATURE_UNLOCK',
    instituteId: 'c1000000-0000-0000-0000-000000000003',
    instituteName: 'Roots International Academy',
    title: 'Central Fleet & GPS Transport Module Access',
    details: { module: 'transport', requestedTier: 'Enterprise Apex', vehicleCount: 18 },
    status: 'APPROVED',
    reviewerNotes: 'Approved as part of Enterprise annual subscription bundle.',
    createdAt: '2026-10-18T10:00:00Z'
  }
]

export const SupportService = {
  // 1. TICKETS
  async getTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`)
      if (res.ok) return await res.json()
    } catch {}

    const local = localStorage.getItem('sms_support_tickets')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_support_tickets', JSON.stringify(FALLBACK_TICKETS))
    return FALLBACK_TICKETS
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
