import { SYNTHETIC_STUDENT_ANALYTICS } from '@/lib/studentAnalyticsData';
import { User } from '@/types';
import { CourseAttendanceDetail, StudentAnalyticsRecord } from '@/types/studentAnalytics';

export interface EnhancedCourseAttendance {
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  attended: number;
  total: number;
  percentage: number;
  status: 'SAFE' | 'GOOD' | 'WARNING' | 'CRITICAL';
  statusLabel: string;
  safeBunks: number;
  classesNeeded: number;
  schedule: string;
  room: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface AttendanceSessionLog {
  id: string;
  date: string;
  formattedDate: string;
  time: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface AttendanceSummary {
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  academicYear: number;
  overallPercentage: number;
  totalConducted: number;
  totalAttended: number;
  totalAbsences: number;
  unexcusedAbsences: number;
  consecutiveAbsences: number;
  status: 'SAFE' | 'GOOD' | 'WARNING' | 'CRITICAL';
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  safeBunksOverall: number;
  classesNeededOverall: number;
  courses: EnhancedCourseAttendance[];
  recentLogs: AttendanceSessionLog[];
  subjectCountAbove75: number;
  subjectCountBelow75: number;
}

// Course catalog defaults for fallback/enrichment
const COURSE_METADATA: Record<string, { instructor: string; credits: number; schedule: string; room: string }> = {
  'CSE-301': { instructor: 'Dr. S. Rao', credits: 4, schedule: 'Mon, Wed, Fri (09:00 AM)', room: 'Room 302' },
  'CSE-302': { instructor: 'Prof. K. Verma', credits: 4, schedule: 'Tue, Thu (10:30 AM)', room: 'Room 304' },
  'CSE-303': { instructor: 'Dr. P. Iyer', credits: 4, schedule: 'Mon, Wed (02:00 PM)', room: 'Room 201' },
  'CSE-304': { instructor: 'Prof. A. Mehta', credits: 3, schedule: 'Tue, Fri (11:45 AM)', room: 'Room 205' },
  'CSE-305': { instructor: 'Dr. M. Reddy', credits: 3, schedule: 'Thu (02:00 PM - 05:00 PM)', room: 'Innovation Lab' },
  'CSE-306': { instructor: 'Prof. S. Sharma', credits: 2, schedule: 'Wed (02:00 PM - 04:30 PM)', room: 'AI/ML Lab' },
  'ECE-301': { instructor: 'Dr. V. Raman', credits: 4, schedule: 'Mon, Wed (10:00 AM)', room: 'ECE Lab 1' },
  'ECE-302': { instructor: 'Prof. T. Sen', credits: 4, schedule: 'Tue, Thu (09:00 AM)', room: 'Room 401' },
  'EEE-301': { instructor: 'Dr. B. Kulkarni', credits: 4, schedule: 'Mon, Thu (11:00 AM)', room: 'EEE Core Lab' },
};

export function calculateBunkStats(attended: number, total: number, targetPercentage: number = 75) {
  if (total <= 0) return { safeBunks: 0, classesNeeded: 0 };
  const currentPercentage = (attended / total) * 100;
  const targetFraction = targetPercentage / 100;

  if (currentPercentage >= targetPercentage) {
    // How many more classes can you miss while staying >= targetPercentage?
    // attended / (total + x) >= targetFraction => total + x <= attended / targetFraction => x <= (attended / targetFraction) - total
    const maxCanMiss = Math.floor(attended / targetFraction - total);
    return {
      safeBunks: Math.max(0, maxCanMiss),
      classesNeeded: 0,
    };
  } else {
    // How many consecutive classes must you attend to hit targetPercentage?
    // (attended + y) / (total + y) >= targetFraction => attended + y >= targetFraction*total + targetFraction*y
    // y*(1 - targetFraction) >= targetFraction*total - attended => y >= (targetFraction*total - attended) / (1 - targetFraction)
    const needed = Math.ceil((targetFraction * total - attended) / (1 - targetFraction));
    return {
      safeBunks: 0,
      classesNeeded: Math.max(0, needed),
    };
  }
}

export function getStatusDetails(percentage: number): {
  status: 'SAFE' | 'GOOD' | 'WARNING' | 'CRITICAL';
  statusLabel: string;
  statusColor: string;
  statusBg: string;
} {
  if (percentage >= 85) {
    return {
      status: 'SAFE',
      statusLabel: 'Excellent Standing',
      statusColor: 'text-emerald-700',
      statusBg: 'bg-emerald-50 border-emerald-200',
    };
  }
  if (percentage >= 75) {
    return {
      status: 'GOOD',
      statusLabel: 'Safe (Eligible for Exams)',
      statusColor: 'text-brand-700',
      statusBg: 'bg-brand-50 border-brand-200',
    };
  }
  if (percentage >= 65) {
    return {
      status: 'WARNING',
      statusLabel: 'Shortage Warning (< 75%)',
      statusColor: 'text-amber-700',
      statusBg: 'bg-amber-50 border-amber-200',
    };
  }
  return {
    status: 'CRITICAL',
    statusLabel: 'Debarment Risk (< 65%)',
    statusColor: 'text-rose-700',
    statusBg: 'bg-rose-50 border-rose-200',
  };
}

const DEFAULT_COURSES: CourseAttendanceDetail[] = [
  { courseCode: 'CSE-301', courseName: 'Database Management Systems', percentage: 90.0, attended: 18, total: 20 },
  { courseCode: 'CSE-302', courseName: 'Design & Analysis of Algorithms', percentage: 85.0, attended: 17, total: 20 },
  { courseCode: 'CSE-303', courseName: 'Operating Systems', percentage: 68.8, attended: 11, total: 16 },
  { courseCode: 'CSE-304', courseName: 'Computer Networks', percentage: 92.9, attended: 13, total: 14 },
  { courseCode: 'CSE-305', courseName: 'AI & Machine Learning Lab', percentage: 80.0, attended: 8, total: 10 },
];

const MOCK_RECENT_LOGS: AttendanceSessionLog[] = [
  {
    id: 'att_log_01',
    date: '2026-10-13',
    formattedDate: 'Today, Oct 13',
    time: '09:00 AM - 10:30 AM',
    courseCode: 'CSE-301',
    courseName: 'Database Management Systems',
    instructor: 'Dr. S. Rao',
    room: 'Room 302',
    status: 'PRESENT',
    remarks: 'Verified via Smart QR Access Pass',
  },
  {
    id: 'att_log_02',
    date: '2026-10-13',
    formattedDate: 'Today, Oct 13',
    time: '11:45 AM - 01:15 PM',
    courseCode: 'CSE-304',
    courseName: 'Computer Networks',
    instructor: 'Prof. A. Mehta',
    room: 'Room 205',
    status: 'PRESENT',
    remarks: 'Verified at 11:46 AM',
  },
  {
    id: 'att_log_03',
    date: '2026-10-12',
    formattedDate: 'Yesterday, Oct 12',
    time: '02:00 PM - 03:30 PM',
    courseCode: 'CSE-303',
    courseName: 'Operating Systems',
    instructor: 'Dr. P. Iyer',
    room: 'Room 201',
    status: 'ABSENT',
    remarks: 'Unexcused Absence - Alert flagged',
  },
  {
    id: 'att_log_04',
    date: '2026-10-12',
    formattedDate: 'Yesterday, Oct 12',
    time: '10:30 AM - 12:00 PM',
    courseCode: 'CSE-302',
    courseName: 'Design & Analysis of Algorithms',
    instructor: 'Prof. K. Verma',
    room: 'Room 304',
    status: 'PRESENT',
    remarks: 'Verified via RFID Scanner',
  },
  {
    id: 'att_log_05',
    date: '2026-10-10',
    formattedDate: 'Oct 10, 2026',
    time: '02:00 PM - 05:00 PM',
    courseCode: 'CSE-305',
    courseName: 'AI & Machine Learning Lab',
    instructor: 'Dr. M. Reddy',
    room: 'Innovation Lab',
    status: 'PRESENT',
    remarks: 'Hands-on Model Training Session',
  },
  {
    id: 'att_log_06',
    date: '2026-10-09',
    formattedDate: 'Oct 9, 2026',
    time: '09:00 AM - 10:30 AM',
    courseCode: 'CSE-301',
    courseName: 'Database Management Systems',
    instructor: 'Dr. S. Rao',
    room: 'Room 302',
    status: 'PRESENT',
    remarks: 'SQL Query Optimization Lecture',
  },
  {
    id: 'att_log_07',
    date: '2026-10-08',
    formattedDate: 'Oct 8, 2026',
    time: '02:00 PM - 03:30 PM',
    courseCode: 'CSE-303',
    courseName: 'Operating Systems',
    instructor: 'Dr. P. Iyer',
    room: 'Room 201',
    status: 'EXCUSED',
    remarks: 'Approved Hackathon Participation Leave',
  },
  {
    id: 'att_log_08',
    date: '2026-10-07',
    formattedDate: 'Oct 7, 2026',
    time: '10:30 AM - 12:00 PM',
    courseCode: 'CSE-302',
    courseName: 'Design & Analysis of Algorithms',
    instructor: 'Prof. K. Verma',
    room: 'Room 304',
    status: 'LATE',
    remarks: 'Admitted with late mark (10:42 AM)',
  },
];

/**
 * Resolves full student attendance metrics including overall percentage and subject-wise breakdown.
 */
export function getStudentAttendanceSummary(currentUser?: User | null): AttendanceSummary {
  const userEmail = currentUser?.email?.toLowerCase().trim() || '';
  const userName = currentUser?.name?.toLowerCase().trim() || '';
  const userRoll = currentUser?.rollNumber?.toLowerCase().trim() || '';

  // 1. Locate matching student record in synthetic dataset
  let matchedRecord: StudentAnalyticsRecord | undefined = SYNTHETIC_STUDENT_ANALYTICS.find(
    s =>
      s.email.toLowerCase() === userEmail ||
      (userRoll && s.rollNumber.toLowerCase() === userRoll) ||
      (userName && s.name.toLowerCase() === userName)
  );

  // Fallback to default student demonstration profile (Aryan Reddy) if unlinked or demo
  if (!matchedRecord) {
    matchedRecord = SYNTHETIC_STUDENT_ANALYTICS.find(s => s.id === 'stu_synth_05');
  }

  const rawAtt = matchedRecord?.attendance;
  const rawCourses = rawAtt?.courseBreakdown && rawAtt.courseBreakdown.length > 0
    ? rawAtt.courseBreakdown
    : DEFAULT_COURSES;

  const totalConducted = rawAtt?.totalSessionsConducted ?? 80;
  const totalAttended = rawAtt?.sessionsAttended ?? 67;
  const totalAbsences = totalConducted - totalAttended;
  const overallPercentage = rawAtt?.overallPercentage ?? Number(((totalAttended / Math.max(1, totalConducted)) * 100).toFixed(1));

  const overallBunk = calculateBunkStats(totalAttended, totalConducted, 75);
  const statusInfo = getStatusDetails(overallPercentage);

  // Enrich course-level attendance
  const courses: EnhancedCourseAttendance[] = rawCourses.map(course => {
    const meta = COURSE_METADATA[course.courseCode] || {
      instructor: 'Faculty Advisor',
      credits: 3,
      schedule: 'Mon, Wed (10:00 AM)',
      room: 'Main Academic Block',
    };

    const calculatedPct = course.total > 0
      ? Number(((course.attended / course.total) * 100).toFixed(1))
      : course.percentage;

    const courseBunk = calculateBunkStats(course.attended, course.total, 75);
    const courseStatus = getStatusDetails(calculatedPct);

    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (calculatedPct >= 85) trend = 'UP';
    else if (calculatedPct < 75) trend = 'DOWN';

    return {
      courseCode: course.courseCode,
      courseName: course.courseName,
      instructor: meta.instructor,
      credits: meta.credits,
      attended: course.attended,
      total: course.total,
      percentage: calculatedPct,
      status: courseStatus.status,
      statusLabel: courseStatus.statusLabel,
      safeBunks: courseBunk.safeBunks,
      classesNeeded: courseBunk.classesNeeded,
      schedule: meta.schedule,
      room: meta.room,
      trend,
    };
  });

  const subjectCountAbove75 = courses.filter(c => c.percentage >= 75).length;
  const subjectCountBelow75 = courses.filter(c => c.percentage < 75).length;

  return {
    studentName: currentUser?.name || matchedRecord?.name || 'Aryan Reddy',
    rollNumber: currentUser?.rollNumber || matchedRecord?.rollNumber || '2023CSE012',
    department: currentUser?.department || matchedRecord?.department || 'CSE',
    semester: matchedRecord?.semester || 5,
    academicYear: currentUser?.academicYear || matchedRecord?.academicYear || 3,
    overallPercentage,
    totalConducted,
    totalAttended,
    totalAbsences,
    unexcusedAbsences: rawAtt?.unexcusedAbsences ?? 13,
    consecutiveAbsences: rawAtt?.consecutiveAbsences ?? 1,
    status: statusInfo.status,
    statusLabel: statusInfo.statusLabel,
    statusColor: statusInfo.statusColor,
    statusBg: statusInfo.statusBg,
    safeBunksOverall: overallBunk.safeBunks,
    classesNeededOverall: overallBunk.classesNeeded,
    courses,
    recentLogs: MOCK_RECENT_LOGS,
    subjectCountAbove75,
    subjectCountBelow75,
  };
}
