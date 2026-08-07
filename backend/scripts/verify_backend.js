/**
 * Enterprise Backend Verification Suite
 * Tests every endpoint, database operation, constraint, validation, and feature.
 */
const BASE_URL = 'http://localhost:5000';

const runTests = async () => {
  console.log('🚀 Starting Enterprise Backend Verification Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failedCount++;
    }
  };

  let adminToken = '';
  let staffToken = '';
  let studentToken = '';
  let refreshToken = '';
  let createdStudentId = null;
  let createdMarksId = null;
  let createdAttendanceId = null;

  // 1. Health Check
  await test('1. Health Check Endpoint (GET /health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'UP') {
      throw new Error(`Unexpected status: ${data.status}`);
    }
  });

  // 2. Authentication - Admin Login
  await test('2. Admin Login & JWT Issuance (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sms.com', password: '123456' })
    });
    const data = await res.json();
    if (!data.success || !data.data.token) {
      throw new Error(data.message || 'Login failed');
    }
    adminToken = data.data.token;
    refreshToken = data.data.refreshToken;
  });

  // 3. Authentication - Staff Login
  await test('3. Staff Login (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@sms.com', password: '123456' })
    });
    const data = await res.json();
    if (!data.success || !data.data.token) {
      throw new Error(data.message || 'Staff login failed');
    }
    staffToken = data.data.token;
  });

  // 4. Authentication - Student Login
  await test('4. Student Login (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@sms.com', password: '123456' })
    });
    const data = await res.json();
    if (!data.success || !data.data.token) {
      throw new Error(data.message || 'Student login failed');
    }
    studentToken = data.data.token;
  });

  // 5. Refresh Token Rotation
  await test('5. Refresh Token Rotation (POST /api/auth/refresh-token)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: refreshToken })
    });
    const data = await res.json();
    if (!data.success || !data.data.token) {
      throw new Error(data.message || 'Refresh token failed');
    }
  });

  // 6. User Profile Lookup
  await test('6. Profile Lookup (GET /api/auth/profile)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || data.data.email !== 'admin@sms.com') {
      throw new Error('Profile lookup failed');
    }
  });

  // 7. Student Registry & CRUD
  await test('7. Add New Student Profile (POST /api/students)', async () => {
    const res = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        register_number: `REG_TEST_${Date.now()}`,
        student_name: 'Test Candidate',
        email: `candidate_${Date.now()}@example.com`,
        department_id: 1,
        year: 1,
        section: 'B',
        gender: 'Male',
        phone: '9998887770'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data.id) {
      throw new Error(data.message || 'Add student failed');
    }
    createdStudentId = data.data.id;
  });

  await test('8. Get Students List & Pagination (GET /api/students)', async () => {
    const res = await fetch(`${BASE_URL}/api/students?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Students list query failed');
    }
  });

  // 9. Marks Management & Components Storage
  await test('9. Record Marks Components (Internal, Assignment, Practical, Semester) (POST /api/marks)', async () => {
    const res = await fetch(`${BASE_URL}/api/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        student_id: createdStudentId,
        subject: 'Data Structures and Algorithms',
        internal_mark: 18,
        assignment_mark: 9,
        practical_mark: 18,
        semester_mark: 42,
        max_mark: 100
      })
    });
    const data = await res.json();
    if (!data.success || data.data.total_mark !== 87) {
      throw new Error(`Marks record calculation failed: total=${data.data ? data.data.total_mark : null}`);
    }
    if (data.data.grade !== 'A+' && data.data.grade !== 'O') {
      throw new Error(`Grade mapping failed: grade=${data.data.grade}`);
    }
    createdMarksId = data.data.id;
  });

  // 10. Result Generation (GPA/CGPA)
  await test('10. Generate Semester Result & GPA/CGPA (POST /api/marks/generate-result)', async () => {
    const res = await fetch(`${BASE_URL}/api/marks/generate-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ studentId: createdStudentId })
    });
    const data = await res.json();
    if (!data.success || data.data.gpa <= 0 || data.data.resultStatus !== 'Pass') {
      throw new Error(`Result generation failed: gpa=${data.data ? data.data.gpa : null}`);
    }
  });

  // 11. Attendance System Logging
  await test('11. Log Daily Attendance (POST /api/attendance)', async () => {
    const res = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        student_id: createdStudentId,
        date: '2026-08-01',
        status: 'Present',
        remarks: 'On time'
      })
    });
    const data = await res.json();
    if (!data.success || !data.data.id) {
      throw new Error(data.message || 'Log attendance failed');
    }
    createdAttendanceId = data.data.id;
  });

  // 12. Attendance Metrics Calculation (% Overall, Monthly, Yearly)
  await test('12. Calculate Attendance Percentage & Metrics (GET /api/attendance/metrics/:studentId)', async () => {
    const res = await fetch(`${BASE_URL}/api/attendance/metrics/${createdStudentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || data.data.attendancePercentage !== 100) {
      throw new Error(`Attendance metric failed: pct=${data.data ? data.data.attendancePercentage : null}`);
    }
  });

  // 13. Security Validation Test - Invalid Marks Rejection
  await test('13. Validation Security: Reject Out-Of-Bounds Marks (POST /api/marks)', async () => {
    const res = await fetch(`${BASE_URL}/api/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        student_id: createdStudentId,
        subject: 'Operating Systems',
        internal_mark: 999 // Invalid out of range
      })
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error('Validation failed to block invalid mark value');
    }
  });

  // 14. RBAC Security Test - Student Attempting Admin Action
  await test('14. RBAC Authorization: Reject Student from Admin Deletion (DELETE /api/students/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (res.status !== 403 || data.success !== false) {
      throw new Error('RBAC failed to block student role from admin endpoint');
    }
  });

  // 15. Audit Logging Verification
  await test('15. Audit Log Inspection (GET /api/audit)', async () => {
    const res = await fetch(`${BASE_URL}/api/audit`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Audit log retrieval failed');
    }
  });

  // 16. Soft Delete Student
  await test('16. Soft Delete Student (DELETE /api/students/:id)', async () => {
    const res = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error('Soft delete student failed');
    }
  });

  console.log('\n==================================================');
  console.log(`🎉 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
};

runTests();
