import api from './api';

const INITIAL_DEPTS = [
  { id: 1, dept_name: 'Computer Science and Engineering', code: 'CSE', hod_name: 'Dr. Alan Turing' },
  { id: 2, dept_name: 'Information Technology', code: 'IT', hod_name: 'Dr. Grace Hopper' },
  { id: 3, dept_name: 'Electronics and Communication', code: 'ECE', hod_name: 'Dr. Claude Shannon' }
];

const departmentService = {
  getDepartments: async () => {
    try {
      const res = await api.get('/departments');
      if (res.data) return res.data;
    } catch (e) {}

    const saved = localStorage.getItem('sms_departments');
    let depts = INITIAL_DEPTS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) depts = parsed;
      } catch (err) {}
    } else {
      localStorage.setItem('sms_departments', JSON.stringify(INITIAL_DEPTS));
    }
    return { success: true, data: depts };
  },

  addDepartment: async (deptData) => {
    const saved = localStorage.getItem('sms_departments');
    const depts = saved ? JSON.parse(saved) : INITIAL_DEPTS;
    const newDept = { id: Date.now(), ...deptData };
    depts.push(newDept);
    localStorage.setItem('sms_departments', JSON.stringify(depts));

    try {
      const res = await api.post('/departments', deptData);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true, data: newDept };
  },

  deleteDepartment: async (deptId) => {
    const saved = localStorage.getItem('sms_departments');
    if (saved) {
      const depts = JSON.parse(saved).filter(d => String(d.id) !== String(deptId));
      localStorage.setItem('sms_departments', JSON.stringify(depts));
    }

    try {
      const res = await api.delete(`/departments/${deptId}`);
      if (res.data) return res.data;
    } catch (e) {}

    return { success: true };
  }
};

export default departmentService;
