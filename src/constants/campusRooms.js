/**
 * Campus Classrooms & Physical Space Registry
 */
export const STANDARD_CAMPUS_ROOMS = [
  { id: 'rm-101', name: 'Room 101', type: 'Classroom', floor: 'Ground Floor', capacity: 40 },
  { id: 'rm-102', name: 'Room 102', type: 'Classroom', floor: 'Ground Floor', capacity: 40 },
  { id: 'rm-103', name: 'Room 103', type: 'Classroom', floor: 'Ground Floor', capacity: 40 },
  { id: 'rm-104', name: 'Room 104', type: 'Classroom', floor: 'Ground Floor', capacity: 40 },
  { id: 'rm-105', name: 'Room 105', type: 'Classroom', floor: 'Ground Floor', capacity: 35 },
  { id: 'rm-201', name: 'Room 201', type: 'Classroom Wing A', floor: '1st Floor', capacity: 40 },
  { id: 'rm-202', name: 'Room 202', type: 'Classroom Wing A', floor: '1st Floor', capacity: 40 },
  { id: 'rm-203', name: 'Room 203', type: 'Classroom Wing B', floor: '1st Floor', capacity: 40 },
  { id: 'rm-204', name: 'Room 204', type: 'Classroom Wing B', floor: '1st Floor', capacity: 40 },
  { id: 'rm-205', name: 'Room 205', type: 'Classroom Wing B', floor: '1st Floor', capacity: 45 },
  { id: 'rm-301', name: 'Room 301', type: 'Senior Wing', floor: '2nd Floor', capacity: 45 },
  { id: 'rm-302', name: 'Room 302', type: 'Senior Wing', floor: '2nd Floor', capacity: 45 },
  { id: 'rm-303', name: 'Room 303', type: 'Senior Wing', floor: '2nd Floor', capacity: 45 },
  { id: 'rm-304', name: 'Room 304', type: 'Senior Wing', floor: '2nd Floor', capacity: 45 },
  { id: 'hl-401', name: 'Hall 401', type: 'Lecture Hall / Auditorium', floor: '3rd Floor', capacity: 60 },
  { id: 'hl-402', name: 'Hall 402', type: 'Lecture Hall / Auditorium', floor: '3rd Floor', capacity: 60 },
  { id: 'lab-sci-1', name: 'Science Lab 1', type: 'Physics & Chemistry Lab', floor: '1st Floor', capacity: 40 },
  { id: 'lab-sci-2', name: 'Science Lab 2', type: 'Biology Lab', floor: '1st Floor', capacity: 40 },
  { id: 'lab-cs-1', name: 'Computer Lab 1', type: 'Computer Lab', floor: '2nd Floor', capacity: 45 },
  { id: 'lab-cs-2', name: 'Computer Lab 2', type: 'Software Lab', floor: '2nd Floor', capacity: 45 },
  { id: 'lib-hall', name: 'Library Hall', type: 'Library & Study Wing', floor: 'Ground Floor', capacity: 50 }
]

export const getCampusRooms = () => {
  try {
    const custom = localStorage.getItem('sms_campus_rooms')
    if (custom) {
      const parsed = JSON.parse(custom)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return STANDARD_CAMPUS_ROOMS
}
