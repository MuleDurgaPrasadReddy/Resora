/**
 * Resora Student Intervention & Early-Warning Engine
 * Phase 5A Implementation for HacXlerate Hackathon (KPMG Student Success Domain)
 *
 * Rules:
 * 1. Evidence-based alert generation from deterministic analytics output.
 * 2. In-memory session prototype persistence (zero database writes, zero localStorage keys).
 * 3. Strict privacy isolation: Students only see sanitized status, never internal faculty mentoring notes.
 * 4. Transparent indicators: Attendance, declining trend, overdue assignments, backlogs, and data quality.
 */

import { StudentAnalyticsRecord, StudentRecommendation } from '@/types/studentAnalytics';

export type InterventionType =
  | 'ATTENDANCE_COUNSELING'
  | 'ACADEMIC_TUTORING'
  | 'ASSIGNMENT_RECOVERY'
  | 'DATA_COMPLETION'
  | 'WELLNESS_CHECK';

export type InterventionPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type InterventionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface InterventionHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  note?: string;
  previousStatus?: InterventionStatus;
  newStatus?: InterventionStatus;
}

export interface StudentIntervention {
  id: string;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  department: string;
  triggeredIndicator: string;
  interventionType: InterventionType;
  priority: InterventionPriority;
  status: InterventionStatus;
  actionNotes: string; // Faculty confidential mentoring notes
  assignedMentor: string; // Faculty mentor responsible
  followUpDate?: string; // YYYY-MM-DD
  outcomeNotes?: string; // Recorded when completing
  createdAt: string;
  updatedAt: string;
  history: InterventionHistoryEntry[];
  isSyntheticDemo: boolean;
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  department: string;
  avatar?: string;
  category: 'ATTENDANCE' | 'ACADEMIC' | 'ASSIGNMENTS' | 'BACKLOGS' | 'DATA_QUALITY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  observedIndicator: string;
  observedValue: string | number;
  thresholdValue?: string | number;
  recommendedAction: string;
  triggeredRecommendation?: StudentRecommendation;
  existingInterventionId?: string;
}

export interface InterventionSummaryCounts {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  followUpDueCount: number;
}

export interface StudentSafeInterventionView {
  id: string;
  title: string;
  typeLabel: string;
  priority: InterventionPriority;
  status: InterventionStatus;
  assignedMentor: string;
  followUpDate?: string;
  studentGuidance: string; // Sanitized, non-confidential instruction
}

/**
 * Human-readable labels and guidance per intervention type
 */
export const INTERVENTION_TYPE_DETAILS: Record<
  InterventionType,
  { label: string; defaultGuidance: string; color: string }
> = {
  ATTENDANCE_COUNSELING: {
    label: 'Attendance Counseling & Absence Audit',
    defaultGuidance: 'Please meet with your faculty advisor to discuss recent absences and verify medical or leave documentation.',
    color: 'emerald',
  },
  ACADEMIC_TUTORING: {
    label: 'Remedial Academic Tutoring',
    defaultGuidance: 'A peer tutoring review session has been scheduled. Bring recent quiz papers and topic questions.',
    color: 'brand',
  },
  ASSIGNMENT_RECOVERY: {
    label: 'Assignment Recovery Catch-Up Plan',
    defaultGuidance: 'A revised milestone schedule has been issued. Submit pending lab deliverables by the agreed follow-up date.',
    color: 'amber',
  },
  DATA_COMPLETION: {
    label: 'Student Profile & Data Completion',
    defaultGuidance: 'Please complete your student profile and verify course registrations in the student portal.',
    color: 'sky',
  },
  WELLNESS_CHECK: {
    label: 'Academic Advising & Engagement Check-In',
    defaultGuidance: 'Your department mentor has scheduled an advising check-in. Drop by during faculty office hours.',
    color: 'purple',
  },
};

/**
 * Generate evidence-based early-warning alerts across evaluated student records
 */
export function generateEarlyWarningAlerts(
  students: StudentAnalyticsRecord[],
  existingInterventions: StudentIntervention[] = []
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];

  students.forEach((student) => {
    // 1. Critical or Low Attendance Alert (< 75%)
    if (student.attendance.overallPercentage !== null && student.attendance.overallPercentage !== undefined) {
      if (student.attendance.overallPercentage < 75) {
        const isCritical = student.attendance.overallPercentage < 65;
        const matchingIntv = existingInterventions.find(
          (i) => i.studentId === student.id && i.interventionType === 'ATTENDANCE_COUNSELING' && i.status !== 'COMPLETED'
        );

        alerts.push({
          id: `alert_att_${student.id}`,
          studentId: student.id,
          studentRollNumber: student.rollNumber,
          studentName: student.name,
          department: student.department,
          avatar: student.avatar,
          category: 'ATTENDANCE',
          severity: isCritical ? 'CRITICAL' : 'HIGH',
          title: isCritical ? 'Critical Attendance Deficit (Debarment Warning)' : 'Attendance Below Minimum Threshold',
          observedIndicator: 'Class Attendance Percentage',
          observedValue: `${student.attendance.overallPercentage}%`,
          thresholdValue: '< 75.0% Required',
          recommendedAction: 'Initiate mandatory attendance counseling and absence audit.',
          existingInterventionId: matchingIntv?.id,
        });
      }
    }

    // 2. Genuine Declining Academic Trajectory
    if (
      student.academic.recentTrend === 'DECLINING' &&
      student.academic.historicalSemesterAverages &&
      student.academic.historicalSemesterAverages.length >= 2
    ) {
      const historyStr = student.academic.historicalSemesterAverages.join('% → ') + '%';
      const matchingIntv = existingInterventions.find(
        (i) => i.studentId === student.id && i.interventionType === 'ACADEMIC_TUTORING' && i.status !== 'COMPLETED'
      );

      alerts.push({
        id: `alert_trend_${student.id}`,
        studentId: student.id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        department: student.department,
        avatar: student.avatar,
        category: 'ACADEMIC',
        severity: 'HIGH',
        title: 'Declining Semester-over-Semester Trajectory',
        observedIndicator: 'Historical Semester Marks',
        observedValue: historyStr,
        thresholdValue: 'Downward trend detected over 2+ cycles',
        recommendedAction: 'Schedule diagnostic review and assign senior peer mentor.',
        existingInterventionId: matchingIntv?.id,
      });
    }

    // 3. Multiple Overdue Assignments
    if (student.assignments.overdueCount !== null && student.assignments.overdueCount !== undefined && student.assignments.overdueCount >= 2) {
      const matchingIntv = existingInterventions.find(
        (i) => i.studentId === student.id && i.interventionType === 'ASSIGNMENT_RECOVERY' && i.status !== 'COMPLETED'
      );

      alerts.push({
        id: `alert_asgn_${student.id}`,
        studentId: student.id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        department: student.department,
        avatar: student.avatar,
        category: 'ASSIGNMENTS',
        severity: student.assignments.overdueCount >= 3 ? 'HIGH' : 'MEDIUM',
        title: 'Unsubmitted Assignment Backlog',
        observedIndicator: 'Overdue Assignment Submissions',
        observedValue: `${student.assignments.overdueCount} overdue assignments`,
        thresholdValue: 'Max 1 overdue allowed',
        recommendedAction: 'Provide assignment recovery catch-up plan and deadline extension.',
        existingInterventionId: matchingIntv?.id,
      });
    }

    // 4. Active Academic Backlogs
    if (student.academic.currentBacklogs !== null && student.academic.currentBacklogs !== undefined && student.academic.currentBacklogs > 0) {
      const matchingIntv = existingInterventions.find(
        (i) => i.studentId === student.id && i.interventionType === 'ACADEMIC_TUTORING' && i.status !== 'COMPLETED'
      );

      alerts.push({
        id: `alert_backlog_${student.id}`,
        studentId: student.id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        department: student.department,
        avatar: student.avatar,
        category: 'BACKLOGS',
        severity: 'CRITICAL',
        title: 'Active Course Backlogs Pending Remediation',
        observedIndicator: 'Pending Arrears / Backlogs',
        observedValue: `${student.academic.currentBacklogs} backlog subject(s)`,
        thresholdValue: '0 Backlogs required for on-time clearance',
        recommendedAction: 'Mandate subject remedial coaching before upcoming supplementary exams.',
        existingInterventionId: matchingIntv?.id,
      });
    }

    // 5. Incomplete Profile / Insufficient Data (< 50% completeness)
    if (
      student.riskLevel === 'INSUFFICIENT_DATA' ||
      (student.computedScore && student.computedScore.dataCompletenessPercentage < 50)
    ) {
      const matchingIntv = existingInterventions.find(
        (i) => i.studentId === student.id && i.interventionType === 'DATA_COMPLETION' && i.status !== 'COMPLETED'
      );

      alerts.push({
        id: `alert_data_${student.id}`,
        studentId: student.id,
        studentRollNumber: student.rollNumber,
        studentName: student.name,
        department: student.department,
        avatar: student.avatar,
        category: 'DATA_QUALITY',
        severity: 'MEDIUM',
        title: 'Insufficient Student Data Profile (< 50% Completeness)',
        observedIndicator: 'Profile Dimensions Recorded',
        observedValue: `${student.computedScore?.availableComponentsCount || 1} of 4 dimensions recorded`,
        thresholdValue: 'Minimum 50% profile required for reliable scoring',
        recommendedAction: 'Notify student to complete missing department academic records.',
        existingInterventionId: matchingIntv?.id,
      });
    }
  });

  return alerts;
}

/**
 * Default demonstration interventions initialized for hackathon demo
 */
export const INITIAL_DEMO_INTERVENTIONS: StudentIntervention[] = [
  {
    id: 'intv_demo_01',
    studentId: 'stu_synth_11',
    studentRollNumber: '2023CSE031',
    studentName: 'Vikram Singh',
    department: 'CSE',
    triggeredIndicator: 'Critical Attendance Deficit (58.5% < 75.0%)',
    interventionType: 'ATTENDANCE_COUNSELING',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    actionNotes: 'Held preliminary advising session on Oct 10. Student was recovering from viral illness in weeks 3-4. Requested official medical fitness certificate for condonation.',
    assignedMentor: 'Prof. Sharma (CSE)',
    followUpDate: '2026-10-16',
    createdAt: '2026-10-10T10:30:00Z',
    updatedAt: '2026-10-10T11:00:00Z',
    isSyntheticDemo: true,
    history: [
      {
        id: 'hist_01_a',
        timestamp: '2026-10-10T10:30:00Z',
        action: 'Intervention Created',
        performedBy: 'Prof. Sharma',
        note: 'Triggered by 58.5% attendance alert.',
        newStatus: 'OPEN',
      },
      {
        id: 'hist_01_b',
        timestamp: '2026-10-10T11:00:00Z',
        action: 'Status Updated to In Progress',
        performedBy: 'Prof. Sharma',
        note: 'Met with student in department office. Medical docs requested.',
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
      },
    ],
  },
  {
    id: 'intv_demo_02',
    studentId: 'stu_synth_05',
    studentRollNumber: '2023CSE012',
    studentName: 'Aryan Reddy',
    department: 'CSE',
    triggeredIndicator: 'Assignment Recovery Plan (Overdue Milestone)',
    interventionType: 'ASSIGNMENT_RECOVERY',
    priority: 'MEDIUM',
    status: 'OPEN',
    actionNotes: 'Student has one overdue Cloud Systems assignment due to cloud credit quota issues. Provided extended deadline until Oct 18.',
    assignedMentor: 'Dr. Radhika Rao (CSE)',
    followUpDate: '2026-10-18',
    createdAt: '2026-10-11T14:15:00Z',
    updatedAt: '2026-10-11T14:15:00Z',
    isSyntheticDemo: true,
    history: [
      {
        id: 'hist_02_a',
        timestamp: '2026-10-11T14:15:00Z',
        action: 'Intervention Created',
        performedBy: 'Dr. Radhika Rao',
        note: 'Cloud Systems assignment backlog follow-up.',
        newStatus: 'OPEN',
      },
    ],
  },
  {
    id: 'intv_demo_03',
    studentId: 'stu_synth_10',
    studentRollNumber: '2023ECE015',
    studentName: 'Aditi Joshi',
    department: 'ECE',
    triggeredIndicator: 'Declining Semester Trajectory (80% → 72% → 60%)',
    interventionType: 'ACADEMIC_TUTORING',
    priority: 'HIGH',
    status: 'COMPLETED',
    actionNotes: 'Assigned senior M.Tech peer tutor for Digital Signal Processing. Student completed 3 targeted remedial problem-solving sessions.',
    outcomeNotes: 'Student showed substantial recovery in Midterm 2, scoring 68%. Trend stabilized.',
    assignedMentor: 'Prof. K. Venkatesh (ECE)',
    followUpDate: '2026-10-09',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-09T16:00:00Z',
    isSyntheticDemo: true,
    history: [
      {
        id: 'hist_03_a',
        timestamp: '2026-09-28T09:00:00Z',
        action: 'Intervention Created',
        performedBy: 'Prof. K. Venkatesh',
        note: 'DSP performance dip noted.',
        newStatus: 'OPEN',
      },
      {
        id: 'hist_03_b',
        timestamp: '2026-10-02T11:00:00Z',
        action: 'Status Updated to In Progress',
        performedBy: 'Prof. K. Venkatesh',
        note: 'Peer tutoring sessions initiated.',
        previousStatus: 'OPEN',
        newStatus: 'IN_PROGRESS',
      },
      {
        id: 'hist_03_c',
        timestamp: '2026-10-09T16:00:00Z',
        action: 'Status Updated to Completed',
        performedBy: 'Prof. K. Venkatesh',
        note: 'Remedial coaching successfully completed. Midterm mark: 68%.',
        previousStatus: 'IN_PROGRESS',
        newStatus: 'COMPLETED',
      },
    ],
  },
];

/**
 * In-Memory Session Store for Interventions (Module-level singleton for session duration)
 */
class InterventionSessionStore {
  private interventions: StudentIntervention[] = [...INITIAL_DEMO_INTERVENTIONS];

  public getAll(): StudentIntervention[] {
    return [...this.interventions];
  }

  public getByStudentId(studentId: string): StudentIntervention[] {
    return this.interventions.filter((i) => i.studentId === studentId);
  }

  public getByRollNumber(rollNumber: string): StudentIntervention[] {
    return this.interventions.filter(
      (i) => i.studentRollNumber.toLowerCase() === rollNumber.toLowerCase()
    );
  }

  public add(intervention: Omit<StudentIntervention, 'id' | 'createdAt' | 'updatedAt' | 'history'>): StudentIntervention {
    const now = new Date().toISOString();
    const newRecord: StudentIntervention = {
      ...intervention,
      id: `intv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `hist_${Date.now()}`,
          timestamp: now,
          action: 'Intervention Created',
          performedBy: intervention.assignedMentor || 'Faculty Member',
          note: intervention.actionNotes,
          newStatus: intervention.status,
        },
      ],
    };

    this.interventions.unshift(newRecord);
    return newRecord;
  }

  public updateStatus(
    id: string,
    newStatus: InterventionStatus,
    performedBy: string,
    note?: string,
    outcomeNotes?: string
  ): StudentIntervention | null {
    const target = this.interventions.find((i) => i.id === id);
    if (!target) return null;

    const prevStatus = target.status;
    const now = new Date().toISOString();

    target.status = newStatus;
    target.updatedAt = now;
    if (outcomeNotes) {
      target.outcomeNotes = outcomeNotes;
    }

    target.history.push({
      id: `hist_${Date.now()}`,
      timestamp: now,
      action: `Status changed to ${newStatus}`,
      performedBy: performedBy || 'Faculty Member',
      note: note || (outcomeNotes ? `Outcome: ${outcomeNotes}` : undefined),
      previousStatus: prevStatus,
      newStatus,
    });

    return { ...target };
  }

  public reset(): void {
    this.interventions = [...INITIAL_DEMO_INTERVENTIONS];
  }
}

// Global module singleton instance
export const interventionStore = new InterventionSessionStore();

/**
 * Compute compact summary metrics across current interventions
 */
export function calculateInterventionSummary(
  interventions: StudentIntervention[]
): InterventionSummaryCounts {
  const total = interventions.length;
  const open = interventions.filter((i) => i.status === 'OPEN').length;
  const inProgress = interventions.filter((i) => i.status === 'IN_PROGRESS').length;
  const completed = interventions.filter((i) => i.status === 'COMPLETED').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const followUpDueCount = interventions.filter((i) => {
    if (i.status === 'COMPLETED' || !i.followUpDate) return false;
    // Due if followUpDate is today or past
    return i.followUpDate <= todayStr;
  }).length;

  return {
    total,
    open,
    inProgress,
    completed,
    followUpDueCount,
  };
}

/**
 * Privacy-Preserving Student Safe Extractor
 * Strictly omits confidential faculty mentoring notes, internal risk labels, and other students' data.
 */
export function getStudentSafeInterventions(
  studentId?: string,
  rollNumber?: string
): StudentSafeInterventionView[] {
  if (!studentId && !rollNumber) return [];

  const all = interventionStore.getAll();
  const matched = all.filter((i) => {
    if (studentId && i.studentId === studentId) return true;
    if (rollNumber && i.studentRollNumber.toLowerCase() === rollNumber.toLowerCase()) return true;
    return false;
  });

  return matched.map((i) => {
    const details = INTERVENTION_TYPE_DETAILS[i.interventionType];
    return {
      id: i.id,
      title: details.label,
      typeLabel: details.label,
      priority: i.priority,
      status: i.status,
      assignedMentor: i.assignedMentor,
      followUpDate: i.followUpDate,
      studentGuidance: details.defaultGuidance,
    };
  });
}
