import api from './api';
import firestoreService from './firestoreService';

const INITIAL_MARKS = [
  { id: 1, student_id: 1, student_name: 'Alice Smith', subject: 'Data Structures and Algorithms', internal_mark: 18, assignment_mark: 9, practical_mark: 18, semester_mark: 45, total: 90, grade: 'O' },
  { id: 2, student_id: 2, student_name: 'Madhesh K', subject: 'Database Management Systems', internal_mark: 19, assignment_mark: 10, practical_mark: 19, semester_mark: 47, total: 95, grade: 'O' },
  { id: 3, student_id: 3, student_name: 'Bob Johnson', subject: 'Operating Systems', internal_mark: 14, assignment_mark: 7, practical_mark: 15, semester_mark: 38, total: 74, grade: 'A' },
  { id: 4, student_id: 4, student_name: 'Carol Williams', subject: 'Computer Networks', internal_mark: 16, assignment_mark: 8, practical_mark: 16, semester_mark: 42, total: 82, grade: 'A+' }
];

const getStoredMarks = () => {
  const saved = localStorage.getItem('sms_marks');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('sms_marks', JSON.stringify(INITIAL_MARKS));
  return INITIAL_MARKS;
};

const setStoredMarks = (list) => {
  localStorage.setItem('sms_marks', JSON.stringify(list));
};

const getMarksByStudent = async (studentId) => {
  try {
    const response = await api.get(`/marks?studentId=${studentId}`);
    if (response.data) return response.data;
  } catch (err) {}

  const marks = getStoredMarks();
  const filtered = marks.filter(m => String(m.student_id) === String(studentId));
  return { success: true, data: filtered.length > 0 ? filtered : marks };
};

const getMarksBySubject = async (subject) => {
  try {
    const response = await api.get(`/marks?subject=${encodeURIComponent(subject)}`);
    if (response.data) return response.data;
  } catch (err) {}

  const marks = getStoredMarks();
  const filtered = marks.filter(m => (m.subject || '').toLowerCase().includes((subject || '').toLowerCase()));
  return { success: true, data: filtered.length > 0 ? filtered : marks };
};

const upsertMarks = async (student_id, subject, internal_mark = 0, assignment_mark = 0, practical_mark = 0, semester_mark = 0, max_mark = 100) => {
  const total = Number(internal_mark) + Number(assignment_mark) + Number(practical_mark) + Number(semester_mark);
  const grade = total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B+' : total >= 50 ? 'B' : total >= 40 ? 'C' : 'F';
  
  const marks = getStoredMarks();
  const newMark = { id: Date.now(), student_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, max_mark, total, grade };
  marks.unshift(newMark);
  setStoredMarks(marks);

  firestoreService.saveMarks(newMark).catch(() => {});

  try {
    const response = await api.post('/marks', { student_id, subject, internal_mark, assignment_mark, practical_mark, semester_mark, max_mark });
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true, data: newMark };
};

const updateMarks = async (id, internal_mark, assignment_mark, practical_mark, semester_mark, max_mark = 100) => {
  const total = Number(internal_mark) + Number(assignment_mark) + Number(practical_mark) + Number(semester_mark);
  const grade = total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B+' : total >= 50 ? 'B' : total >= 40 ? 'C' : 'F';

  const marks = getStoredMarks();
  const updated = marks.map(m => String(m.id) === String(id) ? { ...m, internal_mark, assignment_mark, practical_mark, semester_mark, max_mark, total, grade } : m);
  setStoredMarks(updated);

  try {
    const response = await api.put(`/marks/${id}`, { internal_mark, assignment_mark, practical_mark, semester_mark, max_mark });
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true };
};

const deleteMarks = async (id) => {
  const marks = getStoredMarks();
  const filtered = marks.filter(m => String(m.id) !== String(id));
  setStoredMarks(filtered);

  try {
    const response = await api.delete(`/marks/${id}`);
    if (response.data) return response.data;
  } catch (err) {}

  return { success: true };
};

export default {
  getMarksByStudent,
  getMarksBySubject,
  upsertMarks,
  updateMarks,
  deleteMarks
};
