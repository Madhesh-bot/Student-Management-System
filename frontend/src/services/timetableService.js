import api from './api';

const timetableService = {
  getTimetable: (departmentId, year, semester) => 
    api.get('/timetables', {
      params: { department_id: departmentId, year, semester }
    }),
  addSlot: (slotData) => api.post('/timetables', slotData),
  deleteSlot: (slotId) => api.delete(`/timetables/${slotId}`)
};

export default timetableService;
