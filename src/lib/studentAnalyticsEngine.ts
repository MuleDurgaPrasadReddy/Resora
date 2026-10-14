/**
 * Resora Student Success Score Engine
 * Pure, deterministic scoring & explainable analytics calculation module.
 *
 * Designed for HacXlerate Hackathon (KPMG Domain: AI-Powered Student Analytics)
 *
 * CORE PRINCIPLES:
 * 1. Missing data is NEVER treated as zero.
 * 2. Missing components are transparently reweighted proportionally among available components.
 * 3. Records failing minimum completeness thresholds are classified as INSUFFICIENT_DATA.
 * 4. Every score and risk level is accompanied by factor decomposition and specific evidence.
 */

import {
  StudentAnalyticsRecord,
  ScoringEngineConfig,
  SuccessScoreBreakdown,
  ScoreComponentContribution,
  ScoreComponentKey,
  StudentRiskLevel,
  StudentSegment,
  RiskFlag,
  StudentRecommendation,
  AcademicTrend,
} from '@/types/studentAnalytics';

/**
 * Configurable Engine Settings
 * Prototype thresholds and weights kept in a single transparent location.
 */
export const DEFAULT_SCORING_CONFIG: ScoringEngineConfig = {
  weights: {
    academic: 0.35,
    attendance: 0.25,
    assignment: 0.20,
    engagement: 0.20,
  },
  minCompletenessForScore: 50, // Minimum % of data dimensions required
  minAvailableComponents: 2, // At least 2 distinct data dimensions required
  riskThresholds: {
    lowMin: 80,
    mediumMin: 65,
    highMin: 45,
    // < 45 is CRITICAL
  },
  flagThresholds: {
    attendanceWarning: 75,
    attendanceCritical: 65,
    academicWarning: 50,
    academicCritical: 40,
    assignmentCompletionWarning: 70,
    maxConsecutiveAbsences: 3,
    maxOverdueAssignments: 2,
  },
};

/**
 * Extract and normalize raw score for each component to a strict 0–100 scale.
 * Returns null if data is missing or undefined (never coerces missing to 0).
 */
export function extractComponentScores(record: StudentAnalyticsRecord): {
  academic: number | null;
  attendance: number | null;
  assignment: number | null;
  engagement: number | null;
} {
  // 1. Academic Performance (0-100)
  let academic: number | null = null;
  if (record.academic?.currentAverageScore != null && !isNaN(record.academic.currentAverageScore)) {
    academic = clamp(record.academic.currentAverageScore, 0, 100);
  } else if (record.academic?.assessments && record.academic.assessments.length > 0) {
    const validAssessments = record.academic.assessments.filter(
      a => a.normalizedScore != null && !isNaN(a.normalizedScore)
    );
    if (validAssessments.length > 0) {
      const sum = validAssessments.reduce((acc, curr) => acc + curr.normalizedScore, 0);
      academic = clamp(sum / validAssessments.length, 0, 100);
    }
  }

  // 2. Attendance (0-100)
  let attendance: number | null = null;
  if (record.attendance?.overallPercentage != null && !isNaN(record.attendance.overallPercentage)) {
    attendance = clamp(record.attendance.overallPercentage, 0, 100);
  } else if (
    record.attendance?.sessionsAttended != null &&
    record.attendance?.totalSessionsConducted != null &&
    record.attendance.totalSessionsConducted > 0
  ) {
    const calculated = (record.attendance.sessionsAttended / record.attendance.totalSessionsConducted) * 100;
    attendance = clamp(calculated, 0, 100);
  }

  // 3. Assignment Metrics (0-100)
  let assignment: number | null = null;
  if (record.assignments?.completionRate != null && !isNaN(record.assignments.completionRate)) {
    assignment = clamp(record.assignments.completionRate, 0, 100);
  } else if (
    record.assignments?.completedCount != null &&
    record.assignments?.totalAssigned != null &&
    record.assignments.totalAssigned > 0
  ) {
    const calculated = (record.assignments.completedCount / record.assignments.totalAssigned) * 100;
    assignment = clamp(calculated, 0, 100);
  }

  // 4. Learning Engagement (0-100)
  let engagement: number | null = null;
  if (record.engagement?.overallEngagementScore != null && !isNaN(record.engagement.overallEngagementScore)) {
    engagement = clamp(record.engagement.overallEngagementScore, 0, 100);
  } else if (record.engagement?.projectMilestoneProgress != null && !isNaN(record.engagement.projectMilestoneProgress)) {
    engagement = clamp(record.engagement.projectMilestoneProgress, 0, 100);
  }

  return { academic, attendance, assignment, engagement };
}

/**
 * Calculate proportional re-weighting when components are missing.
 * E.g., if academic (0.35) is missing, the remaining weights (0.25 + 0.20 + 0.20 = 0.65)
 * are scaled by (1 / 0.65) so their effective weights sum to exactly 1.0.
 */
export function calculateSuccessScore(
  record: StudentAnalyticsRecord,
  config: ScoringEngineConfig = DEFAULT_SCORING_CONFIG
): SuccessScoreBreakdown {
  const scores = extractComponentScores(record);

  const componentDefs: Array<{ key: ScoreComponentKey; name: string; rawScore: number | null; nominalWeight: number }> = [
    { key: 'academic', name: 'Academic Assessments', rawScore: scores.academic, nominalWeight: config.weights.academic },
    { key: 'attendance', name: 'Campus & Class Attendance', rawScore: scores.attendance, nominalWeight: config.weights.attendance },
    { key: 'assignment', name: 'Assignment Completion', rawScore: scores.assignment, nominalWeight: config.weights.assignment },
    { key: 'engagement', name: 'Learning & Project Engagement', rawScore: scores.engagement, nominalWeight: config.weights.engagement },
  ];

  const availableComponents = componentDefs.filter(c => c.rawScore !== null);
  const missingComponents = componentDefs.filter(c => c.rawScore === null).map(c => c.key);

  const availableCount = availableComponents.length;
  const totalCount = componentDefs.length;
  const dataCompletenessPercentage = Math.round((availableCount / totalCount) * 100);

  // Check if minimum data completeness requirements are met
  const hasSufficientData =
    availableCount >= config.minAvailableComponents &&
    dataCompletenessPercentage >= config.minCompletenessForScore;

  // Calculate sum of nominal weights for available components
  const sumAvailableNominalWeights = availableComponents.reduce((sum, c) => sum + c.nominalWeight, 0);

  // Build contributions for each component
  const contributions: Record<ScoreComponentKey, ScoreComponentContribution> = {
    academic: createContribution('academic', 'Academic Assessments', scores.academic, config.weights.academic, sumAvailableNominalWeights),
    attendance: createContribution('attendance', 'Campus & Class Attendance', scores.attendance, config.weights.attendance, sumAvailableNominalWeights),
    assignment: createContribution('assignment', 'Assignment Completion', scores.assignment, config.weights.assignment, sumAvailableNominalWeights),
    engagement: createContribution('engagement', 'Learning & Project Engagement', scores.engagement, config.weights.engagement, sumAvailableNominalWeights),
  };

  let finalScore: number | null = null;
  let nominalTotalPoints = 0;
  let explanationText = '';

  if (hasSufficientData && sumAvailableNominalWeights > 0) {
    let unroundedWeightedSum = 0;
    availableComponents.forEach(c => {
      const raw = c.rawScore ?? 0;
      const effectiveWeight = sumAvailableNominalWeights > 0 ? c.nominalWeight / sumAvailableNominalWeights : 0;
      unroundedWeightedSum += effectiveWeight * raw;
      nominalTotalPoints += c.nominalWeight * raw;
    });

    finalScore = Math.round(unroundedWeightedSum * 10) / 10; // Round to 1 decimal place
    // Guarantee bounds
    finalScore = clamp(finalScore, 0, 100);

    const isReweighted = missingComponents.length > 0;
    explanationText = isReweighted
      ? `Calculated from ${availableCount} of ${totalCount} available dimensions (${dataCompletenessPercentage}% completeness). Weights were proportionally normalized to 100% due to unrecorded ${missingComponents.join(', ')}.`
      : `Comprehensive score computed across all 4 operational dimensions (100% data completeness).`;
  } else {
    explanationText = `Insufficient data to calculate a reliable success score. Only ${availableCount} of ${totalCount} components available (${dataCompletenessPercentage}% completeness, minimum required is ${config.minCompletenessForScore}%). Missing: ${missingComponents.join(', ')}.`;
  }

  return {
    academicContribution: contributions.academic,
    attendanceContribution: contributions.attendance,
    assignmentContribution: contributions.assignment,
    engagementContribution: contributions.engagement,
    finalScore,
    nominalTotalPoints: Math.round(nominalTotalPoints * 10) / 10,
    dataCompletenessPercentage,
    availableComponentsCount: availableCount,
    totalComponentsCount: totalCount,
    missingComponents,
    isReweighted: missingComponents.length > 0 && hasSufficientData,
    explanationText,
  };
}

function createContribution(
  key: ScoreComponentKey,
  name: string,
  rawScore: number | null,
  nominalWeight: number,
  sumAvailableNominalWeights: number
): ScoreComponentContribution {
  const isAvailable = rawScore !== null;
  const effectiveWeight = isAvailable && sumAvailableNominalWeights > 0
    ? nominalWeight / sumAvailableNominalWeights
    : 0;
  const weightedPoints = isAvailable ? effectiveWeight * rawScore : 0;

  return {
    component: key,
    name,
    rawScore,
    nominalWeight,
    effectiveWeight: Math.round(effectiveWeight * 1000) / 1000,
    weightedPoints: Math.round(weightedPoints * 10) / 10,
    isAvailable,
  };
}

/**
 * Classify Student Risk Level using transparent configurable boundaries.
 */
export function classifyRiskLevel(
  scoreBreakdown: SuccessScoreBreakdown,
  config: ScoringEngineConfig = DEFAULT_SCORING_CONFIG
): StudentRiskLevel {
  if (scoreBreakdown.finalScore === null) {
    return 'INSUFFICIENT_DATA';
  }

  const score = scoreBreakdown.finalScore;
  if (score >= config.riskThresholds.lowMin) {
    return 'LOW';
  } else if (score >= config.riskThresholds.mediumMin) {
    return 'MEDIUM';
  } else if (score >= config.riskThresholds.highMin) {
    return 'HIGH';
  } else {
    return 'CRITICAL';
  }
}

/**
 * Evaluate Evidence-Based Risk Flags based strictly on observed indicators.
 */
export function evaluateRiskFlags(
  record: StudentAnalyticsRecord,
  config: ScoringEngineConfig = DEFAULT_SCORING_CONFIG
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const now = new Date().toISOString();

  // 1. Attendance Flags
  if (record.attendance.overallPercentage != null) {
    const att = record.attendance.overallPercentage;
    if (att < config.flagThresholds.attendanceCritical) {
      flags.push({
        id: `flag_att_crit_${record.id}`,
        category: 'ATTENDANCE',
        severity: 'CRITICAL',
        title: 'Severe Attendance Deficit',
        description: `Overall attendance has fallen to ${att}%, critically below university minimum threshold (${config.flagThresholds.attendanceWarning}%).`,
        observedValue: `${att}%`,
        thresholdValue: `${config.flagThresholds.attendanceCritical}%`,
        detectedAt: now,
      });
    } else if (att < config.flagThresholds.attendanceWarning) {
      flags.push({
        id: `flag_att_warn_${record.id}`,
        category: 'ATTENDANCE',
        severity: 'HIGH',
        title: 'Attendance Below Mandatory Threshold',
        description: `Current attendance is ${att}%, failing the ${config.flagThresholds.attendanceWarning}% minimum required for exam eligibility.`,
        observedValue: `${att}%`,
        thresholdValue: `${config.flagThresholds.attendanceWarning}%`,
        detectedAt: now,
      });
    }
  }

  // Consecutive absences flag
  if (record.attendance.consecutiveAbsences != null && record.attendance.consecutiveAbsences >= config.flagThresholds.maxConsecutiveAbsences) {
    flags.push({
      id: `flag_att_consec_${record.id}`,
      category: 'ATTENDANCE',
      severity: 'HIGH',
      title: 'Prolonged Absence Streak',
      description: `Observed ${record.attendance.consecutiveAbsences} consecutive class absences without approved leave notification.`,
      observedValue: `${record.attendance.consecutiveAbsences} sessions`,
      thresholdValue: `${config.flagThresholds.maxConsecutiveAbsences} sessions`,
      detectedAt: now,
    });
  }

  // 2. Academic Assessment Flags
  if (record.academic.currentAverageScore != null) {
    const avg = record.academic.currentAverageScore;
    if (avg < config.flagThresholds.academicCritical) {
      flags.push({
        id: `flag_acad_crit_${record.id}`,
        category: 'ACADEMIC',
        severity: 'CRITICAL',
        title: 'Critical Academic Performance',
        description: `Average internal assessment score is ${avg}%, indicating significant subject struggle.`,
        observedValue: `${avg}%`,
        thresholdValue: `${config.flagThresholds.academicCritical}%`,
        detectedAt: now,
      });
    } else if (avg < config.flagThresholds.academicWarning) {
      flags.push({
        id: `flag_acad_warn_${record.id}`,
        category: 'ACADEMIC',
        severity: 'MEDIUM',
        title: 'Borderline Assessment Average',
        description: `Internal score average (${avg}%) is near academic probation cutoffs.`,
        observedValue: `${avg}%`,
        thresholdValue: `${config.flagThresholds.academicWarning}%`,
        detectedAt: now,
      });
    }
  }

  // Declining Academic Trend (Only when genuine historical observations exist)
  if (
    record.academic.historicalSemesterAverages &&
    record.academic.historicalSemesterAverages.length >= 2
  ) {
    const history = record.academic.historicalSemesterAverages;
    const isConsecutivelyDeclining = history.slice(1).every((val, idx) => val < history[idx]);
    const overallDrop = history[0] - history[history.length - 1];

    if (isConsecutivelyDeclining || overallDrop >= 10) {
      flags.push({
        id: `flag_acad_trend_${record.id}`,
        category: 'ACADEMIC',
        severity: 'HIGH',
        title: 'Consecutive Academic Decline',
        description: `Semester performance dropped from ${history[0]}% to ${history[history.length - 1]}% across past evaluation cycles.`,
        observedValue: `${history.join('% → ')}%`,
        thresholdValue: 'Stable or improving',
        detectedAt: now,
      });
    }
  }

  // Active Backlogs Flag
  if (record.academic.currentBacklogs != null && record.academic.currentBacklogs > 0) {
    flags.push({
      id: `flag_backlogs_${record.id}`,
      category: 'ACADEMIC',
      severity: record.academic.currentBacklogs >= 2 ? 'CRITICAL' : 'HIGH',
      title: 'Active Course Backlogs',
      description: `Student currently has ${record.academic.currentBacklogs} uncleared subject backlog(s).`,
      observedValue: `${record.academic.currentBacklogs} backlog(s)`,
      thresholdValue: '0 backlogs',
      detectedAt: now,
    });
  }

  // 3. Assignment Flags
  if (record.assignments.overdueCount != null && record.assignments.overdueCount >= config.flagThresholds.maxOverdueAssignments) {
    flags.push({
      id: `flag_asgn_overdue_${record.id}`,
      category: 'ASSIGNMENTS',
      severity: 'MEDIUM',
      title: 'Multiple Overdue Submissions',
      description: `${record.assignments.overdueCount} assignments currently overdue past submission deadlines.`,
      observedValue: `${record.assignments.overdueCount} overdue`,
      thresholdValue: `< ${config.flagThresholds.maxOverdueAssignments}`,
      detectedAt: now,
    });
  }

  if (
    record.assignments.completionRate != null &&
    record.assignments.completionRate < config.flagThresholds.assignmentCompletionWarning
  ) {
    flags.push({
      id: `flag_asgn_rate_${record.id}`,
      category: 'ASSIGNMENTS',
      severity: 'MEDIUM',
      title: 'Low Assignment Submission Rate',
      description: `Assignment completion rate is ${record.assignments.completionRate}%, below target expectations (${config.flagThresholds.assignmentCompletionWarning}%).`,
      observedValue: `${record.assignments.completionRate}%`,
      thresholdValue: `${config.flagThresholds.assignmentCompletionWarning}%`,
      detectedAt: now,
    });
  }

  // 4. Data Quality Flags
  const scores = extractComponentScores(record);
  const missingKeys = Object.entries(scores)
    .filter(([_, v]) => v === null)
    .map(([k]) => k);

  if (missingKeys.length > 0) {
    const isCritical = missingKeys.length > 2;
    flags.push({
      id: `flag_data_missing_${record.id}`,
      category: 'DATA_QUALITY',
      severity: isCritical ? 'HIGH' : 'LOW',
      title: isCritical ? 'Insufficient Student Record Data' : 'Partial Data Profile',
      description: `Missing institutional records for: ${missingKeys.join(', ')}.`,
      observedValue: `${4 - missingKeys.length}/4 recorded`,
      thresholdValue: '4/4 recorded',
      detectedAt: now,
    });
  }

  return flags;
}

/**
 * Generate Smart, Actionable Recommendations tied to observed evidence.
 */
export function generateSmartRecommendations(
  record: StudentAnalyticsRecord,
  flags: RiskFlag[],
  scoreBreakdown: SuccessScoreBreakdown
): StudentRecommendation[] {
  const recs: StudentRecommendation[] = [];

  // 1. Data verification recommendation if data is incomplete
  if (scoreBreakdown.missingComponents.length > 0) {
    recs.push({
      id: `rec_data_${record.id}`,
      priority: scoreBreakdown.availableComponentsCount < 2 ? 'URGENT' : 'INFO',
      category: 'DATA_VERIFICATION',
      title: 'Complete Student Academic Profile',
      actionText: `Request verification and import for missing ${scoreBreakdown.missingComponents.join(', ')} data.`,
      explanation: 'Accurate success scoring and risk profiling requires records across all operational dimensions.',
      triggeredByIndicator: `Missing components: ${scoreBreakdown.missingComponents.join(', ')}`,
      observedValue: `${scoreBreakdown.dataCompletenessPercentage}% completeness`,
      suggestedTarget: '100% profile completeness',
    });
  }

  // 2. Attendance Interventions
  if (record.attendance.overallPercentage != null && record.attendance.overallPercentage < 75) {
    const att = record.attendance.overallPercentage;
    recs.push({
      id: `rec_att_${record.id}`,
      priority: att < 65 ? 'URGENT' : 'HIGH',
      category: 'ATTENDANCE',
      title: 'Mandatory Attendance Counseling',
      actionText: 'Schedule immediate 1-on-1 mentoring meeting with faculty mentor to address lecture absences.',
      explanation: `Attendance is at ${att}%. Student must attend upcoming sessions consistently to avoid debarment.`,
      triggeredByIndicator: 'Attendance below 75% threshold',
      observedValue: `${att}%`,
      suggestedTarget: '>= 75.0% by mid-term',
    });
  }

  // 3. Academic Remediation
  if (record.academic.currentAverageScore != null && record.academic.currentAverageScore < 60) {
    const score = record.academic.currentAverageScore;
    recs.push({
      id: `rec_acad_${record.id}`,
      priority: score < 45 ? 'URGENT' : 'HIGH',
      category: 'ACADEMIC',
      title: 'Enroll in Department Remedial Sessions',
      actionText: 'Assign peer tutoring and recommend targeted practice problems in Resora Preparation Hub.',
      explanation: `Internal assessment score average is ${score}%. Subject revision and structured problem practice recommended.`,
      triggeredByIndicator: 'Internal assessment score < 60%',
      observedValue: `${score}%`,
      suggestedTarget: '>= 65% on next assessment cycle',
    });
  }

  // 4. Overdue Assignment Follow-up
  if (record.assignments.overdueCount != null && record.assignments.overdueCount > 0) {
    recs.push({
      id: `rec_asgn_${record.id}`,
      priority: record.assignments.overdueCount >= 2 ? 'HIGH' : 'MEDIUM',
      category: 'ASSIGNMENT',
      title: 'Assignment Submission Recovery Plan',
      actionText: `Provide extension window and office-hours review for ${record.assignments.overdueCount} overdue assignment(s).`,
      explanation: 'Resolving overdue homework recovers assignment component contribution points directly.',
      triggeredByIndicator: `${record.assignments.overdueCount} overdue assignment(s)`,
      observedValue: `${record.assignments.overdueCount} overdue`,
      suggestedTarget: '0 overdue submissions',
    });
  }

  // 5. Engagement & Project Boost
  if (record.engagement.overallEngagementScore != null && record.engagement.overallEngagementScore < 50) {
    recs.push({
      id: `rec_eng_${record.id}`,
      priority: 'MEDIUM',
      category: 'ENGAGEMENT',
      title: 'Engage in Capstone Lab Practice',
      actionText: 'Reserve campus lab slot or connect with project team to advance project milestones.',
      explanation: 'Active project and lab participation directly builds practical skills and elevates engagement points.',
      triggeredByIndicator: `Low learning engagement (${record.engagement.overallEngagementScore}%)`,
      observedValue: `${record.engagement.overallEngagementScore}%`,
      suggestedTarget: '>= 70% milestone completion',
    });
  }

  return recs;
}

/**
 * Segment Students into Actionable Operational Cohorts
 */
export function classifyStudentSegment(
  record: StudentAnalyticsRecord,
  scoreBreakdown: SuccessScoreBreakdown,
  riskLevel: StudentRiskLevel,
  flags: RiskFlag[]
): StudentSegment {
  if (riskLevel === 'INSUFFICIENT_DATA') {
    return 'INSUFFICIENT_DATA';
  }

  if (riskLevel === 'CRITICAL') {
    return 'CRITICAL_INTERVENTION';
  }

  // Check specific risk dominant flags
  const hasAttendanceFlag = flags.some(f => f.category === 'ATTENDANCE');
  const hasAcademicFlag = flags.some(f => f.category === 'ACADEMIC');
  const hasAssignmentFlag = flags.some(f => f.category === 'ASSIGNMENTS' && f.title.includes('Overdue'));

  if (hasAttendanceFlag && (record.attendance.overallPercentage ?? 100) < 70) {
    return 'ATTENDANCE_RISK';
  }

  if (hasAcademicFlag && (record.academic.currentAverageScore ?? 100) < 55) {
    return 'ACADEMIC_RISK';
  }

  if (hasAssignmentFlag && (record.assignments.overdueCount ?? 0) >= 2) {
    return 'ASSIGNMENT_BACKLOG';
  }

  if (scoreBreakdown.finalScore != null && scoreBreakdown.finalScore >= 80) {
    return 'HIGH_PERFORMER';
  }

  return 'STEADY_PROGRESS';
}

/**
 * Complete Full Analytics Pipeline for a single student record.
 * Pure and deterministic. Returns an enriched record with all computed analytics.
 */
export function evaluateStudentAnalytics(
  record: StudentAnalyticsRecord,
  config: ScoringEngineConfig = DEFAULT_SCORING_CONFIG
): StudentAnalyticsRecord {
  const computedScore = calculateSuccessScore(record, config);
  const riskLevel = classifyRiskLevel(computedScore, config);
  const riskFlags = evaluateRiskFlags(record, config);
  const recommendations = generateSmartRecommendations(record, riskFlags, computedScore);
  const segment = classifyStudentSegment(record, computedScore, riskLevel, riskFlags);

  return {
    ...record,
    computedScore,
    riskLevel,
    segment,
    riskFlags,
    recommendations,
    lastEvaluatedAt: new Date().toISOString(),
  };
}

/**
 * Batch Evaluate a collection of student records.
 */
export function evaluateCohortAnalytics(
  records: StudentAnalyticsRecord[],
  config: ScoringEngineConfig = DEFAULT_SCORING_CONFIG
): StudentAnalyticsRecord[] {
  return records.map(record => evaluateStudentAnalytics(record, config));
}

// Utility helper
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
