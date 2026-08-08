import api from './api';

const INITIAL_TIMETABLE = [
  { id: 1, department_id: 1, department: 'Computer Science and Engineering', year: 1, semester: 1, day: 'Monday', start_time: '09:00 AM', end_time: '10:00 AM', subject: 'Data Structures and Algorithms', subject_code: 'CS401', room: 'Lab 101' },
  { id: 2, department_id: 1, department: 'Computer Science and Engineering', year: 1, semester: 1, day: 'Tuesday', start_time: '10:00 AM', end_time: '11:00 AM', subject: 'Database Management Systems', subject_code: 'IT402', room: 'Hall B' },
  { id: 3, department_id: 1, department: 'Computer Science and Engineering', year: 1, semester: 1, day: 'Wednesday', start_time: '11:00 AM', end_time: '12:00 PM', subject: 'Operating Systems', subject_code: 'CS403', room: 'Hall A' },
  { id: 4, department_id: 1, department: 'Computer Science and Engineering', year: 1, semester: 1, day: 'Thursday', start_time: '09:00 AM', end_time: '10:00 AM', subject: 'Computer Networks', subject_code: 'ECE404', room: 'Lab 202' },
  { id: 5, department_id: 1, department: 'Computer Science and Engineering', year: 1, semester: 1, day: 'Friday', start_time: '02:00 PM', end_time: '03:00 PM', subject: 'Data Structures and Algorithms', subject_code: 'CS401', room: 'Hall C' },
  { id: 6, department_id: 2, department: 'Information Technology', year: 1, semester: 1, day: 'Monday', start_time: '09:00 AM', end_time: '10:00 AM', subject: 'Database Management Systems', subject_code: 'IT402', room: 'Lab 102' }
];

const getStoredTimetable = () => {
  const saved = localStorage.getItem('sms_timetable');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('sms_timetable', JSON.stringify(INITIAL_TIMETABLE));
  return INITIAL_TIMETABLE;
};

const setStoredTimetable = (list) => {
  localStorage.setItem('sms_timetable', JSON.stringify(list));
};

const timetableService = {
  getTimetable: async (departmentId, year, semester) => {
    try {
      const res = await api.get('/timetables', {
        params: { department_id: departmentId, year, semester }
      });
      if (res.data) {
        const list = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (list.length > 0) {
          setStoredTimetable(list);
          return { success: true, data: list };
        }
      }
    } catch (e) {}

    const allSlots = getStoredTimetable();
    const filtered = allSlots.filter(s =>
      (!departmentId || String(s.department_id) === String(departmentId)) &&
      (!year || String(s.year) === String(year)) &&
      (!semester || String(s.semester) === String(semester))
    );
    return { success: true, data: filtered.length > 0 ? filtered : allSlots };
  },

  addSlot: async (slotData) => {
    const slots = getStoredTimetable();
    const newSlot = { id: Date.now(), ...slotData };
    slots.unshift(newSlot);
    setStoredTimetable(slots);

    try {
      const res = await api.post('/timetables', slotData);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true, data: newSlot };
  },

  deleteSlot: async (slotId) => {
    const slots = getStoredTimetable();
    const filtered = slots.filter(s => String(s.id) !== String(slotId));
    setStoredTimetable(filtered);

    try {
      const res = await api.delete(`/timetables/${slotId}`);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true };
  }
};

export default timetableService;
