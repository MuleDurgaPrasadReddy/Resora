/**
 * Resora Student Analytics & Success Engine — Type Definitions
 * Targeting KPMG Domain: AI-Powered Student Analytics & Success Platform (HacXlerate Hackathon)
 *
 * NOTE: These types support transparent, explainable scoring and rule-based
 * at-risk classification. All values support nullable/optional fields to
 * handle partial records without falsely treating missing data as zero.
 */

export type StudentRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INSUFFICIENT_DATA';

export type StudentSegment =
  | 'HIGH_PERFORMER'
  | 'STEADY_PROGRESS'
  | 'ACADEMIC_RISK'
  | 'ATTENDANCE_RISK'
  | 'ASSIGNMENT_BACKLOG'
  | 'CRITICAL_INTERVENTION'
  | 'INSUFFICIENT_DATA';

export type RiskFlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskFlagCategory =
  | 'ACADEMIC'
  | 'ATTENDANCE'
  | 'ASSIGNMENTS'
  | 'ENGAGEMENT'
  | 'DATA_QUALITY';

export type AcademicTrend = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';

export interface RiskFlag {
  id: string;
  category: RiskFlagCategory;
  severity: RiskFlagSeverity;
  title: string;
  description: string;
  observedValue: string | number;
  thresholdValue: string | number;
  detectedAt: string;
}

export interface AcademicAssessment {
  name: string; // e.g. "Internal Assessment 1", "Midterm Examination", "Lab Practical"
  courseCode: string; // e.g. "CSE-301"
  courseName: string; // e.g. "Database Management Systems"
  score: number;
  maxScore: number;
  normalizedScore: number; // 0-100 scale
  weight?: number;
  date?: string;
}

export interface CourseAttendanceDetail {
  courseCode: string;
  courseName: string;
  percentage: number;
  attended: number;
  total: number;
}

export interface AcademicPerformance {
  assessments?: AcademicAssessment[];
  currentAverageScore?: number | null; // 0-100 scale
  historicalSemesterAverages?: number[]; // Genuine observations only (e.g. [78, 74, 69])
  recentTrend?: AcademicTrend;
  cgpa?: number | null; // Scale of 10.0
  currentBacklogs?: number | null;
}

export interface AttendanceMetrics {
  overallPercentage?: number | null; // 0-100 scale
  totalSessionsConducted?: number | null;
  sessionsAttended?: number | null;
  unexcusedAbsences?: number | null;
  consecutiveAbsences?: number | null;
  courseBreakdown?: CourseAttendanceDetail[];
}

export interface AssignmentMetrics {
  totalAssigned?: number | null;
  completedCount?: number | null;
  overdueCount?: number | null;
  completionRate?: number | null; // 0-100 scale
  averageScore?: number | null; // 0-100 scale
}

export interface LearningEngagement {
  overallEngagementScore?: number | null; // 0-100 scale
  prepProblemsSolved?: number | null;
  learningStreakDays?: number | null;
  projectMilestoneProgress?: number | null; // 0-100 scale
  lastActiveDate?: string | null;
}

export type ScoreComponentKey = 'academic' | 'attendance' | 'assignment' | 'engagement';

export interface ScoreComponentContribution {
  component: ScoreComponentKey;
  name: string;
  rawScore: number | null; // 0-100, null if missing
  nominalWeight: number; // Configured base weight (e.g. 0.35)
  effectiveWeight: number; // Proportionally reweighted if other components missing
  weightedPoints: number; // effectiveWeight * rawScore
  isAvailable: boolean;
}

export interface SuccessScoreBreakdown {
  academicContribution: ScoreComponentContribution;
  attendanceContribution: ScoreComponentContribution;
  assignmentContribution: ScoreComponentContribution;
  engagementContribution: ScoreComponentContribution;
  finalScore: number | null; // 0-100 rounded to 1 decimal place, null if INSUFFICIENT_DATA
  nominalTotalPoints: number;
  dataCompletenessPercentage: number; // 0-100 based on available components
  availableComponentsCount: number;
  totalComponentsCount: number;
  missingComponents: ScoreComponentKey[];
  isReweighted: boolean;
  explanationText: string;
}

export interface StudentRecommendation {
  id: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'INFO';
  category: 'ATTENDANCE' | 'ACADEMIC' | 'ASSIGNMENT' | 'ENGAGEMENT' | 'DATA_VERIFICATION';
  title: string;
  actionText: string;
  explanation: string;
  triggeredByIndicator: string;
  observedValue: string | number;
  suggestedTarget?: string;
}

export interface StudentAnalyticsRecord {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  avatar?: string;
  department: string; // "CSE" | "ECE" | "EEE" | "MECH" | "CIVIL"
  academicYear: number; // 1 | 2 | 3 | 4
  semester: number; // 1 - 8
  section: string; // e.g. "CSE-A", "CSE-B", "ECE-A", "EEE-A"
  
  // Data Dimensions
  academic: AcademicPerformance;
  attendance: AttendanceMetrics;
  assignments: AssignmentMetrics;
  engagement: LearningEngagement;

  // Metadata
  isSyntheticData: true;
  lastUpdated: string;

  // Derived Analytics Fields (Computed by Engine)
  computedScore?: SuccessScoreBreakdown;
  riskLevel?: StudentRiskLevel;
  segment?: StudentSegment;
  riskFlags?: RiskFlag[];
  recommendations?: StudentRecommendation[];
  lastEvaluatedAt?: string;
}

export interface ScoringEngineConfig {
  weights: {
    academic: number; // 0.35
    attendance: number; // 0.25
    assignment: number; // 0.20
    engagement: number; // 0.20
  };
  minCompletenessForScore: number; // minimum completeness percentage (e.g. 50%)
  minAvailableComponents: number; // minimum component count (e.g. 2)
  riskThresholds: {
    lowMin: number; // 80
    mediumMin: number; // 65
    highMin: number; // 45
    // < 45 is CRITICAL
  };
  flagThresholds: {
    attendanceWarning: number; // 75%
    attendanceCritical: number; // 65%
    academicWarning: number; // 50%
    academicCritical: number; // 40%
    assignmentCompletionWarning: number; // 70%
    maxConsecutiveAbsences: number; // 3
    maxOverdueAssignments: number; // 2
  };
}
