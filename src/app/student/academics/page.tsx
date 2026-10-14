'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import {
  getStudentAcademicSummary,
  calculateRequiredSGPA,
  SubjectScoreItem,
  SemesterRecord,
  AssessmentDetailItem,
} from '@/lib/academicService';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Briefcase,
  Calculator,
  Calendar,
  Download,
  Info,
  ChevronRight,
  ArrowRight,
  Sliders,
  Sparkles,
  BarChart3,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';

export default function StudentAcademicsPage() {
  const { currentUser } = useResora();

  // Load student academic performance summary
  const summary = useMemo(() => {
    return getStudentAcademicSummary(currentUser);
  }, [currentUser]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'TRENDS' | 'ASSESSMENTS' | 'ELIGIBILITY'>('SUBJECTS');

  // Interactive Target CGPA Calculator state
  const [targetCGPA, setTargetCGPA] = useState<number>(8.0);
  const remainingCredits = 50; // Remaining credits for semesters 6, 7, 8
  const completedCredits = summary.totalCreditsEarned;

  const targetProjection = useMemo(() => {
    return calculateRequiredSGPA(summary.cgpa, completedCredits, targetCGPA, remainingCredits);
  }, [summary.cgpa, completedCredits, targetCGPA, remainingCredits]);

  // Chart Data: Semester SGPA & CGPA Trend
  const sgpaChartData = useMemo(() => {
    return summary.semesterHistory.map(s => ({
      name: `Sem ${s.semester}`,
      fullTerm: s.termLabel,
      SGPA: s.sgpa,
      CGPA: s.cgpa,
    }));
  }, [summary.semesterHistory]);

  // Chart Data: Subject vs Class Average
  const subjectBenchmarkData = useMemo(() => {
    return summary.subjects.map(sub => ({
      subject: sub.courseCode,
      name: sub.courseName,
      StudentScore: sub.totalMarks,
      ClassAverage: sub.classAverage,
    }));
  }, [summary.subjects]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card border border-slate-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    B.Tech {summary.department} · Semester {summary.currentSemester}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Roll: {summary.rollNumber}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading mt-2">
                  Academic Performance & CGPA Audit 🎓
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Accredited transcript data, semester SGPA trajectory, continuous internal evaluations (CIE), and backlog clearance records for {summary.studentName}.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('ELIGIBILITY')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Target CGPA Calculator</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs flex items-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Official Transcript</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top 4 Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. CGPA Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cumulative GPA
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${summary.standingBg} ${summary.standingColor}`}>
                  Scale 10.0
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {summary.cgpa.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{summary.cgpaDelta} vs Sem 4
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Academic Standing:</span>
                <span className="font-bold text-slate-800">{summary.academicStanding}</span>
              </div>
            </div>

            {/* 2. Total Marks & Percentage */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Semester Marks
                </span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200">
                  {summary.currentSemesterPercentage}% Aggregate
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {summary.totalMarksScored}
                </span>
                <span className="text-xs text-slate-500">
                  / {summary.totalMaxMarks} Max Marks
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Cohort Benchmark:</span>
                <span className="font-bold text-emerald-600">Top 15% in CSE</span>
              </div>
            </div>

            {/* 3. Backlogs & Clearance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Backlog Status
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    summary.activeBacklogs === 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {summary.activeBacklogs === 0 ? 'Clean Record' : `${summary.activeBacklogs} Backlog`}
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span
                  className={`text-3xl font-extrabold font-heading ${
                    summary.activeBacklogs === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {summary.activeBacklogs}
                </span>
                <span className="text-xs text-slate-500">Active Arrears</span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Placement Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  100% Eligible
                </span>
              </div>
            </div>

            {/* 4. Credits Earned */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Credits Progress
                </span>
                <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                  {summary.totalCreditsEarned} / {summary.totalCreditsRequired}
                </span>
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {Math.round((summary.totalCreditsEarned / summary.totalCreditsRequired) * 100)}%
                </span>
                <span className="text-xs text-slate-500">Curriculum Complete</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((summary.totalCreditsEarned / summary.totalCreditsRequired) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-[10px] text-slate-400 text-right">
                18 Credits Enrolled this Semester
              </div>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <div className="flex border-b border-slate-200 space-x-6">
            <button
              onClick={() => setActiveTab('SUBJECTS')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'SUBJECTS' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject Performance & Grades</span>
              {activeTab === 'SUBJECTS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('TRENDS')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'TRENDS' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>SGPA Trajectory & Charts</span>
              {activeTab === 'TRENDS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ASSESSMENTS')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'ASSESSMENTS' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Midterm & Internal Marks Log</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {summary.assessments.length}
              </span>
              {activeTab === 'ASSESSMENTS' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ELIGIBILITY')}
              className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all relative ${
                activeTab === 'ELIGIBILITY' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Backlogs & Placement Gate</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                100% Eligible
              </span>
              {activeTab === 'ELIGIBILITY' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: SUBJECT PERFORMANCE & GRADES */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-6">
              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {summary.subjects.map(sub => {
                  return (
                    <div
                      key={sub.courseCode}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Code & Grade Letter */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {sub.courseCode} · {sub.credits} Credits
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span>Grade {sub.gradeLetter}</span>
                            <span className="text-[10px] text-indigo-400">({sub.gradePoint} pts)</span>
                          </span>
                        </div>

                        {/* Title & Instructor */}
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {sub.courseName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sub.instructor} · {sub.category}
                        </p>

                        {/* Marks Progress */}
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-baseline text-xs mb-1">
                            <span className="font-semibold text-slate-700">Total Marks</span>
                            <span className="font-extrabold text-indigo-600 text-sm">
                              {sub.totalMarks} / {sub.maxMarks}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${sub.percentage}%` }}
                            />
                          </div>

                          {/* Components row */}
                          <div className="mt-2.5 grid grid-cols-3 gap-1 text-[10px] text-slate-500 text-center border-t border-slate-200 pt-2">
                            <div>
                              <span className="block text-slate-400">Midterm</span>
                              <strong className="text-slate-800">{sub.midtermMarks}/50</strong>
                            </div>
                            <div>
                              <span className="block text-slate-400">Internals</span>
                              <strong className="text-slate-800">{sub.internalMarks}/30</strong>
                            </div>
                            <div>
                              <span className="block text-slate-400">Practicals</span>
                              <strong className="text-slate-800">{sub.labMarks ? `${sub.labMarks}/20` : 'N/A'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Class Average benchmark */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Class Average: <strong>{sub.classAverage}</strong></span>
                          <span className="text-emerald-600 font-semibold">
                            +{Number((sub.totalMarks - sub.classAverage).toFixed(1))} above avg
                          </span>
                        </div>
                      </div>

                      {/* Faculty Remarks */}
                      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 italic">
                        &ldquo;{sub.remarks}&rdquo;
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Master Course Marks Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Semester 5 Consolidated Grade Register
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified marksheet aligned with Autonomous Academic Credit System regulations
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Evaluation Scale: 10.0 Absolute
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4 text-center">Credits</th>
                        <th className="py-3 px-4 text-center">Midterm (50)</th>
                        <th className="py-3 px-4 text-center">CIE (30)</th>
                        <th className="py-3 px-4 text-center">Lab (20)</th>
                        <th className="py-3 px-4 text-center">Total (100)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 text-center">Grade Point</th>
                        <th className="py-3 px-4 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {summary.subjects.map(s => {
                        return (
                          <tr key={s.courseCode} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-medium">
                              <span className="font-bold text-slate-900">{s.courseCode}</span>
                              <p className="text-[11px] text-slate-500">{s.courseName}</p>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {s.credits}
                            </td>
                            <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                              {s.midtermMarks}
                            </td>
                            <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                              {s.internalMarks}
                            </td>
                            <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                              {s.labMarks ?? '—'}
                            </td>
                            <td className="py-3.5 px-4 text-center font-extrabold text-sm text-indigo-600">
                              {s.totalMarks}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block px-2 py-0.5 rounded font-extrabold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {s.gradeLetter}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                              {s.gradePoint}.0
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Pass
                              </span>
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

          {/* TAB 2: SGPA TRAJECTORY & CHARTS */}
          {activeTab === 'TRENDS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. SGPA vs CGPA Trajectory Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Semester-by-Semester SGPA & CGPA Trend
                      </h3>
                      <p className="text-xs text-slate-500">
                        Visualizing progression from Semester 1 through current Semester 5
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Upward Trajectory
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sgpaChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[6.5, 9.0]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                            border: 'none',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Line
                          type="monotone"
                          dataKey="SGPA"
                          stroke="#6366F1"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#6366F1' }}
                          activeDot={{ r: 7 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="CGPA"
                          stroke="#10B981"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={{ r: 4, fill: '#10B981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Subject Performance vs Class Average */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Subject Score vs Class Average
                      </h3>
                      <p className="text-xs text-slate-500">
                        Comparing your marks against cohort peer benchmarks
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      All Above Avg
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectBenchmarkData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                            border: 'none',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="StudentScore" name="Your Score" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ClassAverage" name="Class Average" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Semester Historical Summary Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Semester-Wise Performance Ledger
                  </h3>
                  <span className="text-xs text-slate-400">Total Credits Earned: {summary.totalCreditsEarned}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4">Term</th>
                        <th className="py-3 px-4 text-center">Courses</th>
                        <th className="py-3 px-4 text-center">Credits Attempted</th>
                        <th className="py-3 px-4 text-center">Credits Earned</th>
                        <th className="py-3 px-4 text-center">SGPA</th>
                        <th className="py-3 px-4 text-center">Cumulative CGPA</th>
                        <th className="py-3 px-4 text-center">Arrears / Backlogs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {summary.semesterHistory.map(s => (
                        <tr key={s.semester} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            Semester {s.semester}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.academicYear}</td>
                          <td className="py-3 px-4 text-center font-medium">{s.subjectsCount}</td>
                          <td className="py-3 px-4 text-center font-medium">{s.creditsAttempted}</td>
                          <td className="py-3 px-4 text-center font-semibold text-emerald-600">{s.creditsEarned}</td>
                          <td className="py-3 px-4 text-center font-extrabold text-indigo-600">{s.sgpa.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-extrabold text-slate-900">{s.cgpa.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              0 (Clear)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MIDTERM & INTERNAL MARKS LOG */}
          {activeTab === 'ASSESSMENTS' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Continuous Internal Evaluation (CIE) Assessment Registry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Individual test scores, midterm examinations, and laboratory assessment sheets
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Semester 5 Evaluated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Assessment Name</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center">Score Scored</th>
                      <th className="py-3 px-4 text-center">Max Score</th>
                      <th className="py-3 px-4 text-center">Percentage</th>
                      <th className="py-3 px-4">Weightage in SEE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {summary.assessments.map(asmt => (
                      <tr key={asmt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">{asmt.date}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{asmt.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{asmt.courseCode}</span>
                          <span className="text-slate-400 block text-[11px]">{asmt.courseName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm text-indigo-600">
                          {asmt.score}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                          {asmt.maxScore}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              asmt.normalizedPercentage >= 80
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-brand-50 text-brand-700 border border-brand-200'
                            }`}
                          >
                            {asmt.normalizedPercentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {asmt.weightage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: BACKLOGS & PLACEMENT GATE + TARGET CALCULATOR */}
          {activeTab === 'ELIGIBILITY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Backlogs Audit & Placement Drive Gate */}
              <div className="lg:col-span-2 space-y-6">
                {/* Backlog Clearance Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Official Backlog Audit</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        University examination controller verification certificate
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Zero Active Backlogs
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-emerald-950 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Clean Academic Transcript Verified</p>
                      <p className="text-emerald-800 leading-relaxed">
                        {summary.studentName} has successfully cleared all credit requirements across Semesters 1, 2, 3, and 4 without any active backlogs or standing arrears.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placement Drive Gate Requirements */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft">
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>Campus Placement Drive Eligibility Status</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Automatic verification against institutional Career Development Center (CDC) hiring thresholds
                  </p>

                  <div className="space-y-3">
                    {/* Tier 1 Product */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">
                          Tier-1 Product Companies (₹15+ LPA)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {summary.placementEligibility.tier1Product.criteria}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Eligible (CGPA {summary.cgpa.toFixed(2)} ≥ 7.50)
                      </span>
                    </div>

                    {/* Tier 2 Core */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">
                          Tier-2 Core Engineering & Tech (₹8–15 LPA)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {summary.placementEligibility.tier2Core.criteria}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Eligible (CGPA {summary.cgpa.toFixed(2)} ≥ 6.50)
                      </span>
                    </div>

                    {/* Higher Studies */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">
                          Higher Studies & Global University Recommendation
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {summary.placementEligibility.higherStudies.criteria}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Eligible
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Target CGPA Planner */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <span>Graduation Target CGPA Calculator</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculate the exact SGPA you need across remaining semesters to graduate with your desired honors grade.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline text-xs mb-1">
                        <label className="font-bold text-slate-700">Select Target CGPA Goal:</label>
                        <span className="text-base font-extrabold text-indigo-600">
                          {targetCGPA.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="7.0"
                        max="9.0"
                        step="0.05"
                        value={targetCGPA}
                        onChange={e => setTargetCGPA(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>7.00 (First Class)</span>
                        <span>8.00 (Honors)</span>
                        <span>9.00 (Distinction)</span>
                      </div>
                    </div>

                    {/* Result projection card */}
                    <div
                      className={`p-4 rounded-xl border ${
                        targetProjection.achievable
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block">
                        Required SGPA in Remaining Semesters:
                      </span>
                      <p className="text-3xl font-extrabold font-heading mt-1">
                        {targetProjection.requiredSGPA.toFixed(2)}
                      </p>
                      <p className="text-xs mt-2 leading-relaxed">
                        {targetProjection.message}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Current CGPA:</span>
                        <strong>{summary.cgpa.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Credits:</span>
                        <strong>{completedCredits} Credits</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Semesters:</span>
                        <strong>Semesters 6, 7 & 8 ({remainingCredits} Credits)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/student/dashboard"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Return to Student Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
