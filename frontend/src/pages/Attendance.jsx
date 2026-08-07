import React, { useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService';
import studentService from '../services/studentService';
import authService from '../services/authService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

/**
 * Attendance Registry & History Tracking Page Component
 */
const Attendance = () => {
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser && currentUser.role === 'student';

  const [viewMode, setViewMode] = useState('mark'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [studentsList, setStudentsList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState('');
  const [activeHistoryLogs, setActiveHistoryLogs] = useState([]);
  const [historyMetrics, setHistoryMetrics] = useState(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isStudent) {
        let studentProfile = null;
        try {
          const meRes = await studentService.getStudentMe();
          studentProfile = meRes.data?.student || meRes.data;
        } catch (e) {
          const studentsRes = await studentService.getAllStudents();
          const allStudents = studentsRes.data || [];
          setStudentsList(allStudents);
          studentProfile = allStudents.find(s => 
            s.user_id === currentUser?.id || 
            s.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
            s.register_number?.toLowerCase() === currentUser?.email?.toLowerCase()
          );
        }

        if (studentProfile) {
          setSelectedHistoryStudent(studentProfile.id);
          const historyRes = await attendanceService.getAttendanceByStudent(studentProfile.id);
          const logsData = historyRes.data?.logs || historyRes.data || [];
          const metricsData = historyRes.data?.metrics || null;
          setActiveHistoryLogs(Array.isArray(logsData) ? logsData : []);
          setHistoryMetrics(metricsData);
        } else {
          setError('No corresponding student profile found for your login account.');
        }
      } else {
        const studentsRes = await studentService.getAllStudents();
        const allStudents = studentsRes.data || [];
        setStudentsList(allStudents);
        await loadMarkingSheet(allStudents);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initialize attendance information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [date, isStudent, currentUser?.email, currentUser?.id]);

  const loadMarkingSheet = async (allStudents) => {
    try {
      const activeDateRes = await attendanceService.getAttendanceByDate(date);
      const loggedRecords = activeDateRes.data || [];

      const initialSheet = allStudents.map(student => {
        const existingRecord = loggedRecords.find(r => r.student_id === student.id);
        return {
          student_id: student.id,
          register_number: student.register_number,
          student_name: student.student_name,
          department: student.department,
          status: existingRecord ? existingRecord.status : 'Present',
          remarks: existingRecord ? (existingRecord.remarks || '') : '',
          record_id: existingRecord ? existingRecord.id : null
        };
      });

      setAttendanceList(initialSheet);
    } catch (err) {
      console.error('Error fetching date sheet:', err);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.student_id === studentId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const promises = attendanceList.map(item => {
        return attendanceService.upsertAttendance(item.student_id, date, item.status);
      });

      await Promise.all(promises);
      setSuccess(`Attendance roster for ${date} saved successfully!`);
    } catch (err) {
      console.error(err);
      setError('Failed to save attendance logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupHistory = async (e) => {
    const studentId = e.target.value;
    setSelectedHistoryStudent(studentId);
    if (!studentId) {
      setActiveHistoryLogs([]);
      setHistoryMetrics(null);
      return;
    }

    try {
      setLoading(true);
      const res = await attendanceService.getAttendanceByStudent(studentId);
      const logsData = res.data?.logs || res.data || [];
      const metricsData = res.data?.metrics || null;
      setActiveHistoryLogs(Array.isArray(logsData) ? logsData : []);
      setHistoryMetrics(metricsData);
    } catch (err) {
      console.error(err);
      setError('Failed to query history logs for selected student.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkingList = attendanceList.filter(item => {
    const term = localSearch.toLowerCase();
    return item.student_name.toLowerCase().includes(term) ||
           item.register_number.toLowerCase().includes(term) ||
           (item.department && item.department.toLowerCase().includes(term));
  });

  return (
    <div className="attendance-page page-transition-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isStudent ? 'My Attendance Record' : 'Attendance Register'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isStudent ? 'View your daily attendance logs and overall percentage.' : 'Log daily attendance rosters or query student history logs.'}
          </p>
        </div>

        {!isStudent && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={viewMode === 'mark' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('mark')}
            >
              Mark Roster
            </Button>
            <Button
              variant={viewMode === 'history' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('history')}
            >
              Student History Lookup
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <span>{success}</span>
        </div>
      )}

      {/* Staff Mark Mode */}
      {!isStudent && viewMode === 'mark' && (
        <Card title={`Attendance Roster for ${date}`}>
          <div className="search-filters" style={{ marginBottom: '24px' }}>
            <div style={{ maxWidth: '240px', width: '100%' }}>
              <Input
                label="Date Selection"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div className="search-box" style={{ marginTop: '24px', flexGrow: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                className="form-input"
                placeholder="Search roster by student name or reg..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <SkeletonLoader type="table" rows={6} />
          ) : filteredMarkingList.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Register No</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkingList.map((item) => (
                      <tr key={item.student_id}>
                        <td><code>{item.register_number}</code></td>
                        <td style={{ fontWeight: '600' }}>{item.student_name}</td>
                        <td>{item.department}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['Present', 'Absent', 'Late', 'Leave'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(item.student_id, st)}
                                className={`badge ${item.status === st ? (
                                  st === 'Present' ? 'badge-present' :
                                  st === 'Absent' ? 'badge-absent' :
                                  st === 'Late' ? 'badge-late' : 'badge-excused'
                                ) : 'badge-student'}`}
                                style={{
                                  cursor: 'pointer',
                                  border: item.status === st ? '2px solid currentColor' : '1px solid var(--border-color)',
                                  padding: '6px 12px'
                                }}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button variant="primary" onClick={handleSaveAttendance} loading={loading}>
                  Save Daily Attendance Roster
                </Button>
              </div>
            </>
          ) : (
            <EmptyState icon="attendance" title="No students found" subtitle="No students matched your roster filter." />
          )}
        </Card>
      )}

      {/* History Lookup View (Or Student View) */}
      {(isStudent || viewMode === 'history') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!isStudent && (
            <Card title="Query Student Attendance History">
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label">Select Student</label>
                <select
                  className="form-select"
                  value={selectedHistoryStudent}
                  onChange={handleLookupHistory}
                >
                  <option value="">-- Choose Student --</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.register_number} - {s.student_name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {historyMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{historyMetrics.attendancePercentage}%</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Overall Attendance</span>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>{historyMetrics.present}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Present Days</span>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)' }}>{historyMetrics.absent}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Absent Days</span>
              </div>
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--warning)' }}>{historyMetrics.late}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Late Days</span>
              </div>
            </div>
          )}

          <Card title="Attendance Logs">
            {loading ? (
              <SkeletonLoader type="table" rows={5} />
            ) : activeHistoryLogs.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeHistoryLogs.map((log) => {
                      let badgeClass = 'badge-excused';
                      if (log.status === 'Present') badgeClass = 'badge-present';
                      if (log.status === 'Absent') badgeClass = 'badge-absent';
                      if (log.status === 'Late') badgeClass = 'badge-late';

                      return (
                        <tr key={log.id}>
                          <td style={{ fontWeight: '600' }}>{new Date(log.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>{log.status}</span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{log.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="attendance" title="No attendance logs" subtitle="No attendance records available for lookup." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Attendance;
