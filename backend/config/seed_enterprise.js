/**
 * Seed Enterprise Database Script
 * Inserts roles, default users, grade scale, departments, courses, subjects, academic years, semesters, settings.
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_management',
    multipleStatements: true
  });

  console.log('🌱 Connected to database for seeding...');

  try {
    // 1. Seed Roles
    const roles = [
      { id: 1, role_name: 'admin', description: 'Administrator with full system access' },
      { id: 2, role_name: 'staff', description: 'Academic staff and faculty' },
      { id: 3, role_name: 'student', description: 'Enrolled student' }
    ];
    for (const r of roles) {
      await connection.query(
        `INSERT INTO roles (id, role_name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [r.id, r.role_name, r.description]
      );
    }

    // 2. Seed Grade Scale
    const grades = [
      { grade: 'O', min_score: 90.0, max_score: 100.0, grade_point: 10.0, description: 'Outstanding' },
      { grade: 'A+', min_score: 80.0, max_score: 89.99, grade_point: 9.0, description: 'Excellent' },
      { grade: 'A', min_score: 70.0, max_score: 79.99, grade_point: 8.0, description: 'Very Good' },
      { grade: 'B+', min_score: 60.0, max_score: 69.99, grade_point: 7.0, description: 'Good' },
      { grade: 'B', min_score: 50.0, max_score: 59.99, grade_point: 6.0, description: 'Above Average' },
      { grade: 'C', min_score: 40.0, max_score: 49.99, grade_point: 5.0, description: 'Pass' },
      { grade: 'F', min_score: 0.0, max_score: 39.99, grade_point: 0.0, description: 'Fail' }
    ];
    for (const g of grades) {
      await connection.query(
        `INSERT INTO grade_scale (grade, min_score, max_score, grade_point, description) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE min_score=VALUES(min_score), max_score=VALUES(max_score), grade_point=VALUES(grade_point)`,
        [g.grade, g.min_score, g.max_score, g.grade_point, g.description]
      );
    }

    // 3. Seed Departments
    const depts = [
      { id: 1, dept_name: 'Computer Science and Engineering', code: 'CSE', hod_name: 'Dr. Alan Turing' },
      { id: 2, dept_name: 'Information Technology', code: 'IT', hod_name: 'Dr. Grace Hopper' },
      { id: 3, dept_name: 'Electronics and Communication', code: 'ECE', hod_name: 'Dr. Claude Shannon' }
    ];
    for (const d of depts) {
      await connection.query(
        `INSERT INTO departments (id, dept_name, code, hod_name) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE dept_name=VALUES(dept_name), hod_name=VALUES(hod_name)`,
        [d.id, d.dept_name, d.code, d.hod_name]
      );
    }

    // 4. Seed Academic Years
    await connection.query(
      `INSERT INTO academic_years (id, year_label, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE is_current=VALUES(is_current)`,
      [1, '2024-2025', '2024-08-01', '2025-05-31', 1]
    );

    // 5. Seed Semesters
    const sems = [
      { id: 1, academic_year_id: 1, semester_number: 1, semester_name: 'Semester 1' },
      { id: 2, academic_year_id: 1, semester_number: 2, semester_name: 'Semester 2' }
    ];
    for (const s of sems) {
      await connection.query(
        `INSERT INTO semesters (id, academic_year_id, semester_number, semester_name) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE semester_name=VALUES(semester_name)`,
        [s.id, s.academic_year_id, s.semester_number, s.semester_name]
      );
    }

    // 6. Seed Courses
    await connection.query(
      `INSERT INTO courses (id, department_id, course_name, course_code, total_semesters) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE course_name=VALUES(course_name)`,
      [1, 1, 'B.Tech Computer Science and Engineering', 'BE-CSE', 8]
    );

    // 7. Seed Subjects
    const subjs = [
      { id: 1, department_id: 1, semester_id: 1, subject_name: 'Data Structures and Algorithms', subject_code: 'CS101', credits: 4, max_internal: 20, max_assignment: 10, max_practical: 20, max_semester: 50, pass_mark: 40 },
      { id: 2, department_id: 1, semester_id: 1, subject_name: 'Database Management Systems', subject_code: 'CS102', credits: 4, max_internal: 20, max_assignment: 10, max_practical: 20, max_semester: 50, pass_mark: 40 },
      { id: 3, department_id: 1, semester_id: 1, subject_name: 'Operating Systems', subject_code: 'CS103', credits: 3, max_internal: 20, max_assignment: 10, max_practical: 20, max_semester: 50, pass_mark: 40 },
      { id: 4, department_id: 1, semester_id: 1, subject_name: 'Computer Networks', subject_code: 'CS104', credits: 3, max_internal: 20, max_assignment: 10, max_practical: 20, max_semester: 50, pass_mark: 40 }
    ];
    for (const s of subjs) {
      await connection.query(
        `INSERT INTO subjects (id, department_id, semester_id, subject_name, subject_code, credits, max_internal, max_assignment, max_practical, max_semester, pass_mark)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE subject_name=VALUES(subject_name), credits=VALUES(credits)`,
        [s.id, s.department_id, s.semester_id, s.subject_name, s.subject_code, s.credits, s.max_internal, s.max_assignment, s.max_practical, s.max_semester, s.pass_mark]
      );
    }

    // 8. Seed Default Users & Profiles
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('123456', salt);

    // Admin User
    await connection.query(
      `INSERT INTO users (id, role_id, name, email, password) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password), role_id=VALUES(role_id)`,
      [1, 1, 'System Administrator', 'admin@sms.com', passHash]
    );

    // Staff User
    await connection.query(
      `INSERT INTO users (id, role_id, name, email, password) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password), role_id=VALUES(role_id)`,
      [2, 2, 'Prof. John Doe', 'staff@sms.com', passHash]
    );
    await connection.query(
      `INSERT INTO staff (id, user_id, department_id, staff_code, name, email, designation) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), designation=VALUES(designation)`,
      [1, 2, 1, 'STF001', 'Prof. John Doe', 'staff@sms.com', 'Associate Professor']
    );

    // Student User
    await connection.query(
      `INSERT INTO users (id, role_id, name, email, password) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password), role_id=VALUES(role_id)`,
      [3, 3, 'Alice Smith', 'student@sms.com', passHash]
    );
    await connection.query(
      `INSERT INTO students (id, user_id, department_id, academic_year_id, semester_id, register_number, student_name, email, year, section, gender, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE student_name=VALUES(student_name)`,
      [1, 3, 1, 1, 1, 'REG1001', 'Alice Smith', 'student@sms.com', 1, 'A', 'Female', '9876543210']
    );

    // Sync legacy users if present
    await connection.query(
      `INSERT INTO users (role_id, name, email, password) VALUES (2, 'Staff User', 'staff123@gmail.com', ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password)`,
      [passHash]
    );
    await connection.query(
      `INSERT INTO users (role_id, name, email, password) VALUES (1, 'Admin User', 'admin123@gmail.com', ?)
       ON DUPLICATE KEY UPDATE password=VALUES(password)`,
      [passHash]
    );

    // 9. Seed Settings
    const settings = [
      { key: 'system_name', value: 'Student Management System Enterprise', desc: 'Application Title' },
      { key: 'passing_percentage', value: '40', desc: 'Minimum percentage required to pass a subject' },
      { key: 'min_attendance_pct', value: '75', desc: 'Minimum attendance percentage required for exams' }
    ];
    for (const s of settings) {
      await connection.query(
        `INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)`,
        [s.key, s.value, s.desc]
      );
    }

    console.log('✅ Enterprise seed completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await connection.end();
  }
};

seed();
