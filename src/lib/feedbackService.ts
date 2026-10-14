/**
 * Resora Feedback & Institutional Satisfaction Intelligence Service
 * Supporting Course-End Surveys, Faculty Evaluations, Campus Facilities Satisfaction,
 * and Faculty Student-Cohort Insights.
 */

import { User } from '@/types';

export interface FacultyEvaluationCriterion {
  pedagogy: number;          // 1-5: Conceptual clarity & teaching effectiveness
  accessibility: number;     // 1-5: Doubt solving, mentoring & office hours accessibility
  coursePace: number;        // 1-5: Pacing of syllabus & structured coverage
  labRelevance: number;      // 1-5: Practical lab demonstration & hands-on application
  evaluationFairness: number;// 1-5: Transparency & fairness in continuous internal marks
}

export interface CourseFacultyFeedback {
  id: string;
  courseCode: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  department: string;
  semester: number;
  academicYear: string;
  credits: number;
  status: 'PENDING' | 'SUBMITTED';
  submittedAt?: string;
  ratings?: FacultyEvaluationCriterion;
  overallScore?: number;      // 1.0 - 5.0
  sentimentTags?: string[];
  comment?: string;
  isAnonymous: boolean;
  semesterTerm: string;
}

export interface CampusFacilityItem {
  id: string;
  category: 'LABS' | 'LIBRARY' | 'WIFI' | 'CANTEEN' | 'SPORTS' | 'STUDY_PODS';
  name: string;
  location: string;
  averageRating: number;      // e.g. 4.6
  totalVotes: number;
  userRating?: number;
  satisfactionStatus: 'EXCELLENT' | 'SATISFACTORY' | 'ACTION_REQUIRED';
  keyHighlight: string;
  recentActionTaken: string;
}

export interface StudentCommentFeedback {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  rating: number;
  tags: string[];
  comment: string;
  isAnonymous: boolean;
  studentName?: string;
  upvotesCount: number;
}

export interface FacultyAggregateFeedback {
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  department: string;
  avatar: string;
  overallRating: number;         // e.g. 4.78 / 5.0
  totalResponses: number;
  responseRatePercent: number;   // e.g. 88.5%
  netSatisfactionScore: number;  // e.g. 94.2%
  dimensionScores: {
    pedagogy: number;
    accessibility: number;
    coursePace: number;
    labRelevance: number;
    evaluationFairness: number;
  };
  coursesTaught: {
    courseCode: string;
    courseName: string;
    rating: number;
    responses: number;
    trend: 'UP' | 'STABLE' | 'DOWN';
  }[];
  sentimentBreakdown: {
    positivePercent: number;
    neutralPercent: number;
    criticalPercent: number;
  };
  recentStudentComments: StudentCommentFeedback[];
}

export interface FacultyBroadcastNote {
  id: string;
  courseCode: string;
  instructorName: string;
  title: string;
  message: string;
  category: 'CURRICULUM_UPDATE' | 'EXAM_PREP' | 'OFFICE_HOURS' | 'APPRECIATION';
  createdAt: string;
  targetCohort: string;
  readCount: number;
}

// ============================================================================
// Synthetic Initial Dataset
// ============================================================================

export const INITIAL_STUDENT_COURSE_SURVEYS: CourseFacultyFeedback[] = [
  {
    id: 'surv_cse_301',
    courseCode: 'CSE-301',
    courseName: 'Database Management Systems',
    instructorId: 'fac_rajesh_kumar',
    instructorName: 'Dr. Rajesh Kumar',
    instructorTitle: 'Professor & Head, Data Systems Lab',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-27',
    credits: 4,
    status: 'SUBMITTED',
    submittedAt: '2026-10-02',
    ratings: {
      pedagogy: 5,
      accessibility: 5,
      coursePace: 4,
      labRelevance: 5,
      evaluationFairness: 5,
    },
    overallScore: 4.8,
    sentimentTags: ['Clear Explanations', 'Industry-Relevant SQL Queries', 'Great Query Optimization Demos'],
    comment: 'Dr. Rajesh makes relational algebra and indexing crystal clear with practical live PostgreSQL query profiling. Best lab demonstrations this semester.',
    isAnonymous: true,
    semesterTerm: 'Odd Sem 2026',
  },
  {
    id: 'surv_cse_302',
    courseCode: 'CSE-302',
    courseName: 'Design & Analysis of Algorithms',
    instructorId: 'fac_ananya_roy',
    instructorName: 'Prof. Ananya Roy',
    instructorTitle: 'Associate Professor, Theoretical CS',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-27',
    credits: 4,
    status: 'PENDING',
    semesterTerm: 'Odd Sem 2026',
    isAnonymous: true,
  },
  {
    id: 'surv_cse_303',
    courseCode: 'CSE-303',
    courseName: 'Operating Systems & System Programming',
    instructorId: 'fac_vikram_sengupta',
    instructorName: 'Dr. Vikram Sengupta',
    instructorTitle: 'Professor, Systems & Architecture',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-27',
    credits: 4,
    status: 'PENDING',
    semesterTerm: 'Odd Sem 2026',
    isAnonymous: true,
  },
  {
    id: 'surv_cse_304',
    courseCode: 'CSE-304',
    courseName: 'Computer Networks & Security',
    instructorId: 'fac_neha_gupta',
    instructorName: 'Prof. Neha Gupta',
    instructorTitle: 'Assistant Professor, Networks Group',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-27',
    credits: 3,
    status: 'SUBMITTED',
    submittedAt: '2026-09-28',
    ratings: {
      pedagogy: 4,
      accessibility: 5,
      coursePace: 4,
      labRelevance: 4,
      evaluationFairness: 5,
    },
    overallScore: 4.4,
    sentimentTags: ['Hands-on Wireshark', 'Helpful Doubt Clearing', 'Transparent Grading'],
    comment: 'Packet sniffing labs with Wireshark were super engaging. Would love slightly more time allocated for TCP congestion control problem sets.',
    isAnonymous: false,
    semesterTerm: 'Odd Sem 2026',
  },
  {
    id: 'surv_cse_305',
    courseCode: 'CSE-305',
    courseName: 'Full Stack Web Development',
    instructorId: 'fac_karthik_venkat',
    instructorName: 'Prof. Karthik Venkat',
    instructorTitle: 'Assistant Professor, Cloud & Web Engineering',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    semester: 5,
    academicYear: '2026-27',
    credits: 3,
    status: 'PENDING',
    semesterTerm: 'Odd Sem 2026',
    isAnonymous: true,
  },
];

export const INITIAL_CAMPUS_FACILITIES: CampusFacilityItem[] = [
  {
    id: 'fac_ai_lab',
    category: 'LABS',
    name: 'Advanced AI & Supercomputing Cluster (Lab 304)',
    location: 'Tech Tower, 3rd Floor',
    averageRating: 4.8,
    totalVotes: 342,
    userRating: 5,
    satisfactionStatus: 'EXCELLENT',
    keyHighlight: 'Dual RTX 4090 GPU nodes and high-speed NVMe scratch storage.',
    recentActionTaken: 'Added Docker container orchestration for fast deep learning model benchmarks.',
  },
  {
    id: 'fac_library',
    category: 'LIBRARY',
    name: 'Central Digital Library & Research Commons',
    location: 'Knowledge Block, 1st & 2nd Floor',
    averageRating: 4.6,
    totalVotes: 489,
    userRating: 5,
    satisfactionStatus: 'EXCELLENT',
    keyHighlight: '24/7 quiet study pods and direct IEEE Xplore / ACM Digital Library access.',
    recentActionTaken: 'Increased charging stations and high-back ergonomic reading chairs.',
  },
  {
    id: 'fac_wifi',
    category: 'WIFI',
    name: 'Campus High-Speed WiFi 6 Infrastructure',
    location: 'Academic & Hostel Campus Wide',
    averageRating: 4.1,
    totalVotes: 612,
    userRating: 4,
    satisfactionStatus: 'SATISFACTORY',
    keyHighlight: 'Gigabit fiber backbone with 802.11ax access points.',
    recentActionTaken: 'Installed 12 additional mesh access points in the Tech Quadrangle.',
  },
  {
    id: 'fac_canteen',
    category: 'CANTEEN',
    name: 'Campus Food Court & Healthy Bites Cafeteria',
    location: 'Student Activity Center (SAC)',
    averageRating: 3.9,
    totalVotes: 520,
    userRating: 4,
    satisfactionStatus: 'SATISFACTORY',
    keyHighlight: 'Hygienic multi-cuisine options with QR contactless ordering.',
    recentActionTaken: 'Daily steam sterilization audit instituted by Campus Health Council.',
  },
  {
    id: 'fac_study_pods',
    category: 'STUDY_PODS',
    name: 'Resora Quiet Acoustic Pods & Collaboration Rooms',
    location: 'Innovation Wing, Ground Floor',
    averageRating: 4.7,
    totalVotes: 298,
    userRating: 5,
    satisfactionStatus: 'EXCELLENT',
    keyHighlight: 'Soundproof pods equipped with 4K touch displays and whiteboard walls.',
    recentActionTaken: 'Synced live booking confirmation directly to student QR Pass and RFID badge.',
  },
  {
    id: 'fac_sports',
    category: 'SPORTS',
    name: 'Indoor Sports Arena & Gymnasium',
    location: 'Sports Pavilion',
    averageRating: 4.4,
    totalVotes: 215,
    satisfactionStatus: 'SATISFACTORY',
    keyHighlight: 'Badminton wooden courts, table tennis stations, and cardio equipment.',
    recentActionTaken: 'Refurbished court lighting and updated fitness trainer schedules.',
  },
];

export const INITIAL_FACULTY_AGGREGATE: FacultyAggregateFeedback = {
  instructorId: 'fac_rajesh_kumar',
  instructorName: 'Dr. Rajesh Kumar',
  instructorTitle: 'Professor & Head, Data Systems Lab',
  department: 'Computer Science & Engineering',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  overallRating: 4.76,
  totalResponses: 148,
  responseRatePercent: 91.2,
  netSatisfactionScore: 95.3,
  dimensionScores: {
    pedagogy: 4.85,
    accessibility: 4.80,
    coursePace: 4.62,
    labRelevance: 4.90,
    evaluationFairness: 4.75,
  },
  coursesTaught: [
    {
      courseCode: 'CSE-301',
      courseName: 'Database Management Systems',
      rating: 4.82,
      responses: 78,
      trend: 'UP',
    },
    {
      courseCode: 'CSE-403',
      courseName: 'Distributed Cloud Databases',
      rating: 4.70,
      responses: 42,
      trend: 'UP',
    },
    {
      courseCode: 'CSE-306',
      courseName: 'Advanced Database Lab',
      rating: 4.90,
      responses: 28,
      trend: 'STABLE',
    },
  ],
  sentimentBreakdown: {
    positivePercent: 92,
    neutralPercent: 6,
    criticalPercent: 2,
  },
  recentStudentComments: [
    {
      id: 'comm_01',
      courseCode: 'CSE-301',
      courseName: 'DBMS',
      date: '2026-10-10',
      rating: 5,
      tags: ['Industry Relevant', 'Crystal Clear Concepts'],
      comment: 'The explain plans and B-Tree index animations in class completely transformed how I think about database query efficiency. Outstanding pedagogy!',
      isAnonymous: true,
      upvotesCount: 18,
    },
    {
      id: 'comm_02',
      courseCode: 'CSE-301',
      courseName: 'DBMS',
      date: '2026-10-08',
      rating: 5,
      tags: ['Doubt Solving', 'Prompt Responses'],
      comment: 'Always stays back after class or answers queries on the student forum within hours. Very accessible mentor for academic research as well.',
      isAnonymous: false,
      studentName: 'Aryan Reddy (2023CSE005)',
      upvotesCount: 14,
    },
    {
      id: 'comm_03',
      courseCode: 'CSE-301',
      courseName: 'DBMS',
      date: '2026-10-04',
      rating: 4,
      tags: ['Fast Paced', 'Thorough Practice'],
      comment: 'Transaction ACID isolation levels were covered quite rapidly in week 6. However, the extra practice problem sheet provided over the weekend solved all doubts.',
      isAnonymous: true,
      upvotesCount: 9,
    },
    {
      id: 'comm_04',
      courseCode: 'CSE-306',
      courseName: 'Adv DB Lab',
      date: '2026-09-30',
      rating: 5,
      tags: ['Hands-on Lab', 'Real Scenarios'],
      comment: 'Building sharded replicas in Docker was the most practical lab assignment of my college degree so far. Truly hands-on.',
      isAnonymous: true,
      upvotesCount: 22,
    },
  ],
};

export const INITIAL_FACULTY_BROADCAST_NOTES: FacultyBroadcastNote[] = [
  {
    id: 'note_01',
    courseCode: 'CSE-301',
    instructorName: 'Dr. Rajesh Kumar',
    title: 'Midterm Evaluation Feedback & Solution Key Released',
    message: 'Great performance overall on the relational normalization section! To address common misconceptions on 3NF vs BCNF dependency preservation, I have added 4 extra solved walkthroughs in the Course Resources repository.',
    category: 'EXAM_PREP',
    createdAt: '2026-10-11',
    targetCohort: '3rd Year CSE (Sec A & B)',
    readCount: 124,
  },
  {
    id: 'note_02',
    courseCode: 'CSE-301',
    instructorName: 'Dr. Rajesh Kumar',
    title: 'Special Office Hours: Complex Query Optimization',
    message: 'Based on student survey requests for more indexing practice, I will hold an open doubt-clearing session this Thursday, 4:00 PM – 5:30 PM in Tech Tower Room 302.',
    category: 'OFFICE_HOURS',
    createdAt: '2026-10-07',
    targetCohort: 'All Enrolled Students',
    readCount: 142,
  },
];

// ============================================================================
// Service Store Helpers (Local Storage Sync)
// ============================================================================

const STORAGE_KEYS = {
  STUDENT_SURVEYS: 'resora_student_course_surveys_v1',
  FACILITIES: 'resora_campus_facilities_v1',
  FACULTY_AGGREGATE: 'resora_faculty_aggregate_v1',
  BROADCAST_NOTES: 'resora_faculty_broadcast_notes_v1',
};

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSetStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist in localStorage', e);
  }
}

// ============================================================================
// Service API Functions
// ============================================================================

export function getStudentCourseSurveys(): CourseFacultyFeedback[] {
  return safeGetStorage<CourseFacultyFeedback[]>(
    STORAGE_KEYS.STUDENT_SURVEYS,
    INITIAL_STUDENT_COURSE_SURVEYS
  );
}

export function submitCourseSurvey(
  surveyId: string,
  payload: {
    ratings: FacultyEvaluationCriterion;
    sentimentTags: string[];
    comment: string;
    isAnonymous: boolean;
  }
): CourseFacultyFeedback[] {
  const current = getStudentCourseSurveys();
  const overall = Number(
    (
      (payload.ratings.pedagogy +
        payload.ratings.accessibility +
        payload.ratings.coursePace +
        payload.ratings.labRelevance +
        payload.ratings.evaluationFairness) /
      5
    ).toFixed(2)
  );

  const updated = current.map(item => {
    if (item.id === surveyId) {
      return {
        ...item,
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString().slice(0, 10),
        ratings: payload.ratings,
        overallScore: overall,
        sentimentTags: payload.sentimentTags,
        comment: payload.comment,
        isAnonymous: payload.isAnonymous,
      };
    }
    return item;
  });

  safeSetStorage(STORAGE_KEYS.STUDENT_SURVEYS, updated);
  return updated;
}

export function getCampusFacilitiesFeedback(): CampusFacilityItem[] {
  return safeGetStorage<CampusFacilityItem[]>(
    STORAGE_KEYS.FACILITIES,
    INITIAL_CAMPUS_FACILITIES
  );
}

export function rateCampusFacility(
  facilityId: string,
  userRating: number,
  comment?: string
): CampusFacilityItem[] {
  const current = getCampusFacilitiesFeedback();
  const updated = current.map(f => {
    if (f.id === facilityId) {
      const newTotal = f.totalVotes + (f.userRating ? 0 : 1);
      const newAvg = Number(
        (
          (f.averageRating * f.totalVotes + (userRating - (f.userRating || 0))) /
          newTotal
        ).toFixed(2)
      );
      return {
        ...f,
        averageRating: Math.min(5, Math.max(1, newAvg)),
        totalVotes: newTotal,
        userRating,
      };
    }
    return f;
  });

  safeSetStorage(STORAGE_KEYS.FACILITIES, updated);
  return updated;
}

export function getFacultyAggregateFeedback(): FacultyAggregateFeedback {
  return safeGetStorage<FacultyAggregateFeedback>(
    STORAGE_KEYS.FACULTY_AGGREGATE,
    INITIAL_FACULTY_AGGREGATE
  );
}

export function getFacultyBroadcastNotes(): FacultyBroadcastNote[] {
  return safeGetStorage<FacultyBroadcastNote[]>(
    STORAGE_KEYS.BROADCAST_NOTES,
    INITIAL_FACULTY_BROADCAST_NOTES
  );
}

export function publishFacultyBroadcastNote(
  payload: Omit<FacultyBroadcastNote, 'id' | 'createdAt' | 'readCount'>
): FacultyBroadcastNote[] {
  const current = getFacultyBroadcastNotes();
  const newNote: FacultyBroadcastNote = {
    ...payload,
    id: `note_${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    readCount: 0,
  };
  const updated = [newNote, ...current];
  safeSetStorage(STORAGE_KEYS.BROADCAST_NOTES, updated);
  return updated;
}
