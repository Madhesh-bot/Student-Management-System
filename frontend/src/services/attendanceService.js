import api from './api';
import firestoreService from './firestoreService';

const INITIAL_ATTENDANCE = [
  { id: 1, student_id: 1, student_name: 'Alice Smith', register_number: 'REG1001', date: new Date().toISOString().split('T')[0], status: 'Present' },
  { id: 2, student_id: 2, student_name: 'Madhesh K', register_number: 'REG1002', date: new Date().toISOString().split('T')[0], status: 'Present' },
  { id: 3, student_id: 3, student_name: 'Bob Johnson', register_number: 'REG1003', date: new Date().toISOString().split('T')[0], status: 'Late' },
  { id: 4, student_id: 4, student_name: 'Carol Williams', register_number: 'REG1004', date: new Date().toISOString().split('T')[0], status: 'Present' }
];

const getStoredAttendance = () => {
  const saved = localStorage.getItem('sms_attendance');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('sms_attendance', JSON.stringify(INITIAL_ATTENDANCE));
  return INITIAL_ATTENDANCE;
};

const setStoredAttendance = (list) => {
  localStorage.setItem('sms_attendance', JSON.stringify(list));
};

const getAttendanceByDate = async (date) => {
  try {
    const response = await api.get(`/attendance?date=${date}`);
    if (response.data) return response.data;
  } catch (err) {}

  const logs = getStoredAttendance();
  const filtered = logs.filter(l => l.date === date);
  return { success: true, data: filtered.length > 0 ? filtered : logs };
};

const getAttendanceByStudent = async (studentId) => {
  try {
    const response = await api.get(`/attendance?studentId=${studentId}`);
    if (response.data) return response.data;
  } catch (err) {}

  const logs = getStoredAttendance();
  const filtered = logs.filter(l => String(l.student_id) === String(studentId));
  return { success: true, data: filtered.length > 0 ? filtered : logs };
};

const upsertAttendance = async (student_id, date, status) => {
  const logs = getStoredAttendance();
  const existingIndex = logs.findIndex(l => String(l.student_id) === String(student_id) && l.date === date);
  let newLog;
  if (existingIndex >= 0) {
    logs[existingIndex].status = status;
    newLog = logs[existingIndex];
  } else {
    newLog = { id: Date.now(), student_id, date, status };
    logs.unshift(newLog);
  }
  setStoredAttendance(logs);

  firestoreService.logAttendance(newLog).catch(() => {});

  try {
    const response = await api.post('/attendance', { student_id, date, status });
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true, data: newLog };
};

const updateAttendanceStatus = async (id, status) => {
  const logs = getStoredAttendance();
  const updated = logs.map(l => String(l.id) === String(id) ? { ...l, status } : l);
  setStoredAttendance(updated);

  try {
    const response = await api.put(`/attendance/${id}`, { status });
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true };
};

const deleteAttendance = async (id) => {
  const logs = getStoredAttendance();
  const filtered = logs.filter(l => String(l.id) !== String(id));
  setStoredAttendance(filtered);

  try {
    const response = await api.delete(`/attendance/${id}`);
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true };
};

export default {
  getAttendanceByDate,
  getAttendanceByStudent,
  upsertAttendance,
  updateAttendanceStatus,
  deleteAttendance
};
