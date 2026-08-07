import api from './api';

const subjectService = {
  getSubjects: (departmentId) => {
    const url = departmentId ? `/subjects?department_id=${departmentId}` : '/subjects';
    return api.get(url);
  },
  addSubject: (subjectData) => api.post('/subjects', subjectData),
  deleteSubject: (subjectId) => api.delete(`/subjects/${subjectId}`)
};

export default subjectService;
