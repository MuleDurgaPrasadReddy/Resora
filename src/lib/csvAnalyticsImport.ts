/**
 * Resora CSV Student Analytics Import & Validation Engine
 * Pure TypeScript client-side CSV parser, validator, and schema transformer.
 *
 * Designed for HacXlerate Hackathon (KPMG Domain: AI-Powered Student Analytics)
 *
 * RULES:
 * 1. Strict RFC 4180 compliant parsing (handles quoted commas, escaped quotes, multi-line).
 * 2. Missing values are preserved as null — NEVER silently coerced to zero.
 * 3. In-memory session preview only (zero persistence to localStorage or backend).
 * 4. Comprehensive per-row error tracking (invalid ranges, missing required fields, duplicates).
 */

import { StudentAnalyticsRecord } from '@/types/studentAnalytics';

export interface CsvRowError {
  rowNumber: number;
  column: string;
  value: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface CsvValidationResult {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  warningRowsCount: number;
  headers: string[];
  previewRows: Array<Record<string, string>>;
  errors: CsvRowError[];
  validRecords: StudentAnalyticsRecord[];
  isProcessable: boolean;
}

export interface DepartmentMetricSummary {
  department: string;
  totalStudents: number;
  validScoreCount: number;
  averageSuccessScore: number | null; // null if 0 valid scores
  attendanceCount: number;
  averageAttendance: number | null; // null if 0 attendance values
  academicCount: number;
  averageAcademic: number | null;
  assignmentCount: number;
  averageAssignment: number | null;
  engagementCount: number;
  averageEngagement: number | null;
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
    INSUFFICIENT_DATA: number;
  };
}

export interface InstitutionalAnalyticsSummary {
  dataSourceLabel: string;
  totalEvaluated: number;
  validScoreCount: number;
  averageSuccessScore: number | null;
  sufficientDataPercentage: number;
  insufficientDataCount: number;
  riskCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
    INSUFFICIENT_DATA: number;
  };
  departmentSummaries: DepartmentMetricSummary[];
}

/**
 * Robust RFC-4180 CSV Text Parser
 * Correctly handles:
 * - Commas inside quoted fields: "Reddy, Aryan"
 * - Escaped double quotes: "He said ""Hello"""
 * - Windows (\r\n) and Unix (\n) line breaks
 * - Whitespace trimming around unquoted fields
 */
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  const text = csvText.trim();
  if (!text) return [];

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // End of quoted string
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push final field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter(row => row.length > 0 && row.some(cell => cell.length > 0));
}

/**
 * Standard CSV Column Schema definition
 */
export const REQUIRED_CSV_COLUMNS = ['roll_number', 'name', 'department'] as const;

export const KNOWN_CSV_COLUMNS = [
  'roll_number',
  'name',
  'email',
  'department',
  'academic_year',
  'semester',
  'section',
  'academic_score',
  'attendance_percentage',
  'assignment_completion_rate',
  'overdue_assignments',
  'engagement_score',
] as const;

/**
 * Validates and converts parsed CSV rows into typed StudentAnalyticsRecords.
 */
export function validateAndParseStudentCsv(csvText: string): CsvValidationResult {
  const rawRows = parseCsvText(csvText);

  if (rawRows.length === 0) {
    return {
      totalRows: 0,
      validRowsCount: 0,
      invalidRowsCount: 0,
      warningRowsCount: 0,
      headers: [],
      previewRows: [],
      errors: [{ rowNumber: 1, column: 'FILE', value: '', message: 'Uploaded CSV file is completely empty.', severity: 'ERROR' }],
      validRecords: [],
      isProcessable: false,
    };
  }

  const rawHeaders = rawRows[0].map(h => h.toLowerCase().trim().replace(/[\s-]+/g, '_'));
  const dataRows = rawRows.slice(1);

  const errors: CsvRowError[] = [];

  // 1. Validate required header columns
  for (const reqCol of REQUIRED_CSV_COLUMNS) {
    if (!rawHeaders.includes(reqCol)) {
      errors.push({
        rowNumber: 1,
        column: reqCol,
        value: '',
        message: `Missing mandatory CSV header: '${reqCol}'. File must contain columns: ${REQUIRED_CSV_COLUMNS.join(', ')}.`,
        severity: 'ERROR',
      });
    }
  }

  if (errors.some(e => e.severity === 'ERROR')) {
    return {
      totalRows: dataRows.length,
      validRowsCount: 0,
      invalidRowsCount: dataRows.length,
      warningRowsCount: 0,
      headers: rawHeaders,
      previewRows: [],
      errors,
      validRecords: [],
      isProcessable: false,
    };
  }

  const headerIndices: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerIndices[h] = idx;
  });

  const validRecords: StudentAnalyticsRecord[] = [];
  const previewRows: Array<Record<string, string>> = [];
  const seenRollNumbers = new Set<string>();

  dataRows.forEach((row, rowIdx) => {
    const rowNum = rowIdx + 2; // 1-indexed including header
    let rowHasError = false;

    // Helper getter
    const getVal = (col: string): string => {
      const idx = headerIndices[col];
      return idx !== undefined && idx < row.length ? row[idx].trim() : '';
    };

    // Store preview representation (up to first 8 rows)
    if (previewRows.length < 8) {
      const previewObj: Record<string, string> = {};
      rawHeaders.forEach(h => {
        previewObj[h] = getVal(h);
      });
      previewRows.push(previewObj);
    }

    // Required Field 1: roll_number
    const rollNumber = getVal('roll_number');
    if (!rollNumber) {
      errors.push({
        rowNumber: rowNum,
        column: 'roll_number',
        value: '',
        message: 'Student roll number / identifier is mandatory.',
        severity: 'ERROR',
      });
      rowHasError = true;
    } else {
      const cleanRoll = rollNumber.toUpperCase();
      if (seenRollNumbers.has(cleanRoll)) {
        errors.push({
          rowNumber: rowNum,
          column: 'roll_number',
          value: rollNumber,
          message: `Duplicate student identifier '${rollNumber}' detected in file.`,
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        seenRollNumbers.add(cleanRoll);
      }
    }

    // Required Field 2: name
    const name = getVal('name');
    if (!name) {
      errors.push({
        rowNumber: rowNum,
        column: 'name',
        value: '',
        message: 'Student name is mandatory.',
        severity: 'ERROR',
      });
      rowHasError = true;
    }

    // Required Field 3: department
    const deptRaw = getVal('department').toUpperCase();
    if (!deptRaw) {
      errors.push({
        rowNumber: rowNum,
        column: 'department',
        value: '',
        message: 'Department code is mandatory.',
        severity: 'ERROR',
      });
      rowHasError = true;
    }

    // Optional email
    const email = getVal('email') || `${(name || 'student').toLowerCase().replace(/\s+/g, '.')}@resora.preview`;

    // Optional academic year (1 - 4)
    let academicYear = 3;
    const yearStr = getVal('academic_year');
    if (yearStr) {
      const parsedYear = parseInt(yearStr, 10);
      if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 4) {
        errors.push({
          rowNumber: rowNum,
          column: 'academic_year',
          value: yearStr,
          message: 'Academic year must be an integer between 1 and 4.',
          severity: 'WARNING',
        });
      } else {
        academicYear = parsedYear;
      }
    }

    // Optional semester (1 - 8)
    let semester = academicYear * 2 - 1;
    const semStr = getVal('semester');
    if (semStr) {
      const parsedSem = parseInt(semStr, 10);
      if (isNaN(parsedSem) || parsedSem < 1 || parsedSem > 8) {
        errors.push({
          rowNumber: rowNum,
          column: 'semester',
          value: semStr,
          message: 'Semester must be an integer between 1 and 8.',
          severity: 'WARNING',
        });
      } else {
        semester = parsedSem;
      }
    }

    // Optional section
    const section = getVal('section') || `${deptRaw}-A`;

    // Dimensional Value 1: Academic Score (0 - 100, optional, null if blank)
    let academicScore: number | null = null;
    const acadStr = getVal('academic_score');
    if (acadStr) {
      const parsedAcad = parseFloat(acadStr);
      if (isNaN(parsedAcad) || parsedAcad < 0 || parsedAcad > 100) {
        errors.push({
          rowNumber: rowNum,
          column: 'academic_score',
          value: acadStr,
          message: 'Academic score must be a number between 0 and 100.',
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        academicScore = parsedAcad;
      }
    }

    // Dimensional Value 2: Attendance Percentage (0 - 100, optional, null if blank)
    let attendancePercentage: number | null = null;
    const attStr = getVal('attendance_percentage');
    if (attStr) {
      const parsedAtt = parseFloat(attStr);
      if (isNaN(parsedAtt) || parsedAtt < 0 || parsedAtt > 100) {
        errors.push({
          rowNumber: rowNum,
          column: 'attendance_percentage',
          value: attStr,
          message: 'Attendance percentage must be a number between 0 and 100.',
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        attendancePercentage = parsedAtt;
      }
    }

    // Dimensional Value 3: Assignment Completion Rate (0 - 100, optional, null if blank)
    let assignmentCompletionRate: number | null = null;
    const asgnStr = getVal('assignment_completion_rate');
    if (asgnStr) {
      const parsedAsgn = parseFloat(asgnStr);
      if (isNaN(parsedAsgn) || parsedAsgn < 0 || parsedAsgn > 100) {
        errors.push({
          rowNumber: rowNum,
          column: 'assignment_completion_rate',
          value: asgnStr,
          message: 'Assignment completion rate must be a number between 0 and 100.',
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        assignmentCompletionRate = parsedAsgn;
      }
    }

    // Optional overdue assignments
    let overdueCount: number | null = null;
    const overdueStr = getVal('overdue_assignments');
    if (overdueStr) {
      const parsedOverdue = parseInt(overdueStr, 10);
      if (isNaN(parsedOverdue) || parsedOverdue < 0) {
        errors.push({
          rowNumber: rowNum,
          column: 'overdue_assignments',
          value: overdueStr,
          message: 'Overdue assignments must be a positive integer.',
          severity: 'WARNING',
        });
      } else {
        overdueCount = parsedOverdue;
      }
    }

    // Dimensional Value 4: Engagement Score (0 - 100, optional, null if blank)
    let engagementScore: number | null = null;
    const engStr = getVal('engagement_score');
    if (engStr) {
      const parsedEng = parseFloat(engStr);
      if (isNaN(parsedEng) || parsedEng < 0 || parsedEng > 100) {
        errors.push({
          rowNumber: rowNum,
          column: 'engagement_score',
          value: engStr,
          message: 'Engagement score must be a number between 0 and 100.',
          severity: 'ERROR',
        });
        rowHasError = true;
      } else {
        engagementScore = parsedEng;
      }
    }

    if (!rowHasError) {
      const record: StudentAnalyticsRecord = {
        id: `import_${rollNumber.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        rollNumber,
        name,
        email,
        department: deptRaw,
        academicYear,
        semester,
        section,
        academic: {
          currentAverageScore: academicScore,
          historicalSemesterAverages: [],
          recentTrend: 'INSUFFICIENT_DATA',
        },
        attendance: {
          overallPercentage: attendancePercentage,
          totalSessionsConducted: attendancePercentage !== null ? 80 : null,
          sessionsAttended: attendancePercentage !== null ? Math.round((attendancePercentage / 100) * 80) : null,
        },
        assignments: {
          totalAssigned: assignmentCompletionRate !== null ? 10 : null,
          completedCount: assignmentCompletionRate !== null ? Math.round((assignmentCompletionRate / 100) * 10) : null,
          completionRate: assignmentCompletionRate,
          overdueCount,
        },
        engagement: {
          overallEngagementScore: engagementScore,
        },
        isSyntheticData: true,
        lastUpdated: new Date().toISOString(),
      };

      validRecords.push(record);
    }
  });

  const invalidRowsCount = new Set(errors.filter(e => e.severity === 'ERROR').map(e => e.rowNumber)).size;
  const warningRowsCount = new Set(errors.filter(e => e.severity === 'WARNING').map(e => e.rowNumber)).size;

  return {
    totalRows: dataRows.length,
    validRowsCount: validRecords.length,
    invalidRowsCount,
    warningRowsCount,
    headers: rawHeaders,
    previewRows,
    errors,
    validRecords,
    isProcessable: validRecords.length > 0,
  };
}

/**
 * Generate a clean, downloadable sample CSV template
 */
export function generateExampleCsvTemplate(): string {
  return [
    'roll_number,name,email,department,academic_year,semester,section,academic_score,attendance_percentage,assignment_completion_rate,overdue_assignments,engagement_score',
    '2023CSE101,"Tanvi Rao",tanvi.rao@college.demo,CSE,3,5,CSE-A,88,94.5,100,0,85',
    '2023CSE102,"Kunal Verma",kunal.v@college.demo,CSE,3,5,CSE-A,54,62.0,60,3,45',
    '2023ECE101,"Rohit Saxena",rohit.s@college.demo,ECE,3,5,ECE-A,76,82.5,90,1,72',
    '2023ECE102,"Pooja Sen",pooja.sen@college.demo,ECE,3,5,ECE-B,92,96.0,100,0,90',
    '2023EEE101,"Manoj Kumar",manoj.k@college.demo,EEE,4,7,EEE-A,61,68.0,70,2,55',
    '2023EEE102,"Divya Murthy",divya.m@college.demo,EEE,2,3,EEE-B,82,88.0,90,0,78',
    '2023CSE103,"Harish Balan",harish.b@college.demo,CSE,2,3,CSE-B,,,90,0,',
  ].join('\n');
}

/**
 * Compute aggregate department metrics from an evaluated cohort
 */
export function computeDepartmentAnalytics(records: StudentAnalyticsRecord[]): DepartmentMetricSummary[] {
  const deptMap: Record<string, StudentAnalyticsRecord[]> = {};

  records.forEach(r => {
    const dept = r.department || 'OTHER';
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(r);
  });

  return Object.keys(deptMap).sort().map(dept => {
    const list = deptMap[dept];
    const totalStudents = list.length;

    // 1. Success Score average (valid scores only)
    const validScores = list
      .map(r => r.computedScore?.finalScore)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    const averageSuccessScore = validScores.length > 0
      ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
      : null;

    // 2. Attendance average (non-null only)
    const validAtt = list
      .map(r => r.attendance.overallPercentage)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    const averageAttendance = validAtt.length > 0
      ? Math.round((validAtt.reduce((a, b) => a + b, 0) / validAtt.length) * 10) / 10
      : null;

    // 3. Academic assessment average
    const validAcad = list
      .map(r => r.academic.currentAverageScore)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    const averageAcademic = validAcad.length > 0
      ? Math.round((validAcad.reduce((a, b) => a + b, 0) / validAcad.length) * 10) / 10
      : null;

    // 4. Assignment average
    const validAsgn = list
      .map(r => r.assignments.completionRate)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    const averageAssignment = validAsgn.length > 0
      ? Math.round((validAsgn.reduce((a, b) => a + b, 0) / validAsgn.length) * 10) / 10
      : null;

    // 5. Engagement average
    const validEng = list
      .map(r => r.engagement.overallEngagementScore)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    const averageEngagement = validEng.length > 0
      ? Math.round((validEng.reduce((a, b) => a + b, 0) / validEng.length) * 10) / 10
      : null;

    // Risk distribution
    const riskDistribution = {
      LOW: list.filter(r => r.riskLevel === 'LOW').length,
      MEDIUM: list.filter(r => r.riskLevel === 'MEDIUM').length,
      HIGH: list.filter(r => r.riskLevel === 'HIGH').length,
      CRITICAL: list.filter(r => r.riskLevel === 'CRITICAL').length,
      INSUFFICIENT_DATA: list.filter(r => r.riskLevel === 'INSUFFICIENT_DATA').length,
    };

    return {
      department: dept,
      totalStudents,
      validScoreCount: validScores.length,
      averageSuccessScore,
      attendanceCount: validAtt.length,
      averageAttendance,
      academicCount: validAcad.length,
      averageAcademic,
      assignmentCount: validAsgn.length,
      averageAssignment,
      engagementCount: validEng.length,
      averageEngagement,
      riskDistribution,
    };
  });
}

/**
 * Generate CSV text for Exporting Institutional Summary Report
 */
export function exportInstitutionalSummaryCsv(summary: InstitutionalAnalyticsSummary): string {
  const lines: string[] = [];
  lines.push('# RESORA INSTITUTIONAL STUDENT SUCCESS ANALYTICS REPORT');
  lines.push(`# Data Source: ${summary.dataSourceLabel}`);
  lines.push(`# Exported: ${new Date().toISOString()}`);
  lines.push('# Note: Prototype informational benchmarks; not predictive of graduation outcomes');
  lines.push('');
  lines.push('METRIC,VALUE,DETAILS');
  lines.push(`Total Students Evaluated,${summary.totalEvaluated},All active department records`);
  lines.push(`Valid Success Scores,${summary.validScoreCount},${summary.totalEvaluated > 0 ? Math.round((summary.validScoreCount / summary.totalEvaluated) * 100) : 0}% of cohort`);
  lines.push(`Cohort Average Success Score,${summary.averageSuccessScore !== null ? summary.averageSuccessScore + '%' : 'N/A'},Excludes incomplete records`);
  lines.push(`Low Risk Count,${summary.riskCounts.LOW},Score >= 80.0`);
  lines.push(`Medium Risk Count,${summary.riskCounts.MEDIUM},Score 65.0 - 79.9`);
  lines.push(`High Risk Count,${summary.riskCounts.HIGH},Score 45.0 - 64.9`);
  lines.push(`Critical Risk Count,${summary.riskCounts.CRITICAL},Score < 45.0`);
  lines.push(`Insufficient Data Count,${summary.insufficientDataCount},< 50% record completeness`);
  lines.push('');
  lines.push('DEPARTMENT BREAKDOWN');
  lines.push('Department,Total Students,Avg Success Score,Score Sample Size,Avg Attendance,Attendance Sample Size,Low Risk,Medium Risk,High Risk,Critical Risk,Incomplete');

  summary.departmentSummaries.forEach(d => {
    lines.push([
      d.department,
      d.totalStudents,
      d.averageSuccessScore !== null ? `${d.averageSuccessScore}%` : 'N/A',
      `${d.validScoreCount}/${d.totalStudents}`,
      d.averageAttendance !== null ? `${d.averageAttendance}%` : 'N/A',
      `${d.attendanceCount}/${d.totalStudents}`,
      d.riskDistribution.LOW,
      d.riskDistribution.MEDIUM,
      d.riskDistribution.HIGH,
      d.riskDistribution.CRITICAL,
      d.riskDistribution.INSUFFICIENT_DATA,
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Generate CSV text for Exporting Validation Error Report
 */
export function exportValidationErrorsCsv(errors: CsvRowError[]): string {
  const lines: string[] = [];
  lines.push('# RESORA CSV IMPORT VALIDATION ERROR REPORT');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Total Issues Flagged: ${errors.length}`);
  lines.push('# Note: Client-side diagnostic log; zero data was written to any permanent storage');
  lines.push('');
  lines.push('Row Number,Severity,Column,Input Value,Validation Message');

  errors.forEach(err => {
    const escapedVal = `"${(err.value || '').replace(/"/g, '""')}"`;
    const escapedMsg = `"${(err.message || '').replace(/"/g, '""')}"`;
    lines.push(`${err.rowNumber},${err.severity},${err.column},${escapedVal},${escapedMsg}`);
  });

  return lines.join('\n');
}
