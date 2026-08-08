import React, { useState, useEffect } from 'react';
import marksService from '../services/marksService';
import studentService from '../services/studentService';
import authService from '../services/authService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

/**
 * Marks and Academic Evaluation Module Page Component
 * Supports Internal, Assignment, Practical, and Semester Exam Marks Editing
 */
const Marks = () => {
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser && currentUser.role === 'student';
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState('mark'); 
  const [subject, setSubject] = useState('Data Structures and Algorithms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [studentsList, setStudentsList] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [localSearch, setLocalSearch] = useState('');
  
  const [selectedLookupStudent, setSelectedLookupStudent] = useState('');
  const [activeReportCard, setActiveReportCard] = useState([]);

  // Grade calculation helper
  const computeGrade = (totalScore) => {
    if (totalScore >= 90) return { grade: 'S', status: 'Pass' };
    if (totalScore >= 80) return { grade: 'A', status: 'Pass' };
    if (totalScore >= 70) return { grade: 'B', status: 'Pass' };
    if (totalScore >= 60) return { grade: 'C', status: 'Pass' };
    if (totalScore >= 50) return { grade: 'D', status: 'Pass' };
    if (totalScore >= 40) return { grade: 'E', status: 'Pass' };
    return { grade: 'F', status: 'Fail' };
  };

  const loadAllData = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (isStudent) {
        let studentProfile = null;
        try {
          const meRes = await studentService.getStudentMe();
          studentProfile = meRes.data?.student || meRes.data;
        } catch (e) {
          const studentsRes = await studentService.getAllStudents(1, 1000);
          const allStudents = studentsRes.data || [];
          setStudentsList(allStudents);
          studentProfile = allStudents.find(s => 
            s.user_id === currentUser?.id || 
            s.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
            s.register_number?.toLowerCase() === currentUser?.email?.toLowerCase()
          );
        }

        if (studentProfile) {
          setSelectedLookupStudent(studentProfile.id);
          const reportRes = await marksService.getMarksByStudent(studentProfile.id);
          const rawMarks = reportRes.data?.marks || reportRes.data || [];
          setActiveReportCard(Array.isArray(rawMarks) ? rawMarks : []);
        } else {
          setError('No corresponding student profile found for your login account.');
        }
      } else {
        const studentsRes = await studentService.getAllStudents(1, 1000);
        const allStudents = studentsRes.data || [];
        setStudentsList(allStudents);
        await loadMarkingSheet(allStudents);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initialize academic marks data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [subject, isStudent, currentUser?.email, currentUser?.id]);

  const loadMarkingSheet = async (allStudents) => {
    try {
      const subjectMarksRes = await marksService.getMarksBySubject(subject);
      const existingMarks = subjectMarksRes.data || [];

      const initialSheet = allStudents.map(student => {
        const existingRecord = existingMarks.find(m => m.student_id === student.id);
        return {
          student_id: student.id,
          register_number: student.register_number || student.reg_no || '',
          student_name: student.student_name || student.name || 'Unknown Student',
          department: student.department || student.dept_name || '',
          internal_mark: existingRecord ? existingRecord.internal_mark : 0,
          assignment_mark: existingRecord ? existingRecord.assignment_mark || 0 : 0,
          practical_mark: existingRecord ? existingRecord.practical_mark || 0 : 0,
          semester_mark: existingRecord ? existingRecord.semester_mark : 0,
          record_id: existingRecord ? existingRecord.id : null
        };
      });

      setMarksList(initialSheet);
    } catch (err) {
      console.error('Error fetching subject marks sheet:', err);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setMarksList(prev => prev.map(item => {
      if (item.student_id === studentId) {
        return { ...item, [field]: num };
      }
      return item;
    }));
  };

  const handleSaveMarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = marksList.map(item => {
        return marksService.upsertMarks(
          item.student_id,
          subject,
          item.internal_mark,
          item.assignment_mark,
          item.practical_mark,
          item.semester_mark
        );
      });

      await Promise.all(promises);
      showToast(`Exam component marks for ${subject} saved successfully!`, 'success');
      setSuccess(`Exam component marks for ${subject} saved successfully!`);
    } catch (err) {
      console.error(err);
      setError('Failed to save subject grades. Please verify input values.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupReportCard = async (e) => {
    const studentId = e.target.value;
    setSelectedLookupStudent(studentId);
    if (!studentId) {
      setActiveReportCard([]);
      return;
    }

    try {
      setLoading(true);
      const res = await marksService.getMarksByStudent(studentId);
      const rawMarks = res.data?.marks || res.data || [];
      setActiveReportCard(Array.isArray(rawMarks) ? rawMarks : []);
    } catch (err) {
      console.error(err);
      setError('Failed to query report card for selected student.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkingList = marksList.filter(item => {
    const term = localSearch.toLowerCase();
    const sName = (item.student_name || item.name || '').toLowerCase();
    const regNo = (item.register_number || item.reg_no || '').toLowerCase();
    const dept = (item.department || item.dept_name || '').toLowerCase();
    return sName.includes(term) || regNo.includes(term) || dept.includes(term);
  });

  return (
    <div className="marks-page page-transition-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isStudent ? 'My Report Card' : 'Academic Marks & Component Evaluation'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isStudent ? 'View your internal, assignment, practical, and semester exam grades.' : 'Manage student internal, assignment, practical, and semester exam component scores.'}
          </p>
        </div>

        {!isStudent && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={viewMode === 'mark' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('mark')}
            >
              Grade Subject Roster
            </Button>
            <Button
              variant={viewMode === 'lookup' ? 'primary' : 'secondary'}
              onClick={() => setViewMode('lookup')}
            >
              Student Report Card Lookup
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

      {/* Staff Mark View Mode */}
      {!isStudent && viewMode === 'mark' && (
        <Card title={`Grades Component Roster for ${subject}`}>
          <div className="search-filters" style={{ marginBottom: '24px' }}>
            <div style={{ maxWidth: '320px', width: '100%' }}>
              <Input
                label="Subject Selection"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                      <th>Internal (15)</th>
                      <th>Assignment (10)</th>
                      <th>Practical (15)</th>
                      <th>Semester Exam (60)</th>
                      <th>Total Score (100)</th>
                      <th>Grade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkingList.map((item) => {
                      const internal = parseFloat(item.internal_mark) || 0;
                      const assignment = parseFloat(item.assignment_mark) || 0;
                      const practical = parseFloat(item.practical_mark) || 0;
                      const semester = parseFloat(item.semester_mark) || 0;
                      const totalScore = internal + assignment + practical + semester;
                      const { grade, status } = computeGrade(totalScore);

                      return (
                        <tr key={item.student_id}>
                          <td><code>{item.register_number}</code></td>
                          <td style={{ fontWeight: '600' }}>{item.student_name}</td>
                          <td style={{ width: '100px' }}>
                            <input
                              type="number"
                              className="form-input"
                              min="0"
                              max="15"
                              value={item.internal_mark}
                              onChange={(e) => handleMarkChange(item.student_id, 'internal_mark', e.target.value)}
                            />
                          </td>
                          <td style={{ width: '100px' }}>
                            <input
                              type="number"
                              className="form-input"
                              min="0"
                              max="10"
                              value={item.assignment_mark}
                              onChange={(e) => handleMarkChange(item.student_id, 'assignment_mark', e.target.value)}
                            />
                          </td>
                          <td style={{ width: '100px' }}>
                            <input
                              type="number"
                              className="form-input"
                              min="0"
                              max="15"
                              value={item.practical_mark}
                              onChange={(e) => handleMarkChange(item.student_id, 'practical_mark', e.target.value)}
                            />
                          </td>
                          <td style={{ width: '100px' }}>
                            <input
                              type="number"
                              className="form-input"
                              min="0"
                              max="60"
                              value={item.semester_mark}
                              onChange={(e) => handleMarkChange(item.student_id, 'semester_mark', e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                            {totalScore.toFixed(2)}
                          </td>
                          <td>
                            <span style={{ fontWeight: '800', color: grade === 'F' ? 'var(--danger)' : 'var(--primary)' }}>
                              {grade}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${status === 'Pass' ? 'badge-present' : 'badge-absent'}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button variant="primary" onClick={handleSaveMarks} loading={loading}>
                  Save Component Grades Roster
                </Button>
              </div>
            </>
          ) : (
            <EmptyState icon="marks" title="No students found" subtitle="No students match the current subject criteria." />
          )}
        </Card>
      )}

      {/* Student View or Staff Lookup Mode */}
      {(isStudent || viewMode === 'lookup') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!isStudent && (
            <Card title="Query Student Report Card">
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label">Select Student</label>
                <select
                  className="form-select"
                  value={selectedLookupStudent}
                  onChange={handleLookupReportCard}
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

          <Card title="Subject Component Scores & Report Card">
            {loading ? (
              <SkeletonLoader type="table" rows={5} />
            ) : activeReportCard.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject Course</th>
                      <th>Internal</th>
                      <th>Assignment</th>
                      <th>Practical</th>
                      <th>Semester Exam</th>
                      <th>Total Score</th>
                      <th>Grade</th>
                      <th>Result Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReportCard.map((mark) => {
                      const total = parseFloat(mark.total || mark.total_mark || 0);
                      const isPass = mark.result_status === 'Pass' || total >= 40.0;

                      return (
                        <tr key={mark.id}>
                          <td style={{ fontWeight: '600' }}>{mark.subject}</td>
                          <td>{mark.internal_mark}</td>
                          <td>{mark.assignment_mark || 0}</td>
                          <td>{mark.practical_mark || 0}</td>
                          <td>{mark.semester_mark}</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{total.toFixed(2)}</td>
                          <td style={{ fontWeight: '700' }}>{mark.grade || '—'}</td>
                          <td>
                            <span className={`badge ${isPass ? 'badge-present' : 'badge-absent'}`}>
                              {isPass ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="marks" title="No report card logged" subtitle="No academic marks records are logged for this profile." />
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Marks;
