import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import studentService from '../services/studentService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

/**
 * Administrative Reports, Summaries, and Spreadsheet Exports Page
 */
const Reports = () => {
  const [activeTab, setActiveTab] = useState('student-list'); // 'student-list', 'demographics', 'attendance', 'grades'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data sets
  const [allStudents, setAllStudents] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState(null);

  // Search & Filter states for Student List Report
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('');

  // Search & Filter states for Attendance Report
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Search & Filter states for Marks Report
  const [marksSearch, setMarksSearch] = useState('');

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reports and full student profiles list in parallel (unpaginated list for exporting/printing)
      const [studentsListRes, studentsRep, attendanceRep, marksRep] = await Promise.all([
        studentService.getAllStudents(),
        reportService.getStudentReport(),
        reportService.getAttendanceReport(),
        reportService.getMarksReport()
      ]);

      setAllStudents(studentsListRes.data);
      setStudentData(studentsRep.data);
      setAttendanceData(attendanceRep.data);
      setMarksData(marksRep.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to compute reports. Check your backend status and SQL tables initialization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Reusable CSV Download Exporter helper
  const exportToCSV = (headers, rows, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // Filter & Export logic: Tab 1 (Student List)
  // -------------------------------------------------------------
  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.register_number.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesDept = studentDeptFilter ? s.department === studentDeptFilter : true;
    const matchesYear = studentYearFilter ? String(s.year) === studentYearFilter : true;
    return matchesSearch && matchesDept && matchesYear;
  });

  // Extract unique departments for dropdown filters
  const uniqueDepartments = [...new Set(allStudents.map(s => s.department))];

  const handleExportStudentList = () => {
    const headers = ['Register Number', 'Student Name', 'Department', 'Year', 'Section', 'Gender', 'Email', 'Phone', 'Address', 'Admission Date'];
    const rows = filteredStudents.map(s => [
      s.register_number,
      s.student_name,
      s.department,
      `${s.year} Year`,
      s.section,
      s.gender,
      s.email,
      s.phone || '',
      s.address || '',
      new Date(s.created_at).toLocaleDateString()
    ]);
    exportToCSV(headers, rows, 'student_list_report.csv');
  };

  // -------------------------------------------------------------
  // Export logic: Tab 2 (Demographics)
  // -------------------------------------------------------------
  const handleExportDemographics = () => {
    const headers = ['Report Category', 'Metric Name', 'Student Count', 'Percentage Ratio'];
    const rows = [];
    
    studentData.departments.forEach(d => {
      const pct = studentData.totalStudents > 0 ? ((d.count / studentData.totalStudents) * 100).toFixed(1) : 0;
      rows.push(['Department Breakdown', d.department, d.count, `${pct}%`]);
    });

    studentData.years.forEach(y => {
      const pct = studentData.totalStudents > 0 ? ((y.count / studentData.totalStudents) * 100).toFixed(1) : 0;
      rows.push(['Academic Year Split', `${y.year} Year`, y.count, `${pct}%`]);
    });

    studentData.gender.forEach(g => {
      const pct = studentData.totalStudents > 0 ? ((g.count / studentData.totalStudents) * 100).toFixed(1) : 0;
      rows.push(['Gender Ratio', g.gender, g.count, `${pct}%`]);
    });

    exportToCSV(headers, rows, 'student_demographics_summary.csv');
  };

  // -------------------------------------------------------------
  // Filter & Export logic: Tab 3 (Attendance)
  // -------------------------------------------------------------
  const filteredAttendanceSummary = attendanceData?.studentSummary.filter(s => 
    s.student_name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    s.register_number.toLowerCase().includes(attendanceSearch.toLowerCase())
  ) || [];

  const handleExportAttendance = () => {
    const headers = ['Student Name', 'Register Number', 'Department', 'Year', 'Section', 'Days Present', 'Days Absent', 'Days Late', 'Days Excused', 'Total Days', 'Attendance Rate'];
    const rows = filteredAttendanceSummary.map(s => [
      s.student_name,
      s.register_number,
      s.department,
      `${s.year} Year`,
      s.section,
      s.days_present,
      s.days_absent,
      s.days_late,
      s.days_excused,
      s.total_days,
      s.attendance_percentage !== null ? `${s.attendance_percentage}%` : 'N/A'
    ]);
    exportToCSV(headers, rows, 'attendance_metric_report.csv');
  };

  // -------------------------------------------------------------
  // Filter & Export logic: Tab 4 (Grades)
  // -------------------------------------------------------------
  const filteredMarksSummary = marksData?.subjectStatistics.filter(stat => 
    stat.subject.toLowerCase().includes(marksSearch.toLowerCase())
  ) || [];

  const handleExportMarks = () => {
    const headers = ['Subject Course', 'Students Graded', 'Avg Internal', 'Avg Semester', 'Avg Total Score', 'Highest Score', 'Lowest Score', 'Pass Percentage'];
    const rows = filteredMarksSummary.map(stat => [
      stat.subject,
      stat.total_graded,
      stat.avg_internal,
      stat.avg_semester,
      stat.avg_total,
      stat.max_total,
      stat.min_total,
      `${stat.pass_percentage}%`
    ]);
    exportToCSV(headers, rows, 'academic_grades_report.csv');
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-wrapper">
      
      {/* Page Header (hidden in printer mode) */}
      <div className="page-header print-hide">
        <div>
          <h1 className="page-title">School Reports & Analysis</h1>
          <p style={{ color: 'var(--neutral-400)' }}>Inspect school registries, attendance histories, and examination distributions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={handlePrint}>
            {/* SVG Print */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Export PDF
          </Button>
          
          {activeTab === 'student-list' && (
            <Button variant="primary" onClick={handleExportStudentList}>Export Excel</Button>
          )}
          {activeTab === 'demographics' && (
            <Button variant="primary" onClick={handleExportDemographics}>Export Excel</Button>
          )}
          {activeTab === 'attendance' && (
            <Button variant="primary" onClick={handleExportAttendance}>Export Excel</Button>
          )}
          {activeTab === 'grades' && (
            <Button variant="primary" onClick={handleExportMarks}>Export Excel</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger print-hide" style={{ marginBottom: '24px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu Selection (hidden in printer mode) */}
      <div className="reports-tabs print-hide" style={{ display: 'flex', borderBottom: '2px solid var(--neutral-200)', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('student-list')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'student-list' ? 'var(--primary)' : 'var(--neutral-400)',
            borderBottom: activeTab === 'student-list' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Student List
        </button>
        <button
          onClick={() => setActiveTab('demographics')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'demographics' ? 'var(--primary)' : 'var(--neutral-400)',
            borderBottom: activeTab === 'demographics' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Demographics (Dept & Year)
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'attendance' ? 'var(--primary)' : 'var(--neutral-400)',
            borderBottom: activeTab === 'attendance' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Attendance Summary
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 6px',
            fontSize: '1rem',
            fontWeight: '600',
            color: activeTab === 'grades' ? 'var(--primary)' : 'var(--neutral-400)',
            borderBottom: activeTab === 'grades' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-2px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Grades Summary
        </button>
      </div>

      {/* -------------------------------------------------------------
          1. Student List Report Tab
         ------------------------------------------------------------- */}
      {activeTab === 'student-list' && (
        <Card title={`Student Registry Report (${filteredStudents.length} Students)`}>
          
          {/* Filters section (hidden in printer mode) */}
          <div className="search-filters print-hide" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '24px' }} >
            <div className="search-box w-full" style={{ maxWidth: '100%', marginBottom: '0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Search name or register number..."
                className="form-input"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '0' }}>
              <select
                className="form-input form-select"
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
              >
                <option value="">-- All Departments --</option>
                {uniqueDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <select
                className="form-input form-select"
                value={studentYearFilter}
                onChange={(e) => setStudentYearFilter(e.target.value)}
              >
                <option value="">-- All Years --</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Year / Sec</th>
                    <th>Gender</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.register_number}</td>
                      <td>{s.student_name}</td>
                      <td>{s.department}</td>
                      <td>{s.year} Yr - {s.section}</td>
                      <td>{s.gender}</td>
                      <td>{s.email}</td>
                      <td>{s.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '20px 0' }}>No corresponding student profiles found.</p>
          )}
        </Card>
      )}

      {/* -------------------------------------------------------------
          2. Demographics (Department / Year Wise) Report Tab
         ------------------------------------------------------------- */}
      {activeTab === 'demographics' && studentData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="report-grid">
          
          <Card title="Department Wise Registry Split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {studentData.departments.length > 0 ? (
                studentData.departments.map((dept) => {
                  const percent = studentData.totalStudents > 0 
                    ? ((dept.count / studentData.totalStudents) * 100).toFixed(0) 
                    : 0;
                  return (
                    <div key={dept.department} className="report-item">
                      <div className="progress-details">
                        <span>{dept.department}</span>
                        <span style={{ fontWeight: '700' }}>{dept.count} students ({percent}%)</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--neutral-400)' }}>No departments configured.</p>
              )}
            </div>
          </Card>

          <Card title="Year Wise & Gender Split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--neutral-400)', fontWeight: '600', marginBottom: '12px' }}>By Year Level</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {studentData.years.length > 0 ? (
                    studentData.years.map((y) => {
                      const percent = studentData.totalStudents > 0 
                        ? ((y.count / studentData.totalStudents) * 100).toFixed(0) 
                        : 0;
                      return (
                        <div key={y.year} className="report-item" style={{ marginTop: '0' }}>
                          <div className="progress-details" style={{ fontSize: '0.85rem' }}>
                            <span>{y.year} Year</span>
                            <span>{y.count} ({percent}%)</span>
                          </div>
                          <div className="progress-bar-container" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${percent}%`, backgroundColor: 'var(--success)' }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--neutral-400)' }}>-</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--neutral-400)', fontWeight: '600', marginBottom: '12px' }}>By Gender Ratio</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {studentData.gender.length > 0 ? (
                    studentData.gender.map((g) => {
                      const percent = studentData.totalStudents > 0 
                        ? ((g.count / studentData.totalStudents) * 100).toFixed(0) 
                        : 0;
                      return (
                        <div key={g.gender} className="report-item" style={{ marginTop: '0' }}>
                          <div className="progress-details" style={{ fontSize: '0.85rem' }}>
                            <span>{g.gender}</span>
                            <span>{g.count} ({percent}%)</span>
                          </div>
                          <div className="progress-bar-container" style={{ height: '6px' }}>
                            <div className="progress-bar-fill" style={{ width: `${percent}%`, backgroundColor: 'var(--info)' }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--neutral-400)' }}>-</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* -------------------------------------------------------------
          3. Attendance Performance Report Tab
         ------------------------------------------------------------- */}
      {activeTab === 'attendance' && attendanceData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="report-grid">
          
          <Card title="Roster Logs Distribution">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {attendanceData.statusDistribution.length > 0 ? (
                attendanceData.statusDistribution.map((dist) => {
                  let barColor = 'var(--primary)';
                  if (dist.status === 'Present') barColor = 'var(--success)';
                  if (dist.status === 'Absent') barColor = 'var(--danger)';
                  if (dist.status === 'Late') barColor = 'var(--warning)';
                  if (dist.status === 'Excused') barColor = 'var(--info)';

                  return (
                    <div key={dist.status} className="report-item">
                      <div className="progress-details">
                        <span>{dist.status} Logs</span>
                        <span style={{ fontWeight: '700' }}>{dist.count} ({dist.percentage}%)</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${dist.percentage}%`, backgroundColor: barColor }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--neutral-400)' }}>No attendance logs stored.</p>
              )}
            </div>
          </Card>

          <Card title="Student Attendance Metrics Table">
            
            {/* Local Search (hidden in printer mode) */}
            <div className="search-box w-full print-hide" style={{ maxWidth: '320px', marginBottom: '20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Search student name or register..."
                className="form-input"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
              />
            </div>

            {filteredAttendanceSummary.length > 0 ? (
              <div className="table-responsive" style={{ border: 'none', boxShadow: 'none', margin: '0', maxHeight: '380px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Register No</th>
                      <th>Student Name</th>
                      <th>Class Logs</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendanceSummary.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '600' }}>{s.register_number}</td>
                        <td>{s.student_name}</td>
                        <td>{s.days_present} / {s.total_days} days</td>
                        <td style={{ fontWeight: '700', color: parseFloat(s.attendance_percentage) >= 75.00 ? 'var(--success)' : 'var(--danger)' }}>
                          {s.attendance_percentage !== null ? `${s.attendance_percentage}%` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--neutral-400)' }}>No history registers available.</p>
            )}
          </Card>
        </div>
      )}

      {/* -------------------------------------------------------------
          4. Subject Grades Report Tab
         ------------------------------------------------------------- */}
      {activeTab === 'grades' && marksData && (
        <Card title="Subject GPA & Pass Rate distribution">
          
          {/* Local Search (hidden in printer mode) */}
          <div className="search-box w-full print-hide" style={{ maxWidth: '320px', marginBottom: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search subject course..."
              className="form-input"
              value={marksSearch}
              onChange={(e) => setMarksSearch(e.target.value)}
            />
          </div>

          {filteredMarksSummary.length > 0 ? (
            <div className="table-responsive" style={{ border: 'none', boxShadow: 'none', margin: '0' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Course</th>
                    <th>Total Graded</th>
                    <th>Avg Internal (25)</th>
                    <th>Avg Semester (75)</th>
                    <th>Average Score (100)</th>
                    <th>Highest Score</th>
                    <th>Lowest Score</th>
                    <th>Pass Rate Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarksSummary.map((stat) => (
                    <tr key={stat.subject}>
                      <td style={{ fontWeight: '600' }}>{stat.subject}</td>
                      <td>{stat.total_graded} students</td>
                      <td>{stat.avg_internal}</td>
                      <td>{stat.avg_semester}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{stat.avg_total}</td>
                      <td>{stat.max_total}</td>
                      <td>{stat.min_total}</td>
                      <td style={{ fontWeight: '700', color: parseFloat(stat.pass_percentage) >= 50.00 ? 'var(--success)' : 'var(--danger)' }}>
                        {stat.pass_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--neutral-400)', padding: '20px 0' }}>No matching subject grade records found.</p>
          )}
        </Card>
      )}

      {/* Global Print Styling Blocks */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 12px !important;
          }
          .sidebar, .navbar, .reports-tabs, .print-hide, button, .btn {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .page-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .table-responsive {
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
          }
          .data-table th {
            background-color: #f1f3f5 !important;
            border-bottom: 2px solid #dee2e6 !important;
            color: #000000 !important;
          }
          .data-table td {
            border-bottom: 1px solid #dee2e6 !important;
          }
        }
        @media (max-width: 576px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default Reports;
