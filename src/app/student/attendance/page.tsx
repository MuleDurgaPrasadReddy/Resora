'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import {
  getStudentAttendanceSummary,
  calculateBunkStats,
  EnhancedCourseAttendance,
  AttendanceSessionLog,
} from '@/lib/attendanceService';
import {
  CalendarCheck,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  Calculator,
  Calendar,
  Filter,
  Download,
  Info,
  ChevronRight,
  ArrowRight,
  History,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Sliders,
} from 'lucide-react';
import { CircularProgress } from '@/components/common/CircularProgress';

export default function StudentAttendancePage() {
  const { currentUser } = useResora();

  // Load enriched attendance summary
  const summary = useMemo(() => {
    return getStudentAttendanceSummary(currentUser);
  }, [currentUser]);

  // View state: 'SUBJECTS' | 'SIMULATOR' | 'LOGS'
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'SIMULATOR' | 'LOGS'>('SUBJECTS');

  // Filters for session logs
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Simulator State
  const [simTargetCourseCode, setSimTargetCourseCode] = useState<string>('OVERALL');
  const [simAttendNext, setSimAttendNext] = useState<number>(5);
  const [simMissNext, setSimMissNext] = useState<number>(0);
  const [targetThreshold, setTargetThreshold] = useState<number>(75);

  // Filtered session logs
  const filteredLogs = useMemo(() => {
    return summary.recentLogs.filter(log => {
      if (selectedCourseFilter !== 'ALL' && log.courseCode !== selectedCourseFilter) return false;
      if (selectedStatusFilter !== 'ALL' && log.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [summary.recentLogs, selectedCourseFilter, selectedStatusFilter]);

  // Selected course for simulator
  const simCourse = useMemo(() => {
    if (simTargetCourseCode === 'OVERALL') return null;
    return summary.courses.find(c => c.courseCode === simTargetCourseCode);
  }, [summary.courses, simTargetCourseCode]);

  // Simulation calculations
  const simResults = useMemo(() => {
    const baseAttended = simCourse ? simCourse.attended : summary.totalAttended;
    const baseTotal = simCourse ? simCourse.total : summary.totalConducted;

    const projectedAttended = baseAttended + simAttendNext;
    const projectedTotal = baseTotal + simAttendNext + simMissNext;
    const projectedPercentage = projectedTotal > 0 ? Number(((projectedAttended / projectedTotal) * 100).toFixed(1)) : 0;
    const currentPercentage = baseTotal > 0 ? Number(((baseAttended / baseTotal) * 100).toFixed(1)) : 0;
    const delta = Number((projectedPercentage - currentPercentage).toFixed(1));

    const bunkAnalysis = calculateBunkStats(projectedAttended, projectedTotal, targetThreshold);

    return {
      projectedAttended,
      projectedTotal,
      projectedPercentage,
      currentPercentage,
      delta,
      safeBunks: bunkAnalysis.safeBunks,
      classesNeeded: bunkAnalysis.classesNeeded,
      isAboveTarget: projectedPercentage >= targetThreshold,
    };
  }, [simCourse, summary, simAttendNext, simMissNext, targetThreshold]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card border border-slate-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider bg-brand-900/60 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                    Academic Year 2025-2026 · Semester {summary.semester}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Roll: {summary.rollNumber}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading mt-2">
                  Attendance & Academic Regularity 📋
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Real-time ERP attendance tracking, subject-wise breakdown, and mandatory 75% exam eligibility safety forecast for {summary.studentName}.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('SIMULATOR')}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Bunk & Goal Planner</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Statement</span>
                </button>
              </div>
            </div>
          </div>

          {/* Overview Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall Attendance Circular Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall Attendance
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${summary.statusBg} ${summary.statusColor}`}>
                  {summary.statusLabel}
                </span>
              </div>

              <div className="my-2 flex items-center justify-between gap-3">
                <CircularProgress
                  value={summary.overallPercentage}
                  size={84}
                  strokeWidth={8}
                  trackColor="#F1F5F9"
                  gradientColors={
                    summary.overallPercentage >= 85
                      ? ['#10B981', '#14B8A6']
                      : summary.overallPercentage >= 75
                      ? ['#3B82F6', '#06B6D4']
                      : ['#F59E0B', '#F97316']
                  }
                  valueColor="text-slate-900"
                />

                <div className="space-y-1 text-right flex-1">
                  <span className="text-xs font-medium text-slate-500 block">
                    Conducted: <strong className="text-slate-800">{summary.totalConducted}</strong>
                  </span>
                  <span className="text-xs font-medium text-slate-500 block">
                    Attended: <strong className="text-emerald-600 font-bold">{summary.totalAttended}</strong>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Missed: <strong className="text-rose-500">{summary.totalConducted - summary.totalAttended}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Exam Safety:</span>
                <span className="text-emerald-600 font-bold">
                  {summary.safeBunksOverall > 0 ? `+${summary.safeBunksOverall} Bunks Safe` : 'Action Required (<75%)'}
                </span>
              </div>
            </div>

            {/* 2. Bunk Safety Cushion */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Safety Bunk Margin
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                  {summary.safeBunksOverall > 0 ? `${summary.safeBunksOverall} Classes Safe` : 'Action Required'}
                </span>
              </div>
              <div className="mt-3">
                {summary.safeBunksOverall > 0 ? (
                  <>
                    <p className="text-2xl font-extrabold text-emerald-600 font-heading">
                      +{summary.safeBunksOverall} Classes
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      You can miss up to <strong>{summary.safeBunksOverall}</strong> more lectures and still maintain ≥ 75.0% eligibility.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold text-amber-600 font-heading">
                      Must Attend {summary.classesNeededOverall} Classes
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      You need <strong>{summary.classesNeededOverall}</strong> consecutive attendances to return above 75.0%.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 3. Subject Health */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Course Compliance
                </span>
                <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-[10px] font-bold border border-brand-200">
                  {summary.courses.length} Registered
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {summary.subjectCountAbove75} <span className="text-sm font-normal text-slate-400">/ {summary.courses.length}</span>
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  Above 75%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {summary.subjectCountBelow75 > 0 ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {summary.subjectCountBelow75} course(s) require attendance counseling
                  </span>
                ) : (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All registered courses in good standing
                  </span>
                )}
              </p>
            </div>

            {/* 4. Total Absences Recorded */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Absences Recorded
                </span>
                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                  Semester 5
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {summary.totalAbsences}
                </span>
                <span className="text-xs text-slate-500">Classes missed</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                <span>Unexcused: <strong>{summary.unexcusedAbsences}</strong></span>
                <span>Consecutive: <strong>{summary.consecutiveAbsences}</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex border-b border-slate-200 space-x-6">
            <button
              onClick={() => setActiveTab('SUBJECTS')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'SUBJECTS'
                  ? 'text-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject-Wise Attendance Breakdown</span>
              {activeTab === 'SUBJECTS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'SIMULATOR'
                  ? 'text-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Bunk & Target Simulator</span>
              <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">
                Interactive
              </span>
              {activeTab === 'SIMULATOR' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'LOGS'
                  ? 'text-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Verified Session Logs</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {summary.recentLogs.length}
              </span>
              {activeTab === 'LOGS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: SUBJECT-WISE ATTENDANCE */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-6">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {summary.courses.map(course => {
                  const isSafe = course.percentage >= 75;
                  const isExcellent = course.percentage >= 85;

                  return (
                    <div
                      key={course.courseCode}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Course Code & Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {course.courseCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isExcellent
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isSafe
                                ? 'bg-brand-50 text-brand-700 border-brand-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {course.percentage}%
                          </span>
                        </div>

                        {/* Course Name */}
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {course.courseName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {course.instructor} · {course.credits} Credits
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-500 font-medium">
                              Attended {course.attended} of {course.total} classes
                            </span>
                            <span className="font-bold text-slate-700">
                              {course.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isExcellent
                                  ? 'bg-emerald-500'
                                  : isSafe
                                  ? 'bg-brand-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(course.percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{course.schedule}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Location: {course.room}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action / Margin Pill */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        {course.safeBunks > 0 ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Safe to miss <strong>{course.safeBunks}</strong> class(es)
                          </span>
                        ) : course.classesNeeded > 0 ? (
                          <span className="text-amber-700 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Attend next <strong>{course.classesNeeded}</strong> to reach 75%
                          </span>
                        ) : (
                          <span className="text-brand-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                            On threshold (75%)
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSimTargetCourseCode(course.courseCode);
                            setActiveTab('SIMULATOR');
                          }}
                          className="text-brand-600 hover:text-brand-700 font-semibold text-[11px] flex items-center gap-0.5 hover:underline"
                        >
                          <span>Simulate</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comprehensive Subject Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Detailed Course Attendance Register
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accredited classroom hours recorded through institutional RFID/Smart QR terminals
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Updated: Today, 09:30 AM
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Instructor</th>
                        <th className="py-3 px-4 text-center">Conducted</th>
                        <th className="py-3 px-4 text-center">Attended</th>
                        <th className="py-3 px-4 text-center">Absent</th>
                        <th className="py-3 px-4 text-center">Percentage</th>
                        <th className="py-3 px-4">Eligibility Status</th>
                        <th className="py-3 px-4">Safety Guidance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {summary.courses.map(c => {
                        const isSafe = c.percentage >= 75;
                        const absences = c.total - c.attended;

                        return (
                          <tr key={c.courseCode} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-bold text-slate-900">{c.courseCode}</span>
                              <p className="text-[11px] text-slate-500">{c.courseName}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {c.instructor}
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-slate-900">
                              {c.total}
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                              {c.attended}
                            </td>
                            <td className="py-3.5 px-4 text-center font-semibold text-rose-500">
                              {absences}
                            </td>
                            <td className="py-3.5 px-4 text-center font-extrabold text-sm">
                              <span
                                className={
                                  c.percentage >= 85
                                    ? 'text-emerald-600'
                                    : isSafe
                                    ? 'text-brand-600'
                                    : 'text-amber-600'
                                }
                              >
                                {c.percentage}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  c.percentage >= 85
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isSafe
                                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {c.statusLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[11px]">
                              {c.safeBunks > 0 ? (
                                <span className="text-emerald-700 font-semibold">
                                  Can miss {c.safeBunks} class(es)
                                </span>
                              ) : c.classesNeeded > 0 ? (
                                <span className="text-amber-700 font-semibold">
                                  Must attend next {c.classesNeeded} classes
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  Strictly attend regular sessions
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE BUNK & TARGET SIMULATOR */}
          {activeTab === 'SIMULATOR' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simulator Controls */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-600" />
                    <span>Attendance Goal Planner</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulate future attendances or absences to project your compliance percentage before upcoming exams.
                  </p>
                </div>

                {/* Target Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Select Target Subject
                  </label>
                  <select
                    value={simTargetCourseCode}
                    onChange={e => setSimTargetCourseCode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="OVERALL">Overall Attendance (All Subjects Combined)</option>
                    {summary.courses.map(c => (
                      <option key={c.courseCode} value={c.courseCode}>
                        {c.courseCode} - {c.courseName} (Currently {c.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Threshold */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">
                      Target Eligibility Threshold
                    </label>
                    <span className="font-extrabold text-brand-600">
                      {targetThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="65"
                    max="90"
                    step="5"
                    value={targetThreshold}
                    onChange={e => setTargetThreshold(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>65% (Min condonation)</span>
                    <span>75% (Standard)</span>
                    <span>85% (Distinction)</span>
                  </div>
                </div>

                {/* Simulator Inputs: Attend Next */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Classes you will ATTEND next:
                    </label>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      +{simAttendNext} Classes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={simAttendNext}
                    onChange={e => setSimAttendNext(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Simulator Inputs: Miss Next */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Classes you plan to MISS (Bunk):
                    </label>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {simMissNext} Classes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={simMissNext}
                    onChange={e => setSimMissNext(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => {
                      setSimAttendNext(0);
                      setSimMissNext(0);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Reset Changes
                  </button>
                  <button
                    onClick={() => {
                      setSimAttendNext(10);
                      setSimMissNext(0);
                    }}
                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Set Perfect Attendance
                  </button>
                </div>
              </div>

              {/* Simulator Output Visualization */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Forecast for: {simTargetCourseCode === 'OVERALL' ? 'Overall Attendance' : simTargetCourseCode}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        Projected Attendance Outcome
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        simResults.isAboveTarget
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {simResults.isAboveTarget ? 'Eligible for Exams' : 'Debarment Risk Warning'}
                    </span>
                  </div>

                  {/* Before vs After Comparison */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <p className="text-xs font-bold text-slate-500">Current Percentage</p>
                      <p className="text-3xl font-extrabold text-slate-700 font-heading mt-1">
                        {simResults.currentPercentage}%
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Active recorded ERP status
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-xl border text-center transition-all ${
                        simResults.isAboveTarget
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-600">Simulated Future Outcome</p>
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <span className="text-3xl font-extrabold font-heading">
                          {simResults.projectedPercentage}%
                        </span>
                        {simResults.delta !== 0 && (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              simResults.delta > 0
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-rose-200 text-rose-800'
                            }`}
                          >
                            {simResults.delta > 0 ? `+${simResults.delta}%` : `${simResults.delta}%`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {simResults.projectedAttended} of {simResults.projectedTotal} sessions
                      </p>
                    </div>
                  </div>

                  {/* Guidance Box */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>Actionable Recommendation:</span>
                    </h4>
                    {simResults.isAboveTarget ? (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        ✅ Under this simulated scenario, you will remain safely above your <strong>{targetThreshold}%</strong> goal.
                        {simResults.safeBunks > 0 && (
                          <span> You would still have a cushion to safely miss up to <strong>{simResults.safeBunks}</strong> additional classes before dropping below {targetThreshold}%.</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-rose-700 leading-relaxed font-medium">
                        ⚠️ Under this scenario, your attendance would fall to <strong>{simResults.projectedPercentage}%</strong>, below the required threshold of <strong>{targetThreshold}%</strong>.
                        To recover eligibility, you would need to attend at least <strong>{simResults.classesNeeded}</strong> consecutive classes without any absence.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Simulation does not modify your official ERP attendance record.</span>
                  <Link
                    href="/student/dashboard"
                    className="text-brand-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Back to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED SESSION LOGS */}
          {activeTab === 'LOGS' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Daily Biometric & Term Attendance Stream
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual class-by-class roll log timestamped through classroom IoT terminals
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3 text-xs">
                  <select
                    value={selectedCourseFilter}
                    onChange={e => setSelectedCourseFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Subjects</option>
                    {summary.courses.map(c => (
                      <option key={c.courseCode} value={c.courseCode}>
                        {c.courseCode}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={e => setSelectedStatusFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="EXCUSED">Excused / Approved Leave</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Classroom</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Verification Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLogs.map(log => {
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium">
                            <span className="font-bold text-slate-900">{log.formattedDate}</span>
                            <p className="text-[11px] text-slate-400 font-mono">{log.time}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800">{log.courseCode}</span>
                            <p className="text-[11px] text-slate-500">{log.courseName}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {log.instructor}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {log.room}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.status === 'ABSENT'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : log.status === 'LATE'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {log.remarks || 'Standard biometric confirmation'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
