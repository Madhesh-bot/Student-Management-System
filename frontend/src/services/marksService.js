import api from './api';

/**
 * Fetch marks report card for a specific student ID
 */
const getMarksByStudent = async (studentId) => {
  const response = await api.get(`/marks?studentId=${studentId}`);
  return response.data;
};

/**
 * Fetch student grades matching a subject name
 */
const getMarksBySubject = async (subject) => {
  const response = await api.get(`/marks?subject=${encodeURIComponent(subject)}`);
  return response.data;
};

/**
 * Create or update marks for a student in a subject (including components: internal, assignment, practical, semester)
 */
const upsertMarks = async (student_id, subject, internal_mark = 0, assignment_mark = 0, practical_mark = 0, semester_mark = 0, max_mark = 100) => {
  const response = await api.post('/marks', { 
    student_id, 
    subject, 
    internal_mark, 
    assignment_mark,
    practical_mark,
    semester_mark,
    max_mark
  });
  return response.data;
};

/**
 * Update marks record by ID
 */
const updateMarks = async (id, internal_mark, assignment_mark, practical_mark, semester_mark, max_mark = 100) => {
  const response = await api.put(`/marks/${id}`, { 
    internal_mark, 
    assignment_mark,
    practical_mark,
    semester_mark,
    max_mark
  });
  return response.data;
};

/**
 * Delete a marks record by record ID
 */
const deleteMarks = async (id) => {
  const response = await api.delete(`/marks/${id}`);
  return response.data;
};

export default {
  getMarksByStudent,
  getMarksBySubject,
  upsertMarks,
  updateMarks,
  deleteMarks
};
