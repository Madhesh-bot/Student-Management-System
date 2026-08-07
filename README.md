# 🎓 Student Management System (SMS)

A professional, full-stack Student Management System built using a clean, MVC-structured architecture. This system provides a comprehensive administrative panel for managing student profiles, recording daily attendance logs, grading exam marks, and analyzing demographics and academic GPA metrics.

---

## 📌 Project Overview

The **Student Management System** is designed to streamline academic operations. The application is divided into:
1. **Express API Server**: A backend Node.js server connecting to a MySQL database using raw SQL queries, secured using JSON Web Token (JWT) authorization and password hashing middlewares.
2. **React Dashboard UI**: A Single Page Application (SPA) built using React.js (Vite), styled with HSL variable-driven Vanilla CSS, featuring responsive layout sidebars, modals, and tables.

---

## 🌟 Key Features

* **🛡️ Secure JWT Authentication**: Login and registration with role-based access control (Admin, Staff, Student) and password encryption using `bcryptjs`.
* **📊 Analytics Dashboard**: Statistical summaries for student enrollment distribution, average attendance rates, and average GPA scores.
* **📋 Student Registry (CRUD)**: Full student profile addition, updates, deletion (Admin-only), wildcard search filters, and page-by-page pagination.
* **📅 Attendance Register**: Daily roster status logger (`Present`, `Absent`, `Late`, `Excused`) with local filters, student attendance history, and monthly rates.
* **📝 Grades & Marks Logger**: Record internal evaluation grades (capped at 25) and semester exam grades (capped at 75), dynamically computing total scores and GPA averages.
* **📈 Demographics & GPA Reports**: Summary sheets for student list profiles, attendance logs, and subject GPAs. Includes **Excel CSV exports** and browser **Print PDF layouts**.
* **📱 Responsive Design**: Interface layouts optimized for desktop, tablet, and mobile browsers using CSS grids and media breakpoints.

---

## 💻 Technology Stack

### Frontend
* **Core**: React.js (Vite framework), HTML5, CSS3, JavaScript (ES6+)
* **Routing**: React Router DOM (v6)
* **API Client**: Axios (configured with Authorization headers interceptor)
* **Styling**: Vanilla CSS (Custom properties, CSS grid, Flexbox transitions)

### Backend
* **Core**: Node.js, Express.js
* **Database**: MySQL (Connection Pool via `mysql2/promise`)
* **Security**: JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS headers configuration
* **Environment**: Dotenv (.env variables extraction)

---

## 📂 Folder Structure

```
/
├── backend/
│   ├── config/             # DB settings, schemas
│   │   ├── db.js           # MySQL connection pool
│   │   └── schema.sql      # Database tables definition
│   ├── controllers/        # Request controller handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── attendanceController.js
│   │   ├── marksController.js
│   │   └── reportController.js
│   ├── middleware/         # Security and error filters
│   │   ├── authMiddleware.js # Token & role verifications
│   │   └── errorMiddleware.js# Global error formatting handler
│   ├── models/             # Data Access layer (raw SQL queries)
│   │   ├── userModel.js
│   │   ├── studentModel.js
│   │   ├── attendanceModel.js
│   │   └── marksModel.js
│   ├── routes/             # REST routing mappings
│   ├── utils/              # Token, hashing utilities
│   │   ├── hashPassword.js
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Express app entry point
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML entry hook
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg    # Vector icon
│   │   ├── components/     # Reusable UI elements
│   │   │   ├── Button.jsx  # Loader spinner button
│   │   │   ├── Input.jsx   # Form validation input
│   │   │   ├── Card.jsx    # Dashboard panel card
│   │   │   ├── Navbar.jsx  # Sticky top header
│   │   │   ├── Sidebar.jsx # Navigation sidebar panel
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx # Route guarding checks
│   │   ├── pages/          # Primary views
│   │   │   ├── Login.jsx   # Register / login pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx   # CRUD registry with modal overlays
│   │   │   ├── Attendance.jsx # Attendance mark sheets & lookup tables
│   │   │   ├── Marks.jsx      # Grading rosters & student report cards
│   │   │   ├── Reports.jsx    # Analytics print/export summaries
│   │   │   ├── Profile.jsx    # Security password reset
│   │   │   └── NotFound.jsx   # 404 page
│   │   ├── services/       # Client API fetch calls
│   │   │   ├── api.js         # Axios interceptors config
│   │   │   ├── authService.js
│   │   │   ├── studentService.js
│   │   │   ├── attendanceService.js
│   │   │   ├── marksService.js
│   │   │   └── reportService.js
│   │   ├── styles/         # CSS style sheets
│   │   │   ├── variables.css  # Customized HSL variable system
│   │   │   ├── global.css     # Base normalizations
│   │   │   ├── components.css # Component classes styling
│   │   │   └── pages.css      # Grid pages layout templates
│   │   ├── App.jsx         # Routes wrapping
│   │   └── main.jsx        # Mount point
│   ├── package.json
│   └── vite.config.js      # Vite build & proxy settings
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

Run [backend/config/schema.sql](file:///backend/config/schema.sql) in your MySQL instance to construct tables:

1. **`users`**: Login credentials and role privileges.
   * `id` (INT AUTO_INCREMENT PRIMARY KEY)
   * `name` (VARCHAR)
   * `email` (VARCHAR UNIQUE, INDEXED)
   * `password` (VARCHAR hashed)
   * `role` (ENUM('admin', 'staff', 'student'))
   * `created_at` (TIMESTAMP)

2. **`students`**: Detailed record table.
   * `id` (INT AUTO_INCREMENT PRIMARY KEY)
   * `register_number` (VARCHAR UNIQUE, INDEXED)
   * `student_name` (VARCHAR)
   * `department` (VARCHAR)
   * `year` (INT)
   * `section` (VARCHAR)
   * `gender` (ENUM('Male', 'Female', 'Other'))
   * `email` (VARCHAR UNIQUE, INDEXED)
   * `phone` (VARCHAR)
   * `address` (TEXT)
   * `created_at` (TIMESTAMP)

3. **`attendance`**: Daily log register.
   * `id` (INT AUTO_INCREMENT PRIMARY KEY)
   * `student_id` (INT FOREIGN KEY REFERENCES `students.id` ON DELETE CASCADE)
   * `date` (DATE)
   * `status` (ENUM('Present', 'Absent', 'Late', 'Excused'))
   * *Constraints*: Unique composite index `(student_id, date)` prevents log duplicates.

4. **`marks`**: Academic evaluation grading.
   * `id` (INT AUTO_INCREMENT PRIMARY KEY)
   * `student_id` (INT FOREIGN KEY REFERENCES `students.id` ON DELETE CASCADE)
   * `subject` (VARCHAR)
   * `internal_mark` (DECIMAL, Max 25)
   * `semester_mark` (DECIMAL, Max 75)
   * `total` (DECIMAL GENERATED ALWAYS AS `internal_mark + semester_mark` STORED)
   * *Constraints*: Unique composite index `(student_id, subject)` prevents duplicate subject records.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
* `POST /register` - Register a new staff or admin user
* `POST /login` - Log in to retrieve JWT token
* `GET /profile` - Retrieve current logged-in profile details (Protected)

### Students (`/api/students`)
* `GET /` - Fetch all student records (Optional query params `?page=1&limit=10` return paginated listings) (Protected)
* `GET /search?q={keyword}` - Wildcard search on names/register numbers (Protected)
* `GET /:id` - Get student details by ID (Protected)
* `POST /` - Register a student (Protected: Admin/Staff only)
* `PUT /:id` - Update student profile details (Protected: Admin/Staff only)
* `DELETE /:id` - Delete student record (Protected: Admin only)

### Attendance (`/api/attendance`)
* `GET /?date=YYYY-MM-DD` - View date attendance list (Protected)
* `GET /?studentId=ID` - View student history log (Protected)
* `POST /` - Add or update student attendance status (Protected: Admin/Staff only)
* `PUT /:id` - Modify status by record ID (Protected: Admin/Staff only)
* `DELETE /:id` - Delete/reset daily attendance log entry (Protected: Admin/Staff only)

### Marks (`/api/marks`)
* `GET /?studentId=ID` - View student report card (Protected)
* `GET /?subject=Name` - View subject marks list (Protected)
* `POST /` - Record or update student marks (Protected: Admin/Staff only)
* `PUT /:id` - Update marks by ID (Protected: Admin/Staff only)
* `DELETE /:id` - Delete/reset subject evaluation grades (Protected: Admin/Staff only)

### Reports (`/api/reports`)
* `GET /students` - Department/Year/Gender wise registration splits (Protected: Admin/Staff only)
* `GET /attendance` - Attendance log distributions and summaries (Protected: Admin/Staff only)
* `GET /marks` - Course GPAs, highest/lowest marks, and pass rate statistics (Protected: Admin/Staff only)

---

## 🛠️ Installation Guide

### Prerequisites
* **Node.js**: Installed (v18.x or above recommended)
* **MySQL Server**: Installed, running, and accessible

### Step 1: Initialize Database
1. Connect to your MySQL database.
2. Create database:
   ```sql
   CREATE DATABASE student_management;
   ```
3. Execute SQL scripts located in [backend/config/schema.sql](file:///backend/config/schema.sql) to build tables.

### Step 2: Configure Environment
1. Enter the `/backend` folder.
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Update connection configurations:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=student_management
   JWT_SECRET=your_custom_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

### Step 3: Install & Start Backend
```bash
cd backend
npm install
npm run dev
```
The server will boot on port `5000` (e.g. `http://localhost:5000/health`).

### Step 4: Install & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The client dashboard will boot on port `3000` (e.g. `http://localhost:3000`).

---

## 📈 Usage Guide

1. **Setup Admin Profile**: Register an account via the Login screen under the `Admin` role.
2. **Admit Students**: Go to the **Students** tab, click **Add Student**, fill in their details (unique email and register number), and save.
3. **Record Attendance**: Under **Attendance**, search for students locally, select status indicators, and click **Save Attendance Sheet**.
4. **Log Marks**: Go to the **Marks** tab, choose a subject, input scores (bounds check caps internal marks at 25 and semester exams at 75), and click **Save Grades Sheet**.
5. **Inspect Reports**: Toggle **Reports** tabs to view registries statistics. Click **Print / Export PDF** to trigger printer settings, or click **Export Excel** to download CSV sheets of filtered grids.

---

## 🖼️ Screenshots Section

> [!NOTE]
> *Replace paths with your custom application captures once deployed.*

| Authentication Screen | Dashboard Panel |
| :---: | :---: |
| ![Login Mockup](https://via.placeholder.com/600x400.png?text=Login+Portal+Mockup) | ![Dashboard Mockup](https://via.placeholder.com/600x400.png?text=Dashboard+Overview+Mockup) |

| Students Registry | Roster Marking |
| :---: | :---: |
| ![Students CRUD Mockup](https://via.placeholder.com/600x400.png?text=Students+Manager+Mockup) | ![Attendance Mark Mockup](https://via.placeholder.com/600x400.png?text=Attendance+Roster+Mockup) |

---

## 🚀 Future Enhancements

* **📅 Event Calendars**: Add academic schedules, exam dates, and notice board modules.
* **📬 Email Notifications**: Automatically send monthly attendance alerts or report cards to parents.
* **🌓 Visual Themes Toggle**: Integrate system-wide dark/light mode toggle settings in the variables file.
* **🔒 Refresh Tokens**: Add secure HTTP-Only cookie storage to prevent XSS-based token leakage.

---

## 👤 Author Information

* **Name**: Madhesh K
* **Role**: Full Stack Web Developer
* **Workspace**: OneDrive Desktop Workspace
* **Project Status**: Boiled, Verified, and Production-Ready.
