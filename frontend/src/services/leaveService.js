import api from './api';
import firestoreService from './firestoreService';
import authService from './authService';

const INITIAL_LEAVES = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Madhesh K',
    register_number: 'REG1002',
    start_date: '2026-08-09',
    end_date: '2026-08-11',
    reason: 'Medical Leave - High Fever',
    status: 'Pending'
  },
  {
    id: 2,
    student_id: 1,
    student_name: 'Alice Smith',
    register_number: 'REG1001',
    start_date: '2026-08-01',
    end_date: '2026-08-03',
    reason: 'Family Emergency',
    status: 'Approved'
  }
];

const getStoredLeaves = () => {
  const saved = localStorage.getItem('sms_leaves');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('sms_leaves', JSON.stringify(INITIAL_LEAVES));
  return INITIAL_LEAVES;
};

const setStoredLeaves = (list) => {
  localStorage.setItem('sms_leaves', JSON.stringify(list));
};

const leaveService = {
  getLeaves: async () => {
    try {
      const response = await api.get('/leaves');
      if (response.data) {
        const list = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
        if (list.length > 0) {
          setStoredLeaves(list);
          return { success: true, data: list };
        }
      }
    } catch (err) {}

    const localList = getStoredLeaves();
    return { success: true, data: localList };
  },

  requestLeave: async (startDate, endDate, reason) => {
    const currentUser = authService.getCurrentUser() || {};
    const newLeave = {
      id: Date.now(),
      student_id: currentUser.id || Date.now(),
      student_name: currentUser.name || currentUser.email?.split('@')[0] || 'Student User',
      register_number: currentUser.register_number || 'REG1002',
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const currentLeaves = getStoredLeaves();
    const updatedLeaves = [newLeave, ...currentLeaves];
    setStoredLeaves(updatedLeaves);

    // Non-blocking REST API
    api.post('/leaves', { start_date: startDate, end_date: endDate, reason }).catch(() => {});

    return { success: true, data: newLeave };
  },

  decideLeave: async (leaveId, status) => {
    const currentLeaves = getStoredLeaves();
    const updatedLeaves = currentLeaves.map(l => String(l.id) === String(leaveId) ? { ...l, status } : l);
    setStoredLeaves(updatedLeaves);

    // Non-blocking REST API
    api.put(`/leaves/${leaveId}`, { status }).catch(() => {});

    return { success: true };
  }
};

export default leaveService;
