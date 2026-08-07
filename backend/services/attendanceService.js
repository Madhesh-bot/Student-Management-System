const db = require('../config/db');

/**
 * Calculate attendance metrics for a student
 */
const getStudentAttendanceMetrics = async (studentId) => {
  const logs = await db.query(
    `SELECT id, date, status FROM attendance 
     WHERE student_id = ? AND deleted_at IS NULL 
     ORDER BY date DESC`,
    [studentId]
  );

  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;

  const monthlyMap = {};
  const yearlyMap = {};

  for (const log of logs) {
    const status = log.status;
    if (status === 'Present') present++;
    else if (status === 'Absent') absent++;
    else if (status === 'Late') late++;
    else if (status === 'Leave') leave++;

    const dateObj = new Date(log.date);
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = `${dateObj.getFullYear()}`;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, present: 0, absent: 0, late: 0, leave: 0, total: 0 };
    }
    monthlyMap[monthKey][status.toLowerCase()]++;
    monthlyMap[monthKey].total++;

    if (!yearlyMap[yearKey]) {
      yearlyMap[yearKey] = { year: yearKey, present: 0, absent: 0, late: 0, leave: 0, total: 0 };
    }
    yearlyMap[yearKey][status.toLowerCase()]++;
    yearlyMap[yearKey].total++;
  }

  const totalSessions = logs.length;
  // Present + Late + Leave count towards attended/excused sessions
  const effectivePresent = present + late + leave;
  const attendancePercentage = totalSessions > 0 ? parseFloat(((effectivePresent / totalSessions) * 100).toFixed(2)) : 0.0;

  return {
    totalSessions,
    present,
    absent,
    late,
    leave,
    attendancePercentage,
    monthlyAttendance: Object.values(monthlyMap),
    yearlyAttendance: Object.values(yearlyMap)
  };
};

module.exports = {
  getStudentAttendanceMetrics
};
