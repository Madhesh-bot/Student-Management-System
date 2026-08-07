import api from './api';

/**
 * Fetch demographic breakdowns for students
 */
const getStudentReport = async () => {
  const response = await api.get('/reports/students');
  return response.data;
};

/**
 * Fetch logs breakdown for attendance rates
 */
const getAttendanceReport = async () => {
  const response = await api.get('/reports/attendance');
  return response.data;
};

/**
 * Fetch statistical grade distributions
 */
const getMarksReport = async () => {
  const response = await api.get('/reports/marks');
  return response.data;
};

export default {
  getStudentReport,
  getAttendanceReport,
  getMarksReport
};
