/**
 * Reproducible Verification Test Suite for Student Analytics Engine
 * Phase 1 Validation (Pure TypeScript, Zero New Dependencies)
 *
 * Runs deterministic tests against all requirements:
 * 1. Boundary scoring (100 and 0)
 * 2. Weighted component calculations
 * 3. Missing data policy (proportional reweighting vs silent zeroing)
 * 4. Incomplete data & INSUFFICIENT_DATA thresholds
 * 5. Risk classification boundary precision
 * 6. Declining trend evidence verification
 * 7. Evidence-based recommendations
 * 8. Pure determinism
 * 9. Full cohort evaluation across all 30 synthetic student records
 */

import {
  calculateSuccessScore,
  classifyRiskLevel,
  evaluateRiskFlags,
  generateSmartRecommendations,
  evaluateStudentAnalytics,
  evaluateCohortAnalytics,
  DEFAULT_SCORING_CONFIG,
} from '../src/lib/studentAnalyticsEngine';
import { SYNTHETIC_STUDENT_ANALYTICS } from '../src/lib/studentAnalyticsData';
import { StudentAnalyticsRecord } from '../src/types/studentAnalytics';
import {
  parseCsvText,
  validateAndParseStudentCsv,
  generateExampleCsvTemplate,
  computeDepartmentAnalytics,
  exportInstitutionalSummaryCsv,
  exportValidationErrorsCsv,
} from '../src/lib/csvAnalyticsImport';
import {
  generateEarlyWarningAlerts,
  interventionStore,
  calculateInterventionSummary,
  getStudentSafeInterventions,
  INITIAL_DEMO_INTERVENTIONS,
} from '../src/lib/studentInterventionEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
    if (failureDetails) console.error(`    Details: ${failureDetails}`);
  }
}

function createBaseRecord(partial: Partial<StudentAnalyticsRecord> = {}): StudentAnalyticsRecord {
  return {
    id: 'test_student_01',
    rollNumber: '2023CSE999',
    name: 'Test Student',
    email: 'test@resora.demo',
    department: 'CSE',
    academicYear: 3,
    semester: 5,
    section: 'CSE-A',
    academic: {
      currentAverageScore: 80,
      historicalSemesterAverages: [],
      recentTrend: 'STABLE',
    },
    attendance: {
      overallPercentage: 80,
      totalSessionsConducted: 80,
      sessionsAttended: 64,
    },
    assignments: {
      totalAssigned: 10,
      completedCount: 8,
      overdueCount: 0,
      completionRate: 80,
    },
    engagement: {
      overallEngagementScore: 80,
    },
    isSyntheticData: true,
    lastUpdated: new Date().toISOString(),
    ...partial,
  };
}

console.log('\n===============================================================');
console.log('RESORA STUDENT ANALYTICS & SUCCESS SCORE ENGINE TEST SUITE');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// TEST 1: All Components at 100
// ---------------------------------------------------------------------------
console.log('Test Group 1: Perfect Score Boundary (All Components at 100)');
{
  const record = createBaseRecord({
    academic: { currentAverageScore: 100 },
    attendance: { overallPercentage: 100 },
    assignments: { completionRate: 100 },
    engagement: { overallEngagementScore: 100 },
  });
  const result = calculateSuccessScore(record);
  assert(result.finalScore === 100, 'All components at 100 produces finalScore = 100', `Got ${result.finalScore}`);
  assert(result.dataCompletenessPercentage === 100, 'Completeness is 100%', `Got ${result.dataCompletenessPercentage}%`);
  assert(classifyRiskLevel(result) === 'LOW', 'Risk level is LOW', `Got ${classifyRiskLevel(result)}`);
}

// ---------------------------------------------------------------------------
// TEST 2: All Components at 0
// ---------------------------------------------------------------------------
console.log('\nTest Group 2: Zero Score Boundary (All Components at 0)');
{
  const record = createBaseRecord({
    academic: { currentAverageScore: 0 },
    attendance: { overallPercentage: 0 },
    assignments: { completionRate: 0 },
    engagement: { overallEngagementScore: 0 },
  });
  const result = calculateSuccessScore(record);
  assert(result.finalScore === 0, 'All components at 0 produces finalScore = 0', `Got ${result.finalScore}`);
  assert(classifyRiskLevel(result) === 'CRITICAL', 'Risk level is CRITICAL', `Got ${classifyRiskLevel(result)}`);
}

// ---------------------------------------------------------------------------
// TEST 3: Mathematical Correctness of Weighted Scoring
// ---------------------------------------------------------------------------
console.log('\nTest Group 3: Weighted Component Calculation Accuracy');
{
  // Weights: Academic=0.35, Attendance=0.25, Assignment=0.20, Engagement=0.20
  // Values: Academic=80 (28.0), Attendance=70 (17.5), Assignment=90 (18.0), Engagement=60 (12.0)
  // Expected Sum: 28.0 + 17.5 + 18.0 + 12.0 = 75.5
  const record = createBaseRecord({
    academic: { currentAverageScore: 80 },
    attendance: { overallPercentage: 70 },
    assignments: { completionRate: 90 },
    engagement: { overallEngagementScore: 60 },
  });
  const result = calculateSuccessScore(record);
  assert(result.finalScore === 75.5, 'Expected 75.5 weighted score', `Got ${result.finalScore}`);
  assert(result.academicContribution.weightedPoints === 28.0, 'Academic weighted contribution is 28.0', `Got ${result.academicContribution.weightedPoints}`);
  assert(result.attendanceContribution.weightedPoints === 17.5, 'Attendance weighted contribution is 17.5', `Got ${result.attendanceContribution.weightedPoints}`);
  assert(result.assignmentContribution.weightedPoints === 18.0, 'Assignment weighted contribution is 18.0', `Got ${result.assignmentContribution.weightedPoints}`);
  assert(result.engagementContribution.weightedPoints === 12.0, 'Engagement weighted contribution is 12.0', `Got ${result.engagementContribution.weightedPoints}`);
}

// ---------------------------------------------------------------------------
// TEST 4: Missing Data Policy (Proportional Reweighting, NEVER Silently Zeroed)
// ---------------------------------------------------------------------------
console.log('\nTest Group 4: Missing Data Policy (Proportional Reweighting)');
{
  // Available: Academic=80 (weight 0.35), Attendance=70 (weight 0.25)
  // Missing: Assignment=null (weight 0.20), Engagement=null (weight 0.20)
  // Available weights sum = 0.35 + 0.25 = 0.60
  // Effective Academic Weight = 0.35 / 0.60 = 0.5833...
  // Effective Attendance Weight = 0.25 / 0.60 = 0.4166...
  // Expected finalScore = (0.35/0.60 * 80) + (0.25/0.60 * 70) = 46.666 + 29.166 = 75.833 -> 75.8
  // If silently zeroed, score would be: 0.35*80 + 0.25*70 + 0 + 0 = 45.5 (FALSE DEFICIT!)
  const record = createBaseRecord({
    academic: { currentAverageScore: 80 },
    attendance: { overallPercentage: 70 },
    assignments: { completionRate: null },
    engagement: { overallEngagementScore: null },
  });
  const result = calculateSuccessScore(record);
  assert(result.finalScore === 75.8, 'Proportionally reweighted score is 75.8', `Got ${result.finalScore}`);
  assert(result.finalScore !== 45.5, 'Did NOT silently coerce missing components to zero (not 45.5)', `Got ${result.finalScore}`);
  assert(result.isReweighted === true, 'isReweighted flag is true', `Got ${result.isReweighted}`);
  assert(result.missingComponents.includes('assignment') && result.missingComponents.includes('engagement'), 'Correctly identifies missing components', `Got ${result.missingComponents.join(', ')}`);
  assert(result.dataCompletenessPercentage === 50, 'Data completeness is 50%', `Got ${result.dataCompletenessPercentage}%`);
}

// ---------------------------------------------------------------------------
// TEST 5: Insufficient Data Handling (< 50% completeness or < 2 components)
// ---------------------------------------------------------------------------
console.log('\nTest Group 5: Insufficient Data Protection (INSUFFICIENT_DATA)');
{
  // Only 1 component available (25% completeness)
  const record = createBaseRecord({
    academic: { currentAverageScore: null },
    attendance: { overallPercentage: 85 }, // Only attendance recorded
    assignments: { completionRate: null },
    engagement: { overallEngagementScore: null },
  });
  const result = calculateSuccessScore(record);
  assert(result.finalScore === null, 'finalScore is null when data is insufficient', `Got ${result.finalScore}`);
  assert(result.dataCompletenessPercentage === 25, 'Completeness is 25%', `Got ${result.dataCompletenessPercentage}%`);
  assert(classifyRiskLevel(result) === 'INSUFFICIENT_DATA', 'Risk level is INSUFFICIENT_DATA', `Got ${classifyRiskLevel(result)}`);
}

// ---------------------------------------------------------------------------
// TEST 6: Risk Classification Boundary Precision
// ---------------------------------------------------------------------------
console.log('\nTest Group 6: Risk Threshold Precision at Boundaries');
{
  const makeScore = (score: number) => ({
    ...calculateSuccessScore(createBaseRecord()),
    finalScore: score,
  });

  assert(classifyRiskLevel(makeScore(80.0)) === 'LOW', 'Score 80.0 is LOW (Boundary)', `Got ${classifyRiskLevel(makeScore(80.0))}`);
  assert(classifyRiskLevel(makeScore(79.9)) === 'MEDIUM', 'Score 79.9 is MEDIUM (Boundary)', `Got ${classifyRiskLevel(makeScore(79.9))}`);
  assert(classifyRiskLevel(makeScore(65.0)) === 'MEDIUM', 'Score 65.0 is MEDIUM (Boundary)', `Got ${classifyRiskLevel(makeScore(65.0))}`);
  assert(classifyRiskLevel(makeScore(64.9)) === 'HIGH', 'Score 64.9 is HIGH (Boundary)', `Got ${classifyRiskLevel(makeScore(64.9))}`);
  assert(classifyRiskLevel(makeScore(45.0)) === 'HIGH', 'Score 45.0 is HIGH (Boundary)', `Got ${classifyRiskLevel(makeScore(45.0))}`);
  assert(classifyRiskLevel(makeScore(44.9)) === 'CRITICAL', 'Score 44.9 is CRITICAL (Boundary)', `Got ${classifyRiskLevel(makeScore(44.9))}`);
  assert(classifyRiskLevel(makeScore(0.0)) === 'CRITICAL', 'Score 0.0 is CRITICAL', `Got ${classifyRiskLevel(makeScore(0.0))}`);
}

// ---------------------------------------------------------------------------
// TEST 7: Declining Trend Flags Only When Genuine Observations Exist
// ---------------------------------------------------------------------------
console.log('\nTest Group 7: Declining Trend Verification (Genuine History Only)');
{
  // 1. No history -> should NOT flag decline
  const noHistoryRecord = createBaseRecord({
    academic: { currentAverageScore: 60, historicalSemesterAverages: [] },
  });
  const noHistoryFlags = evaluateRiskFlags(noHistoryRecord);
  assert(!noHistoryFlags.some(f => f.id.includes('trend')), 'No trend flag when historicalSemesterAverages is empty', 'Found unexpected trend flag');

  // 2. Stable history [75, 75, 76] -> should NOT flag decline
  const stableRecord = createBaseRecord({
    academic: { currentAverageScore: 76, historicalSemesterAverages: [75, 75, 76] },
  });
  const stableFlags = evaluateRiskFlags(stableRecord);
  assert(!stableFlags.some(f => f.id.includes('trend')), 'No trend flag when history is stable', 'Found unexpected trend flag');

  // 3. Genuine steep decline [82, 73, 58] -> MUST flag decline with high severity
  const decliningRecord = createBaseRecord({
    academic: { currentAverageScore: 54, historicalSemesterAverages: [82, 73, 58] },
  });
  const decliningFlags = evaluateRiskFlags(decliningRecord);
  const trendFlag = decliningFlags.find(f => f.id.includes('trend'));
  assert(trendFlag !== undefined, 'Trend flag generated for [82, 73, 58]', 'Trend flag was missing');
  assert(trendFlag?.severity === 'HIGH', 'Trend flag severity is HIGH', `Got ${trendFlag?.severity}`);
  assert(String(trendFlag?.observedValue).includes('82% → 73% → 58%'), 'Trend flag includes observed trajectory', `Got ${trendFlag?.observedValue}`);
}

// ---------------------------------------------------------------------------
// TEST 8: Smart Actionable Recommendations Triggered by Evidence
// ---------------------------------------------------------------------------
console.log('\nTest Group 8: Smart Recommendations Evidence-Based Triggers');
{
  const atRiskRecord = createBaseRecord({
    attendance: { overallPercentage: 62.0 }, // Below 75%
    academic: { currentAverageScore: 42.0 }, // Below 60%
    assignments: { overdueCount: 3, completionRate: 60.0 }, // Overdue
    engagement: { overallEngagementScore: 35.0 }, // Low engagement
  });
  const flags = evaluateRiskFlags(atRiskRecord);
  const score = calculateSuccessScore(atRiskRecord);
  const recs = generateSmartRecommendations(atRiskRecord, flags, score);

  const attRec = recs.find(r => r.category === 'ATTENDANCE');
  const acadRec = recs.find(r => r.category === 'ACADEMIC');
  const asgnRec = recs.find(r => r.category === 'ASSIGNMENT');
  const engRec = recs.find(r => r.category === 'ENGAGEMENT');

  assert(attRec !== undefined, 'Attendance counseling recommendation generated', 'Missing attendance rec');
  assert(attRec?.observedValue === '62%', 'Attendance rec cites observed value 62%', `Got ${attRec?.observedValue}`);
  assert(acadRec !== undefined, 'Remedial session recommendation generated', 'Missing academic rec');
  assert(asgnRec !== undefined, 'Assignment recovery recommendation generated', 'Missing assignment rec');
  assert(engRec !== undefined, 'Engagement practice recommendation generated', 'Missing engagement rec');
}

// ---------------------------------------------------------------------------
// TEST 9: Determinism & Idempotency
// ---------------------------------------------------------------------------
console.log('\nTest Group 9: Determinism & Idempotency');
{
  const record = createBaseRecord();
  const run1 = evaluateStudentAnalytics(record);
  const run2 = evaluateStudentAnalytics(record);

  assert(run1.computedScore?.finalScore === run2.computedScore?.finalScore, 'Repeated score calculations match exactly', `${run1.computedScore?.finalScore} vs ${run2.computedScore?.finalScore}`);
  assert(run1.riskLevel === run2.riskLevel, 'Repeated risk classifications match exactly', `${run1.riskLevel} vs ${run2.riskLevel}`);
  assert(run1.segment === run2.segment, 'Repeated segment classifications match exactly', `${run1.segment} vs ${run2.segment}`);
  assert(run1.riskFlags?.length === run2.riskFlags?.length, 'Repeated flag counts match exactly', `${run1.riskFlags?.length} vs ${run2.riskFlags?.length}`);
  assert(run1.recommendations?.length === run2.recommendations?.length, 'Repeated recommendation counts match exactly', `${run1.recommendations?.length} vs ${run2.recommendations?.length}`);
}

// ---------------------------------------------------------------------------
// TEST 10: Full Synthetic Cohort Batch Evaluation (30 Records)
// ---------------------------------------------------------------------------
console.log('\nTest Group 10: Cohort Batch Evaluation (30 Synthetic Students)');
{
  assert(SYNTHETIC_STUDENT_ANALYTICS.length === 30, 'Synthetic dataset has exactly 30 student records', `Got ${SYNTHETIC_STUDENT_ANALYTICS.length}`);

  const evaluated = evaluateCohortAnalytics(SYNTHETIC_STUDENT_ANALYTICS);
  assert(evaluated.length === 30, 'Cohort evaluation returned 30 evaluated records', `Got ${evaluated.length}`);

  // Count by risk level
  const riskCounts = evaluated.reduce((acc, curr) => {
    const level = curr.riskLevel || 'INSUFFICIENT_DATA';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('    Cohort Risk Distribution:', JSON.stringify(riskCounts, null, 2));

  assert((riskCounts['LOW'] || 0) > 0, 'Cohort contains LOW risk students', `Got ${riskCounts['LOW']}`);
  assert((riskCounts['MEDIUM'] || 0) > 0, 'Cohort contains MEDIUM risk students', `Got ${riskCounts['MEDIUM']}`);
  assert((riskCounts['HIGH'] || 0) > 0, 'Cohort contains HIGH risk students', `Got ${riskCounts['HIGH']}`);
  assert((riskCounts['CRITICAL'] || 0) > 0, 'Cohort contains CRITICAL risk students', `Got ${riskCounts['CRITICAL']}`);
  assert((riskCounts['INSUFFICIENT_DATA'] || 0) > 0, 'Cohort contains INSUFFICIENT_DATA students', `Got ${riskCounts['INSUFFICIENT_DATA']}`);

  // Validate no NaN values in any computed scores
  const hasNan = evaluated.some(r => r.computedScore?.finalScore !== null && isNaN(r.computedScore?.finalScore!));
  assert(!hasNan, 'Zero NaN values across all 30 computed student records');

  // Verify explicit synthetic flag preserved
  const allSynthetic = evaluated.every(r => r.isSyntheticData === true);
  assert(allSynthetic, 'All evaluated records are explicitly tagged as synthetic demonstration data');
}

// ---------------------------------------------------------------------------
// TEST 11: Phase 4 CSV Validation Engine & Department Aggregation
// ---------------------------------------------------------------------------
console.log('\nTest Group 11: Phase 4 CSV Parser, Validation & Institutional Aggregates');
{
  // 11.1 RFC 4180 Parsing with quoted commas and escaped quotes
  const rfcCsv = 'roll_number,name,department\n2023CSE001,"Reddy, Aryan",CSE\n2023CSE002,"She said ""Hello""",CSE';
  const parsedRfc = parseCsvText(rfcCsv);
  assert(parsedRfc.length === 3, 'RFC parser parsed exactly 3 rows (1 header + 2 data)');
  assert(parsedRfc[1][1] === 'Reddy, Aryan', 'Quoted comma parsed without splitting field', parsedRfc[1][1]);
  assert(parsedRfc[2][1] === 'She said "Hello"', 'Escaped quotes unescaped correctly', parsedRfc[2][1]);

  // 11.2 Missing Required Header Column Detection
  const missingHeaderCsv = 'roll_number,name,email\n2023CSE001,Aryan,test@resora.demo';
  const missingHeaderResult = validateAndParseStudentCsv(missingHeaderCsv);
  assert(!missingHeaderResult.isProcessable, 'CSV missing "department" is not processable');
  assert(
    missingHeaderResult.errors.some(e => e.column === 'department'),
    'Missing mandatory "department" column flagged as error'
  );

  // 11.3 Numerical Out-of-Bounds Rejection (Score > 100, Attendance < 0)
  const invalidBoundsCsv = [
    'roll_number,name,department,academic_score,attendance_percentage',
    '2023CSE001,Aryan,CSE,105,85',
    '2023CSE002,Pooja,CSE,75,-10',
  ].join('\n');
  const boundsResult = validateAndParseStudentCsv(invalidBoundsCsv);
  assert(boundsResult.invalidRowsCount === 2, 'Both out-of-bounds rows marked invalid', `Got ${boundsResult.invalidRowsCount}`);
  assert(
    boundsResult.errors.some(e => e.column === 'academic_score' && e.value === '105'),
    'Score > 100 flagged with exact column and value'
  );
  assert(
    boundsResult.errors.some(e => e.column === 'attendance_percentage' && e.value === '-10'),
    'Attendance < 0 flagged with exact column and value'
  );

  // 11.4 Duplicate Roll Number Detection
  const duplicateCsv = [
    'roll_number,name,department',
    '2023CSE001,Aryan,CSE',
    '2023CSE001,Aryan Duplicate,CSE',
  ].join('\n');
  const duplicateResult = validateAndParseStudentCsv(duplicateCsv);
  assert(
    duplicateResult.errors.some(e => e.column === 'roll_number' && e.message.includes('Duplicate')),
    'Duplicate roll number within CSV is flagged as error'
  );

  // 11.5 Blank/Missing Optional Metrics Preserved as Null (Never Zeroed)
  const incompleteCsv = [
    'roll_number,name,department,academic_score,attendance_percentage',
    '2023CSE003,Incomplete Student,CSE,,',
  ].join('\n');
  const incompleteResult = validateAndParseStudentCsv(incompleteCsv);
  assert(incompleteResult.validRecords.length === 1, 'Incomplete record parsed into validRecords');
  const incRec = incompleteResult.validRecords[0];
  assert(incRec.academic.currentAverageScore === null, 'Missing academic score preserved as null (not zero)');
  assert(incRec.attendance.overallPercentage === null, 'Missing attendance percentage preserved as null (not zero)');

  // 11.6 Department Aggregation Engine (`computeDepartmentAnalytics`)
  const evaluatedAll = evaluateCohortAnalytics(SYNTHETIC_STUDENT_ANALYTICS);
  const deptSummaries = computeDepartmentAnalytics(evaluatedAll);
  assert(deptSummaries.length >= 3, 'Aggregated across at least 3 departments (CSE, ECE, EEE)');

  const cseDept = deptSummaries.find(d => d.department === 'CSE');
  assert(cseDept !== undefined, 'CSE department summary generated');
  if (cseDept) {
    assert(cseDept.totalStudents === 14, 'CSE department has 14 students');
    assert(cseDept.averageSuccessScore !== null && cseDept.averageSuccessScore > 0, 'CSE average score computed');
    assert(cseDept.validScoreCount <= cseDept.totalStudents, 'CSE valid score count does not exceed total students');
    assert(cseDept.riskDistribution.LOW + cseDept.riskDistribution.MEDIUM + cseDept.riskDistribution.HIGH + cseDept.riskDistribution.CRITICAL + cseDept.riskDistribution.INSUFFICIENT_DATA === cseDept.totalStudents, 'Risk distribution sums to total students');
  }

  // 11.7 Example CSV Template Integrity
  const templateCsv = generateExampleCsvTemplate();
  const templateResult = validateAndParseStudentCsv(templateCsv);
  assert(templateResult.isProcessable, 'Example template CSV is processable');
  assert(templateResult.validRowsCount === 7, 'Example template parses all 7 sample rows cleanly', `Got ${templateResult.validRowsCount}`);
  assert(templateResult.invalidRowsCount === 0, 'Example template has zero invalid rows');

  // 11.8 Export Report Generation
  const summaryText = exportInstitutionalSummaryCsv({
    dataSourceLabel: 'Synthetic Demonstration Dataset (30 Records)',
    totalEvaluated: evaluatedAll.length,
    validScoreCount: 28,
    averageSuccessScore: 78.4,
    sufficientDataPercentage: 93,
    insufficientDataCount: 2,
    riskCounts: { LOW: 13, MEDIUM: 5, HIGH: 8, CRITICAL: 2, INSUFFICIENT_DATA: 2 },
    departmentSummaries: deptSummaries,
  });
  assert(summaryText.includes('RESORA INSTITUTIONAL STUDENT SUCCESS ANALYTICS REPORT'), 'Institutional CSV export contains header');
  assert(summaryText.includes('DEPARTMENT BREAKDOWN'), 'Institutional CSV export contains department breakdown');

  const errorReportText = exportValidationErrorsCsv(boundsResult.errors);
  assert(errorReportText.includes('RESORA CSV IMPORT VALIDATION ERROR REPORT'), 'Error report CSV contains header');
  assert(errorReportText.includes('academic_score'), 'Error report CSV details bad columns');
}

// ---------------------------------------------------------------------------
// TEST 12: Phase 5A Intervention Management & Early-Warning Alerts
// ---------------------------------------------------------------------------
console.log('\nTest Group 12: Phase 5A Early-Warning Alerts & Intervention Store');
{
  const evaluatedAll = evaluateCohortAnalytics(SYNTHETIC_STUDENT_ANALYTICS);
  const alerts = generateEarlyWarningAlerts(evaluatedAll, INITIAL_DEMO_INTERVENTIONS);

  assert(alerts.length > 0, 'Early-warning alerts generated from evaluated cohort', `Got ${alerts.length}`);

  // 12.1 Attendance Deficit Trigger
  const attAlert = alerts.find(a => a.category === 'ATTENDANCE' && a.studentRollNumber === '2023CSE031');
  assert(attAlert !== undefined, 'Attendance deficit alert generated for Vikram Singh (2023CSE031)');
  if (attAlert) {
    assert(attAlert.severity === 'CRITICAL', 'Vikram Singh attendance alert severity is CRITICAL');
    assert(attAlert.observedValue === '58.5%', 'Observed attendance value matches record');
    assert(Boolean(attAlert.thresholdValue?.toString().includes('75.0%')), 'Threshold specifies 75.0% attendance requirement');
  }

  // 12.2 Declining Academic Trajectory Trigger
  const trendAlert = alerts.find(a => a.category === 'ACADEMIC' && a.studentRollNumber === '2023ECE015');
  assert(trendAlert !== undefined, 'Declining trajectory alert generated for Aditi Joshi (2023ECE015)');
  if (trendAlert) {
    assert(trendAlert.observedValue.toString().includes('80% → 72% → 60%'), 'Observed declining marks sequence detailed in alert');
  }

  // 12.3 Insufficient Data Profile Trigger
  const dataAlerts = alerts.filter(a => a.category === 'DATA_QUALITY');
  assert(dataAlerts.length >= 2, 'Data quality alerts generated for students with < 50% completeness');

  // 12.4 In-Memory Intervention Store Operations
  const initialCount = interventionStore.getAll().length;
  assert(initialCount >= 3, 'Intervention store initialized with demonstration records', `Got ${initialCount}`);

  // Add new intervention
  const newIntv = interventionStore.add({
    studentId: 'stu_synth_01',
    studentRollNumber: '2023CSE001',
    studentName: 'Aarav Patel',
    department: 'CSE',
    triggeredIndicator: 'Test Attendance Alert',
    interventionType: 'ATTENDANCE_COUNSELING',
    priority: 'HIGH',
    status: 'OPEN',
    actionNotes: 'Faculty action note for testing verification.',
    assignedMentor: 'Prof. Test Mentor',
    followUpDate: '2026-10-25',
    isSyntheticDemo: true,
  });
  assert(newIntv.id.startsWith('intv_'), 'New intervention generated with stable prefix ID');
  assert(newIntv.history.length === 1, 'Initial history entry logged for creation');

  // Update intervention status to IN_PROGRESS
  const updatedIntv = interventionStore.updateStatus(newIntv.id, 'IN_PROGRESS', 'Prof. Test Mentor', 'Started advising');
  assert(updatedIntv?.status === 'IN_PROGRESS', 'Intervention successfully transitioned to IN_PROGRESS');
  assert(updatedIntv?.history.length === 2, 'History log appended second status change entry');

  // Update intervention status to COMPLETED with outcome
  const completedIntv = interventionStore.updateStatus(
    newIntv.id,
    'COMPLETED',
    'Prof. Test Mentor',
    'Session finished',
    'Student met attendance target of 80%.'
  );
  assert(completedIntv?.status === 'COMPLETED', 'Intervention successfully closed as COMPLETED');
  assert(Boolean(completedIntv?.outcomeNotes?.includes('met attendance target')), 'Outcome note recorded on completed intervention');

  // 12.5 Dynamic Summary Counts Calculation
  const summary = calculateInterventionSummary(interventionStore.getAll());
  assert(summary.total === initialCount + 1, 'Total interventions count updated dynamically');
  assert(summary.completed >= 2, 'Completed interventions count calculated dynamically');

  // 12.6 Student-Safe Intervention Isolation (Privacy Rule)
  const safeViews = getStudentSafeInterventions('stu_synth_05', '2023CSE012'); // Aryan Reddy
  assert(safeViews.length >= 1, 'Safe view generated for Aryan Reddy');
  if (safeViews.length > 0) {
    const view = safeViews[0];
    assert((view as any).actionNotes === undefined, 'Confidential faculty actionNotes strictly omitted from student view');
    assert((view as any).history === undefined, 'Internal faculty activity history omitted from student view');
    assert(view.studentGuidance.length > 0, 'Sanitized student guidance provided');
    assert(view.assignedMentor.length > 0, 'Faculty mentor name visible to student');
  }

  // Cross-student privacy isolation: Ensure Vikram Singh does not see Aryan Reddy's interventions
  const otherStudentViews = getStudentSafeInterventions('stu_synth_99', '2023CSE999');
  assert(otherStudentViews.length === 0, 'No interventions returned for non-assigned student');
}

console.log('\n===============================================================');
console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
