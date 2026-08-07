const db = require('../config/db');

/**
 * Student Data Access Model
 */
const studentModel = {
  getAllStudents: async ({ page = 1, limit = 50, search = '', department_id = null }) => {
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];

    let whereClause = `WHERE s.deleted_at IS NULL`;

    if (search) {
      whereClause += ` AND (s.student_name LIKE ? OR s.register_number LIKE ? OR s.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (department_id) {
      whereClause += ` AND s.department_id = ?`;
      params.push(Number(department_id));
    }

    const countRows = await db.query(
      `SELECT COUNT(*) AS total FROM students s ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const dataQuery = `
      SELECT s.*, d.dept_name AS department, d.code AS dept_code, ay.year_label AS academic_year
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const students = await db.query(dataQuery, params);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      students
    };
  },

  getStudentById: async (id) => {
    const rows = await db.query(
      `SELECT s.*, d.dept_name AS department, d.code AS dept_code, ay.year_label AS academic_year
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
       WHERE s.id = ? AND s.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  findByEmailOrRegister: async (email, registerNumber) => {
    const rows = await db.query(
      `SELECT * FROM students 
       WHERE (email = ? OR register_number = ?) AND deleted_at IS NULL`,
      [email, registerNumber]
    );
    return rows[0] || null;
  },

  addStudent: async (data) => {
    const {
      user_id = null,
      firebase_uid = null,
      register_number,
      student_name,
      department_id = 1,
      academic_year_id = 1,
      semester_id = 1,
      year = 1,
      section = 'A',
      gender = 'Male',
      email,
      phone = null,
      address = null,
      photo_url = null
    } = data;

    const result = await db.query(
      `INSERT INTO students 
       (user_id, firebase_uid, department_id, academic_year_id, semester_id, register_number, student_name, email, year, section, gender, phone, address, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, firebase_uid, department_id, academic_year_id, semester_id, register_number, student_name, email, year, section, gender, phone, address, photo_url]
    );

    return { id: result.insertId, ...data };
  },

  updateStudent: async (id, data) => {
    const {
      student_name,
      department_id,
      year,
      section,
      gender,
      email,
      phone,
      address,
      photo_url
    } = data;

    await db.query(
      `UPDATE students 
       SET student_name = COALESCE(?, student_name),
           department_id = COALESCE(?, department_id),
           year = COALESCE(?, year),
           section = COALESCE(?, section),
           gender = COALESCE(?, gender),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           photo_url = COALESCE(?, photo_url)
       WHERE id = ? AND deleted_at IS NULL`,
      [
        student_name ?? null,
        department_id ?? null,
        year ?? null,
        section ?? null,
        gender ?? null,
        email ?? null,
        phone ?? null,
        address ?? null,
        photo_url ?? null,
        id
      ]
    );

    return studentModel.getStudentById(id);
  },


  softDeleteStudent: async (id) => {
    await db.query(`UPDATE students SET deleted_at = NOW() WHERE id = ?`, [id]);
  }
};

module.exports = studentModel;
