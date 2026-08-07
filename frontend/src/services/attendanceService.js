import api from './api';

/**
 * Fetch attendance logs by date (YYYY-MM-DD)
 */
const getAttendanceByDate = async (date) => {
  const response = await api.get(`/attendance?date=${date}`);
  return response.data;
};

/**
 * Fetch attendance logs by student ID
 */
const getAttendanceByStudent = async (studentId) => {
  const response = await api.get(`/attendance?studentId=${studentId}`);
  return response.data;
};

/**
 * Log or update attendance status for a student on a specific date
 */
const upsertAttendance = async (student_id, date, status) => {
  const response = await api.post('/attendance', { student_id, date, status });
  return response.data;
};

/**
 * Update an existing attendance record by record ID
 */
const updateAttendanceStatus = async (id, status) => {
  const response = await api.put(`/attendance/${id}`, { status });
  return response.data;
};

/**
 * Delete an attendance log by record ID
 */
const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};

export default {
  getAttendanceByDate,
  getAttendanceByStudent,
  upsertAttendance,
  updateAttendanceStatus,
  deleteAttendance
};
