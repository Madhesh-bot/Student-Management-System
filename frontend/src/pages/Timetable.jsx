import React, { useState, useEffect } from 'react';
import timetableService from '../services/timetableService';
import departmentService from '../services/departmentService';
import subjectService from '../services/subjectService';
import authService from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const Timetable = () => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  const [timetable, setTimetable] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('1');
  const [selectedSem, setSelectedSem] = useState('1');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalDept, setModalDept] = useState('');
  const [modalSubject, setModalSubject] = useState('');
  const [modalYear, setModalYear] = useState('1');
  const [modalSem, setModalSem] = useState('1');
  const [modalDay, setModalDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');

  const loadInitialData = async () => {
    try {
      setError(null);
      const [deptRes, subjRes] = await Promise.all([
        departmentService.getDepartments(),
        subjectService.getSubjects()
      ]);
      setDepartments(deptRes.data.data || []);
      setSubjects(subjRes.data.data || []);

      if (deptRes.data.data && deptRes.data.data.length > 0) {
        setSelectedDept(deptRes.data.data[0].id.toString());
        setModalDept(deptRes.data.data[0].id.toString());
      }
      if (subjRes.data.data && subjRes.data.data.length > 0) {
        setModalSubject(subjRes.data.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load initial department/subject metadata.');
    } finally {
      setLoading(false);
    }
  };

  const loadGrid = async () => {
    if (!selectedDept || !selectedYear || !selectedSem) return;
    try {
      setLoading(true);
      setError(null);
      const res = await timetableService.getTimetable(selectedDept, selectedYear, selectedSem);
      setTimetable(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve class schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGrid();
  }, [selectedDept, selectedYear, selectedSem]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!modalDept || !modalSubject || !modalYear || !modalSem || !modalDay || !startTime || !endTime) {
      setError('All fields are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await timetableService.addSlot({
        department_id: parseInt(modalDept),
        year: parseInt(modalYear),
        semester: parseInt(modalSem),
        subject_id: parseInt(modalSubject),
        day_of_week: modalDay,
        start_time: startTime,
        end_time: endTime,
        room
      });
      setSuccess('Timetable slot added successfully.');
      setShowModal(false);
      // Reset inputs
      setStartTime('');
      setEndTime('');
      setRoom('');
      await loadGrid();
    } catch (err) {
      console.error(err);
      setError('Failed to add timetable slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this schedule slot?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await timetableService.deleteSlot(slotId);
      setSuccess('Timetable slot deleted successfully.');
      await loadGrid();
    } catch (err) {
      console.error(err);
      setError('Failed to delete slot.');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="timetable-wrapper space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title text-2xl font-extrabold tracking-tight">Academic Timetable</h1>
          <p style={{ color: 'var(--neutral-400)' }} className="text-sm">
            Select filters below to review weekly classroom schedules.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Schedule Slot
          </Button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Schedule Filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '16px', background: 'var(--bg-panel)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-400)' }}>Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="form-input"
            style={{ padding: '8px 12px', minWidth: '150px', background: 'transparent', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.dept_name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-400)' }}>Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-input"
            style={{ padding: '8px 12px', minWidth: '120px', background: 'transparent', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--neutral-400)' }}>Semester</label>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="form-input"
            style={{ padding: '8px 12px', minWidth: '120px', background: 'transparent', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
          >
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="spinner"></div>
        </div>
      )}

      {/* Grid columns */}
      {!loading && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {days.map((day) => {
              const slots = timetable.filter(t => t.day_of_week === day);
              return (
                <div key={day} className="space-y-4">
                  <h4 style={{ borderBottom: '1px solid var(--neutral-200)', paddingBottom: '8px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>
                    {day}
                  </h4>
                  <div className="space-y-3">
                    {slots.length > 0 ? (
                      slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="timetable-slot"
                          style={{
                            padding: '12px',
                            background: 'var(--neutral-100)',
                            border: '1px solid var(--neutral-200)',
                            borderRadius: 'var(--border-radius-sm)',
                            position: 'relative'
                          }}
                        >
                          <span className="block font-bold text-sm" style={{ color: 'var(--primary)' }}>
                            {slot.subject_name}
                          </span>
                          <span className="block text-xs" style={{ color: 'var(--neutral-400)', marginTop: '2px' }}>
                            {slot.subject_code} | Rm {slot.room || '-'}
                          </span>
                          <span className="block text-xs font-semibold mt-1" style={{ color: 'var(--neutral-700)' }}>
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                              title="Delete slot"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs italic" style={{ color: 'var(--neutral-400)' }}>No classes scheduled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
          <Card style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h3 className="mb-4" style={{ fontWeight: 'bold' }}>Add Timetable Schedule Slot</h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="form-label">Department</label>
                <select
                  value={modalDept}
                  onChange={(e) => setModalDept(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.dept_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Academic Year</label>
                  <select
                    value={modalYear}
                    onChange={(e) => setModalYear(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Semester</label>
                  <select
                    value={modalSem}
                    onChange={(e) => setModalSem(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Subject</label>
                <select
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Weekday</label>
                  <select
                    value={modalDay}
                    onChange={(e) => setModalDay(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)' }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Classroom / Lab</label>
                  <Input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. LH-4"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="btn-primary w-full">
                  Create Slot
                </Button>
                <Button type="button" onClick={() => setShowModal(false)} className="btn-secondary w-full">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Timetable;
