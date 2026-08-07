import api from './api';

const departmentService = {
  getDepartments: () => api.get('/departments'),
  addDepartment: (deptData) => api.post('/departments', deptData),
  deleteDepartment: (deptId) => api.delete(`/departments/${deptId}`)
};

export default departmentService;
