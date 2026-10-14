/**
 * Resora AceIt LMS Intelligence & Learning Management Service
 * Modeled after i-Life Ace It / Eduzon LMS (lms.ilifeaceit.com)
 * Supporting Grade/Semester Navigation, AI Coding Tracks, Interactive IDE,
 * Coursework & Assignment Submissions, MCQ Insights, and Login Frequency Heatmaps.
 */

export interface LMSCourseModule {
  id: string;
  code: string;
  title: string;
  track: 'AI_CODING' | 'ICT_SYSTEMS' | 'CORE_CS' | 'DATA_SCIENCE';
  instructor: string;
  instructorAvatar: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  currentLesson: string;
  nextDeadline: string;
  thumbnail: string;
  colorScheme: {
    bg: string;
    text: string;
    accent: string;
    border: string;
  };
}

export interface LMSAssignment {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  type: 'PROGRAMMING_LAB' | 'THEORY_PROBLEM_SET' | 'MCQ_QUIZ' | 'CAPSTONE_MILESTONE';
  dueDate: string;
  maxPoints: number;
  pointsAwarded?: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  submittedAt?: string;
  instructorFeedback?: string;
  submissionLink?: string;
}

export interface LMSQuizInsight {
  topic: string;
  courseCode: string;
  totalQuestions: number;
  attempted: number;
  accuracyPercent: number;
  strengthArea: string;
  revisionTopic: string;
}

export interface LMSCodingProblem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  courseCode: string;
  language: string;
  starterCode: string;
  solutionOutput: string;
  description: string;
}

export interface LMSStudentProfile {
  studentName: string;
  rollNumber: string;
  email: string;
  department: string;
  semester: number;
  learningStreakDays: number;
  weeklyLoginFrequency: number;  // Logins per week (e.g. 5.8)
  totalLoginsMonth: number;
  totalStudyHours: number;
  completedAssignmentsCount: number;
  totalAssignmentsCount: number;
  overallCompletionRate: number; // e.g. 91.6%
  currentXP: number;
  globalRank: number;
}

// Initial Synthetic LMS Dataset
export const INITIAL_LMS_PROFILE: LMSStudentProfile = {
  studentName: 'Aryan Reddy',
  rollNumber: '2023CSE005',
  email: 'aryan.reddy@resora.demo',
  department: 'Computer Science & Engineering',
  semester: 5,
  learningStreakDays: 14,
  weeklyLoginFrequency: 5.8,
  totalLoginsMonth: 34,
  totalStudyHours: 48.5,
  completedAssignmentsCount: 11,
  totalAssignmentsCount: 12,
  overallCompletionRate: 91.6,
  currentXP: 4820,
  globalRank: 12,
};

export const INITIAL_LMS_COURSES: LMSCourseModule[] = [
  {
    id: 'lms_course_01',
    code: 'CSE-301',
    title: 'Relational Database Management Systems & SQL',
    track: 'CORE_CS',
    instructor: 'Dr. Rajesh Kumar',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    totalLessons: 24,
    completedLessons: 22,
    progressPercent: 92,
    currentLesson: 'B-Tree & Hash Index Query Profiling (EXPLAIN ANALYZE)',
    nextDeadline: 'Due in 3 days',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80',
    colorScheme: {
      bg: 'from-blue-900 to-indigo-950',
      text: 'text-blue-400',
      accent: 'bg-blue-500',
      border: 'border-blue-500/30',
    },
  },
  {
    id: 'lms_course_02',
    code: 'CSE-302',
    title: 'Design & Analysis of Algorithms (DAA)',
    track: 'AI_CODING',
    instructor: 'Prof. Ananya Roy',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalLessons: 20,
    completedLessons: 17,
    progressPercent: 85,
    currentLesson: 'Dynamic Programming on Trees & Bitmask DP',
    nextDeadline: 'Due in 5 days',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc0c2666d6a?w=400&auto=format&fit=crop&q=80',
    colorScheme: {
      bg: 'from-purple-900 to-slate-950',
      text: 'text-purple-400',
      accent: 'bg-purple-500',
      border: 'border-purple-500/30',
    },
  },
  {
    id: 'lms_course_03',
    code: 'CSE-305',
    title: 'Applied AI & Deep Neural Networks Playground',
    track: 'AI_CODING',
    instructor: 'Prof. Karthik Venkat',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalLessons: 24,
    completedLessons: 18,
    progressPercent: 75,
    currentLesson: 'Multi-Head Self-Attention & Transformer Architecture',
    nextDeadline: 'Due next Monday',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80',
    colorScheme: {
      bg: 'from-emerald-900 to-teal-950',
      text: 'text-emerald-400',
      accent: 'bg-emerald-500',
      border: 'border-emerald-500/30',
    },
  },
  {
    id: 'lms_course_04',
    code: 'CSE-304',
    title: 'Computer Networks & TCP/IP Socket Architecture',
    track: 'ICT_SYSTEMS',
    instructor: 'Prof. Neha Gupta',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalLessons: 16,
    completedLessons: 11,
    progressPercent: 68,
    currentLesson: 'Sliding Window Protocols & Congestion Avoidance',
    nextDeadline: 'Due in 2 days',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
    colorScheme: {
      bg: 'from-amber-900 to-slate-950',
      text: 'text-amber-400',
      accent: 'bg-amber-500',
      border: 'border-amber-500/30',
    },
  },
];

export const INITIAL_LMS_ASSIGNMENTS: LMSAssignment[] = [
  {
    id: 'asg_01',
    courseCode: 'CSE-302',
    courseTitle: 'Design & Analysis of Algorithms',
    title: 'Lab 5: Minimum Spanning Trees (Kruskal with Disjoint Set Union)',
    type: 'PROGRAMMING_LAB',
    dueDate: '2026-10-18',
    maxPoints: 100,
    pointsAwarded: 96,
    status: 'GRADED',
    submittedAt: '2026-10-12',
    instructorFeedback: 'Optimal O(E log V) implementation with path compression. Clean test benchmarks.',
  },
  {
    id: 'asg_02',
    courseCode: 'CSE-301',
    courseTitle: 'Database Management Systems',
    title: 'Coursework 4: B-Tree Index Tuning & Normalization Verification',
    type: 'THEORY_PROBLEM_SET',
    dueDate: '2026-10-20',
    maxPoints: 50,
    pointsAwarded: 48,
    status: 'GRADED',
    submittedAt: '2026-10-10',
    instructorFeedback: 'Correct dependency preservation proofs on BCNF decompositions.',
  },
  {
    id: 'asg_03',
    courseCode: 'CSE-305',
    courseTitle: 'Applied AI & Deep Learning',
    title: 'Hands-on Lab 4: PyTorch Backpropagation from Scratch',
    type: 'PROGRAMMING_LAB',
    dueDate: '2026-10-22',
    maxPoints: 100,
    status: 'SUBMITTED',
    submittedAt: '2026-10-13',
    instructorFeedback: 'Under review by Teaching Assistant.',
  },
  {
    id: 'asg_04',
    courseCode: 'CSE-304',
    courseTitle: 'Computer Networks',
    title: 'Wireshark Lab 3: Three-Way Handshake & TCP RST Analysis',
    type: 'PROGRAMMING_LAB',
    dueDate: '2026-10-16',
    maxPoints: 100,
    status: 'PENDING',
    instructorFeedback: 'Action needed: Complete Wireshark packet capture trace and submit before Friday.',
  },
];

export const INITIAL_LMS_QUIZZES: LMSQuizInsight[] = [
  {
    topic: 'Relational Algebra & SQL Query Optimization',
    courseCode: 'CSE-301',
    totalQuestions: 40,
    attempted: 40,
    accuracyPercent: 92.5,
    strengthArea: 'Subquery unnesting & Joins',
    revisionTopic: 'Serializable transaction isolation anomalies',
  },
  {
    topic: 'Asymptotic Analysis & Recurrence Relations',
    courseCode: 'CSE-302',
    totalQuestions: 50,
    attempted: 48,
    accuracyPercent: 88.0,
    strengthArea: 'Master Theorem case analysis',
    revisionTopic: 'Amortized accounting method',
  },
  {
    topic: 'TCP/IP Model & Subnet Masking',
    courseCode: 'CSE-304',
    totalQuestions: 35,
    attempted: 35,
    accuracyPercent: 82.8,
    strengthArea: 'CIDR notation calculations',
    revisionTopic: 'TCP SYN flood defense mechanisms',
  },
];

export const INITIAL_LMS_PROBLEMS: LMSCodingProblem[] = [
  {
    id: 'prob_01',
    title: 'Two Sum with Optimal Hash Map',
    difficulty: 'EASY',
    courseCode: 'CSE-302',
    language: 'Python',
    starterCode: `def two_sum(nums, target):
    lookup = {}
    for idx, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], idx]
        lookup[num] = idx
    return []

# Test Case
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`,
    solutionOutput: '[0, 1]',
    description: 'Find indices of the two numbers such that they add up to a specific target.',
  },
  {
    id: 'prob_02',
    title: 'Binary Tree Level Order Traversal (BFS)',
    difficulty: 'MEDIUM',
    courseCode: 'CSE-302',
    language: 'Python',
    starterCode: `from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def level_order(root):
    if not root:
        return []
    queue = deque([root])
    result = []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result

# Construct test tree: [3, 9, 20, None, None, 15, 7]
root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(level_order(root))`,
    solutionOutput: '[[3], [9, 20], [15, 7]]',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
  },
  {
    id: 'prob_03',
    title: 'PostgreSQL Relational Index Verification',
    difficulty: 'MEDIUM',
    courseCode: 'CSE-301',
    language: 'SQL',
    starterCode: `-- Analyze query execution plan with Index Scan
EXPLAIN ANALYZE
SELECT student_id, course_code, marks
FROM student_marks
WHERE course_code = 'CSE-301'
  AND marks >= 85;`,
    solutionOutput: 'Index Scan using idx_course_marks on student_marks (cost=0.29..8.31 rows=10 width=32) (actual time=0.038..0.045 rows=8 loops=1)',
    description: 'Execute query plan profiling to verify whether PostgreSQL engine leverages index scans.',
  },
];

// Helper functions for LMS persistence
const LMS_STORAGE_KEYS = {
  PROFILE: 'resora_lms_profile_v1',
  COURSES: 'resora_lms_courses_v1',
  ASSIGNMENTS: 'resora_lms_assignments_v1',
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
    console.error('Failed to save LMS data', e);
  }
}

export function getLMSProfile(): LMSStudentProfile {
  return safeGetStorage<LMSStudentProfile>(LMS_STORAGE_KEYS.PROFILE, INITIAL_LMS_PROFILE);
}

export function getLMSCourses(): LMSCourseModule[] {
  return safeGetStorage<LMSCourseModule[]>(LMS_STORAGE_KEYS.COURSES, INITIAL_LMS_COURSES);
}

export function getLMSAssignments(): LMSAssignment[] {
  return safeGetStorage<LMSAssignment[]>(LMS_STORAGE_KEYS.ASSIGNMENTS, INITIAL_LMS_ASSIGNMENTS);
}

export function submitLMSAssignment(assignmentId: string): LMSAssignment[] {
  const current = getLMSAssignments();
  const updated = current.map(asg => {
    if (asg.id === assignmentId) {
      return {
        ...asg,
        status: 'SUBMITTED' as const,
        submittedAt: new Date().toISOString().slice(0, 10),
        instructorFeedback: 'Submitted successfully to AceIt LMS portal. Awaiting instructor grading.',
      };
    }
    return asg;
  });
  safeSetStorage(LMS_STORAGE_KEYS.ASSIGNMENTS, updated);
  return updated;
}
