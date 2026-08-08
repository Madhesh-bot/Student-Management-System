import api from './api';

const INITIAL_SUBJECTS = [
  { id: 1, subject_name: 'Data Structures and Algorithms', subject_code: 'CS401', department_id: 1, department: 'Computer Science and Engineering' },
  { id: 2, subject_name: 'Database Management Systems', subject_code: 'IT402', department_id: 2, department: 'Information Technology' },
  { id: 3, subject_name: 'Operating Systems', subject_code: 'CS403', department_id: 1, department: 'Computer Science and Engineering' },
  { id: 4, subject_name: 'Computer Networks', subject_code: 'ECE404', department_id: 3, department: 'Electronics and Communication' }
];

const subjectService = {
  getSubjects: async (departmentId) => {
    try {
      const url = departmentId ? `/subjects?department_id=${departmentId}` : '/subjects';
      const res = await api.get(url);
      if (res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.subjects || []);
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem('sms_subjects', JSON.stringify(list));
          return { success: true, data: list };
        }
      }
    } catch (e) {}

    const saved = localStorage.getItem('sms_subjects');
    let subjects = INITIAL_SUBJECTS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) subjects = parsed;
      } catch (err) {}
    } else {
      localStorage.setItem('sms_subjects', JSON.stringify(INITIAL_SUBJECTS));
    }

    if (departmentId) {
      subjects = subjects.filter(s => String(s.department_id) === String(departmentId));
    }
    return { success: true, data: subjects };
  },

  addSubject: async (subjectData) => {
    const saved = localStorage.getItem('sms_subjects');
    const subjects = saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    const newSubject = { id: Date.now(), ...subjectData };
    subjects.push(newSubject);
    localStorage.setItem('sms_subjects', JSON.stringify(subjects));

    try {
      const res = await api.post('/subjects', subjectData);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true, data: newSubject };
  },

  deleteSubject: async (subjectId) => {
    const saved = localStorage.getItem('sms_subjects');
    if (saved) {
      const subjects = JSON.parse(saved).filter(s => String(s.id) !== String(subjectId));
      localStorage.setItem('sms_subjects', JSON.stringify(subjects));
    }

    try {
      const res = await api.delete(`/subjects/${subjectId}`);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true };
  }
};

export default subjectService;
