-- Upgrade Script: Upgrades Student Management System to Enterprise Schema

-- 1. Alter Users table for JWT Refresh and Password recovery
ALTER TABLE `users`
  ADD COLUMN `refresh_token` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `reset_token` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `reset_token_expiry` TIMESTAMP NULL DEFAULT NULL;

-- 2. Alter Students table for expanded records
ALTER TABLE `students`
  ADD COLUMN `admission_number` VARCHAR(50) UNIQUE DEFAULT NULL,
  ADD COLUMN `roll_number` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN `date_of_birth` DATE DEFAULT NULL,
  ADD COLUMN `blood_group` VARCHAR(10) DEFAULT NULL,
  ADD COLUMN `course` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `semester` INT DEFAULT 1,
  ADD COLUMN `parent_name` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `parent_phone` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN `parent_email` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `photo_url` VARCHAR(255) DEFAULT NULL;

-- 3. Create Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `dept_name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_name` VARCHAR(100) NOT NULL,
  `subject_code` VARCHAR(20) NOT NULL UNIQUE,
  `department_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subjects_dept`
    FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Alter Marks table for practicals, assignments, and GPA grades
ALTER TABLE `marks`
  ADD COLUMN `assignment_mark` DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN `practical_mark` DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN `grade` VARCHAR(2) DEFAULT 'F',
  ADD COLUMN `gpa` DECIMAL(3,2) DEFAULT 0.00;

-- 6. Create Timetables Table
CREATE TABLE IF NOT EXISTS `timetables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_id` INT NOT NULL,
  `year` INT NOT NULL,
  `semester` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `room` VARCHAR(50) DEFAULT NULL,
  CONSTRAINT `fk_timetable_dept`
    FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_timetable_subject`
    FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Create Leaves Table for Leave management
CREATE TABLE IF NOT EXISTS `leaves` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_leaves_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
