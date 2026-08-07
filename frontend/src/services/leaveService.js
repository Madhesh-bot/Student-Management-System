import api from './api';

const leaveService = {
  getLeaves: () => api.get('/leaves'),
  requestLeave: (startDate, endDate, reason) => 
    api.post('/leaves', { start_date: startDate, end_date: endDate, reason }),
  decideLeave: (leaveId, status) => 
    api.put(`/leaves/${leaveId}`, { status })
};

export default leaveService;
