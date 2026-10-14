import { SYNTHETIC_STUDENT_ANALYTICS } from '@/lib/studentAnalyticsData';
import { User } from '@/types';
import { StudentAnalyticsRecord } from '@/types/studentAnalytics';

export interface SubjectScoreItem {
  courseCode: string;
  courseName: string;
  category: 'Core' | 'Elective' | 'Laboratory' | 'Open';
  instructor: string;
  credits: number;
  internalMarks: number;    // Out of 30
  midtermMarks: number;     // Out of 50
  labMarks?: number;        // Out of 20 (if lab component exists)
  totalMarks: number;       // Scaled / Aggregated out of 100
  maxMarks: number;         // 100
  percentage: number;
  gradeLetter: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  gradePoint: number;       // 10, 9, 8, 7, 6, 5, 4, 0
  classAverage: number;
  classHighest: number;
  status: 'EXEMPLARY' | 'PASSED' | 'AVERAGE' | 'AT_RISK';
  remarks: string;
}

export interface SemesterRecord {
  semester: number;
  termLabel: string;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  creditsAttempted: number;
  creditsEarned: number;
  backlogsInSemester: number;
  subjectsCount: number;
}

export interface AssessmentDetailItem {
  id: string;
  name: string;
  courseCode: string;
  courseName: string;
  type: 'MIDTERM' | 'INTERNAL' | 'LAB_PRACTICAL' | 'QUIZ' | 'ASSIGNMENT';
  score: number;
  maxScore: number;
  normalizedPercentage: number;
  weightage: string;
  date: string;
}

export interface BacklogRecord {
  id: string;
  courseCode: string;
  courseName: string;
  semester: number;
  status: 'ACTIVE' | 'CLEARED';
  attempts: number;
  clearedDate?: string;
  gradeUponClearance?: string;
}

export interface PlacementEligibility {
  tier1Product: { eligible: boolean; criteria: string };
  tier2Core: { eligible: boolean; criteria: string };
  massRecruiters: { eligible: boolean; criteria: string };
  higherStudies: { eligible: boolean; criteria: string };
}

export interface AcademicSummary {
  studentName: string;
  rollNumber: string;
  department: string;
  currentSemester: number;
  academicYear: number;
  cgpa: number;
  previousCgpa: number;
  cgpaDelta: number;
  academicStanding: string;
  standingColor: string;
  standingBg: string;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  currentSemesterPercentage: number;
  totalMarksScored: number;
  totalMaxMarks: number;
  activeBacklogs: number;
  clearedBacklogs: number;
  backlogStatus: string;
  subjects: SubjectScoreItem[];
  semesterHistory: SemesterRecord[];
  assessments: AssessmentDetailItem[];
  backlogRecords: BacklogRecord[];
  placementEligibility: PlacementEligibility;
}

export function getGradeFromPercentage(pct: number): { grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F'; point: number; label: string } {
  if (pct >= 90) return { grade: 'O', point: 10, label: 'Outstanding' };
  if (pct >= 80) return { grade: 'A+', point: 9, label: 'Excellent' };
  if (pct >= 70) return { grade: 'A', point: 8, label: 'Very Good' };
  if (pct >= 60) return { grade: 'B+', point: 7, label: 'Good' };
  if (pct >= 55) return { grade: 'B', point: 6, label: 'Above Average' };
  if (pct >= 50) return { grade: 'C', point: 5, label: 'Average' };
  if (pct >= 40) return { grade: 'P', point: 4, label: 'Pass' };
  return { grade: 'F', point: 0, label: 'Fail / Arrear' };
}

export function calculateRequiredSGPA(
  currentCGPA: number,
  completedCredits: number,
  targetCGPA: number,
  remainingCredits: number
): { requiredSGPA: number; achievable: boolean; message: string } {
  if (remainingCredits <= 0) {
    return { requiredSGPA: currentCGPA, achievable: false, message: 'No remaining credits.' };
  }

  // targetCGPA = (currentCGPA * completedCredits + requiredSGPA * remainingCredits) / (completedCredits + remainingCredits)
  const totalCredits = completedCredits + remainingCredits;
  const targetTotalPoints = targetCGPA * totalCredits;
  const currentTotalPoints = currentCGPA * completedCredits;
  const neededPoints = targetTotalPoints - currentTotalPoints;
  const requiredSGPA = Number((neededPoints / remainingCredits).toFixed(2));

  if (requiredSGPA > 10.0) {
    return {
      requiredSGPA,
      achievable: false,
      message: `Mathematically unattainable (requires ${requiredSGPA} SGPA > 10.0). Consider adjusting target.`,
    };
  }

  if (requiredSGPA <= 4.0) {
    return {
      requiredSGPA: Math.max(4.0, requiredSGPA),
      achievable: true,
      message: `Well within reach. Maintaining passing grades (SGPA ${Math.max(4.0, requiredSGPA)}) secures this goal.`,
    };
  }

  return {
    requiredSGPA,
    achievable: true,
    message: `Achievable by targeting an average SGPA of ${requiredSGPA} across remaining semesters.`,
  };
}

// Default 3rd Year CSE (Semester 5) Subjects & Marks
const DEFAULT_SEMESTER_5_SUBJECTS: SubjectScoreItem[] = [
  {
    courseCode: 'CSE-301',
    courseName: 'Database Management Systems',
    category: 'Core',
    instructor: 'Dr. S. Rao',
    credits: 4,
    internalMarks: 27,
    midtermMarks: 44,
    labMarks: 18,
    totalMarks: 89,
    maxMarks: 100,
    percentage: 89.0,
    gradeLetter: 'A+',
    gradePoint: 9,
    classAverage: 73.2,
    classHighest: 96.0,
    status: 'EXEMPLARY',
    remarks: 'Strong understanding of ACID properties, normal forms, and SQL optimization.',
  },
  {
    courseCode: 'CSE-302',
    courseName: 'Design & Analysis of Algorithms',
    category: 'Core',
    instructor: 'Prof. K. Verma',
    credits: 4,
    internalMarks: 25,
    midtermMarks: 42,
    labMarks: 17,
    totalMarks: 84,
    maxMarks: 100,
    percentage: 84.0,
    gradeLetter: 'A+',
    gradePoint: 9,
    classAverage: 69.8,
    classHighest: 94.0,
    status: 'EXEMPLARY',
    remarks: 'Proficient in Dynamic Programming and Divide-and-Conquer paradigms.',
  },
  {
    courseCode: 'CSE-303',
    courseName: 'Operating Systems',
    category: 'Core',
    instructor: 'Dr. P. Iyer',
    credits: 4,
    internalMarks: 21,
    midtermMarks: 33,
    labMarks: 15,
    totalMarks: 69,
    maxMarks: 100,
    percentage: 69.0,
    gradeLetter: 'B+',
    gradePoint: 7,
    classAverage: 67.5,
    classHighest: 91.0,
    status: 'AVERAGE',
    remarks: 'Review concurrency, synchronization mutexes, and virtual memory paging.',
  },
  {
    courseCode: 'CSE-304',
    courseName: 'Computer Networks',
    category: 'Core',
    instructor: 'Prof. A. Mehta',
    credits: 3,
    internalMarks: 26,
    midtermMarks: 41,
    labMarks: 18,
    totalMarks: 85,
    maxMarks: 100,
    percentage: 85.0,
    gradeLetter: 'A+',
    gradePoint: 9,
    classAverage: 71.4,
    classHighest: 93.0,
    status: 'EXEMPLARY',
    remarks: 'Excellent grasp of OSI layer models, routing protocols, and socket programming.',
  },
  {
    courseCode: 'CSE-305',
    courseName: 'AI & Machine Learning Lab',
    category: 'Laboratory',
    instructor: 'Prof. S. Sharma',
    credits: 3,
    internalMarks: 28,
    midtermMarks: 45,
    labMarks: 19,
    totalMarks: 92,
    maxMarks: 100,
    percentage: 92.0,
    gradeLetter: 'O',
    gradePoint: 10,
    classAverage: 76.0,
    classHighest: 98.0,
    status: 'EXEMPLARY',
    remarks: 'Top-tier implementation of supervised learning pipelines & neural architectures.',
  },
];

// Historical Semester Averages and Credits
const DEFAULT_SEMESTER_HISTORY: SemesterRecord[] = [
  {
    semester: 1,
    termLabel: 'Semester 1',
    academicYear: '2023-24 (Fall)',
    sgpa: 7.60,
    cgpa: 7.60,
    creditsAttempted: 22,
    creditsEarned: 22,
    backlogsInSemester: 0,
    subjectsCount: 6,
  },
  {
    semester: 2,
    termLabel: 'Semester 2',
    academicYear: '2023-24 (Spring)',
    sgpa: 7.75,
    cgpa: 7.68,
    creditsAttempted: 22,
    creditsEarned: 22,
    backlogsInSemester: 0,
    subjectsCount: 6,
  },
  {
    semester: 3,
    termLabel: 'Semester 3',
    academicYear: '2024-25 (Fall)',
    sgpa: 7.90,
    cgpa: 7.75,
    creditsAttempted: 24,
    creditsEarned: 24,
    backlogsInSemester: 0,
    subjectsCount: 6,
  },
  {
    semester: 4,
    termLabel: 'Semester 4',
    academicYear: '2024-25 (Spring)',
    sgpa: 8.00,
    cgpa: 7.82,
    creditsAttempted: 24,
    creditsEarned: 24,
    backlogsInSemester: 0,
    subjectsCount: 6,
  },
  {
    semester: 5,
    termLabel: 'Semester 5 (Current)',
    academicYear: '2025-26 (Fall)',
    sgpa: 8.35,
    cgpa: 7.91,
    creditsAttempted: 18,
    creditsEarned: 18,
    backlogsInSemester: 0,
    subjectsCount: 5,
  },
];

const DEFAULT_ASSESSMENTS: AssessmentDetailItem[] = [
  {
    id: 'asmt_01',
    name: 'Midterm Exam 1',
    courseCode: 'CSE-301',
    courseName: 'Database Management Systems',
    type: 'MIDTERM',
    score: 44,
    maxScore: 50,
    normalizedPercentage: 88,
    weightage: '25% of Final Grade',
    date: 'Sep 24, 2026',
  },
  {
    id: 'asmt_02',
    name: 'Midterm Exam 1',
    courseCode: 'CSE-302',
    courseName: 'Design & Analysis of Algorithms',
    type: 'MIDTERM',
    score: 42,
    maxScore: 50,
    normalizedPercentage: 84,
    weightage: '25% of Final Grade',
    date: 'Sep 26, 2026',
  },
  {
    id: 'asmt_03',
    name: 'Midterm Exam 1',
    courseCode: 'CSE-303',
    courseName: 'Operating Systems',
    type: 'MIDTERM',
    score: 33,
    maxScore: 50,
    normalizedPercentage: 66,
    weightage: '25% of Final Grade',
    date: 'Sep 28, 2026',
  },
  {
    id: 'asmt_04',
    name: 'Continuous Assessment 1',
    courseCode: 'CSE-304',
    courseName: 'Computer Networks',
    type: 'INTERNAL',
    score: 26,
    maxScore: 30,
    normalizedPercentage: 86.7,
    weightage: '15% of Final Grade',
    date: 'Oct 04, 2026',
  },
  {
    id: 'asmt_05',
    name: 'Lab Practical Continuous Review',
    courseCode: 'CSE-305',
    courseName: 'AI & Machine Learning Lab',
    type: 'LAB_PRACTICAL',
    score: 28,
    maxScore: 30,
    normalizedPercentage: 93.3,
    weightage: '20% of Final Grade',
    date: 'Oct 09, 2026',
  },
];

export function getStudentAcademicSummary(currentUser?: User | null): AcademicSummary {
  const userEmail = currentUser?.email?.toLowerCase().trim() || '';
  const userName = currentUser?.name?.toLowerCase().trim() || '';
  const userRoll = currentUser?.rollNumber?.toLowerCase().trim() || '';

  // 1. Locate student in synthetic dataset
  let matchedRecord: StudentAnalyticsRecord | undefined = SYNTHETIC_STUDENT_ANALYTICS.find(
    s =>
      s.email.toLowerCase() === userEmail ||
      (userRoll && s.rollNumber.toLowerCase() === userRoll) ||
      (userName && s.name.toLowerCase() === userName)
  );

  // Fallback to Aryan Reddy / stu_synth_05
  if (!matchedRecord) {
    matchedRecord = SYNTHETIC_STUDENT_ANALYTICS.find(s => s.id === 'stu_synth_05');
  }

  const rawAcad = matchedRecord?.academic;
  const currentCGPA = rawAcad?.cgpa ?? 7.82;
  const previousCGPA = 7.75;
  const cgpaDelta = Number((currentCGPA - previousCGPA).toFixed(2));
  const activeBacklogs = rawAcad?.currentBacklogs ?? 0;

  // Academic standing definition
  let standing = 'First Class with Distinction';
  let standingColor = 'text-emerald-700';
  let standingBg = 'bg-emerald-50 border-emerald-200';

  if (activeBacklogs > 0) {
    standing = `${activeBacklogs} Active Backlog(s)`;
    standingColor = 'text-rose-700';
    standingBg = 'bg-rose-50 border-rose-200';
  } else if (currentCGPA >= 8.5) {
    standing = 'Institute Honors (First Class Distinction)';
    standingColor = 'text-purple-700';
    standingBg = 'bg-purple-50 border-purple-200';
  } else if (currentCGPA >= 7.5) {
    standing = 'First Class with Distinction';
    standingColor = 'text-emerald-700';
    standingBg = 'bg-emerald-50 border-emerald-200';
  } else if (currentCGPA >= 6.5) {
    standing = 'First Class';
    standingColor = 'text-brand-700';
    standingBg = 'bg-brand-50 border-brand-200';
  } else {
    standing = 'Second Class / Academic Review';
    standingColor = 'text-amber-700';
    standingBg = 'bg-amber-50 border-amber-200';
  }

  // Tally marks across current semester subjects
  const subjects = DEFAULT_SEMESTER_5_SUBJECTS;
  const totalMarksScored = subjects.reduce((acc, s) => acc + s.totalMarks, 0);
  const totalMaxMarks = subjects.reduce((acc, s) => acc + s.maxMarks, 0);
  const currentSemesterPercentage = Number(((totalMarksScored / totalMaxMarks) * 100).toFixed(1));

  // Credits
  const totalCreditsEarned = 110;
  const totalCreditsRequired = 160;

  // Placement eligibility engine
  const placementEligibility: PlacementEligibility = {
    tier1Product: {
      eligible: currentCGPA >= 7.5 && activeBacklogs === 0,
      criteria: 'Requires CGPA ≥ 7.50 & 0 Active Backlogs (Google, Microsoft, Amazon, Oracle)',
    },
    tier2Core: {
      eligible: currentCGPA >= 6.5 && activeBacklogs <= 1,
      criteria: 'Requires CGPA ≥ 6.50 & ≤ 1 Backlog (Cisco, TCS Digital, Cognizant GenC)',
    },
    massRecruiters: {
      eligible: currentCGPA >= 6.0 && activeBacklogs <= 2,
      criteria: 'Requires CGPA ≥ 6.00 & ≤ 2 Backlogs (IT & Enterprise Services)',
    },
    higherStudies: {
      eligible: currentCGPA >= 7.0 && activeBacklogs === 0,
      criteria: 'Requires CGPA ≥ 7.00 & 100% Clean Transcript for MS / Gate Sponsorships',
    },
  };

  const backlogRecords: BacklogRecord[] = activeBacklogs === 0 ? [] : [
    {
      id: 'bk_01',
      courseCode: 'CSE-303',
      courseName: 'Operating Systems',
      semester: 4,
      status: 'ACTIVE',
      attempts: 1,
    },
  ];

  return {
    studentName: currentUser?.name || matchedRecord?.name || 'Aryan Reddy',
    rollNumber: currentUser?.rollNumber || matchedRecord?.rollNumber || '2023CSE012',
    department: currentUser?.department || matchedRecord?.department || 'CSE',
    currentSemester: matchedRecord?.semester || 5,
    academicYear: currentUser?.academicYear || matchedRecord?.academicYear || 3,
    cgpa: currentCGPA,
    previousCgpa: previousCGPA,
    cgpaDelta,
    academicStanding: standing,
    standingColor,
    standingBg,
    totalCreditsEarned,
    totalCreditsRequired,
    currentSemesterPercentage,
    totalMarksScored,
    totalMaxMarks,
    activeBacklogs,
    clearedBacklogs: 0,
    backlogStatus: activeBacklogs === 0 ? 'Zero Active Backlogs (Clean Record)' : `${activeBacklogs} Backlog Active`,
    subjects,
    semesterHistory: DEFAULT_SEMESTER_HISTORY,
    assessments: DEFAULT_ASSESSMENTS,
    backlogRecords,
    placementEligibility,
  };
}
