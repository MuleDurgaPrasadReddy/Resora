'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { SYNTHETIC_STUDENT_ANALYTICS } from '@/lib/studentAnalyticsData';
import { evaluateStudentAnalytics } from '@/lib/studentAnalyticsEngine';
import {
  StudentAnalyticsRecord,
  ScoreComponentContribution,
  StudentRecommendation,
  StudentRiskLevel,
} from '@/types/studentAnalytics';
import { getStudentSafeInterventions } from '@/lib/studentInterventionEngine';
import {
  Trophy,
  Code2,
  GraduationCap,
  Flame,
  CheckCircle2,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Clock,
  ExternalLink,
  Info,
  Calendar,
  CheckSquare,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { CircularProgress } from '@/components/common/CircularProgress';

export default function StudentProgressPage() {
  const { progress, currentUser } = useResora();

  // 1. Identify the authenticated student's corresponding record safely
  // If matched against the synthetic demonstration dataset, load their record;
  // If unlinked, allow previewing the default student demonstration profile (Aryan Reddy).
  const [previewSyntheticDemo, setPreviewSyntheticDemo] = useState(false);

  const matchedStudentRecord = useMemo(() => {
    if (!currentUser) return null;
    const userEmail = currentUser.email?.toLowerCase().trim() || '';
    const userName = currentUser.name?.toLowerCase().trim() || '';
    const userRoll = currentUser.rollNumber?.toLowerCase().trim() || '';

    // Direct match by email
    let record = SYNTHETIC_STUDENT_ANALYTICS.find(
      s => s.email.toLowerCase() === userEmail
    );
    if (record) return record;

    // Match standard demo student aliases ('student@resora.demo' -> Aryan Reddy / stu_synth_05)
    if (userEmail === 'student@resora.demo' || userName === 'aryan reddy') {
      record = SYNTHETIC_STUDENT_ANALYTICS.find(s => s.id === 'stu_synth_05');
      if (record) return record;
    }

    // Match by roll number if available
    if (userRoll) {
      record = SYNTHETIC_STUDENT_ANALYTICS.find(
        s => s.rollNumber.toLowerCase() === userRoll
      );
      if (record) return record;
    }

    // Match by name
    if (userName) {
      record = SYNTHETIC_STUDENT_ANALYTICS.find(
        s => s.name.toLowerCase() === userName
      );
      if (record) return record;
    }

    return null;
  }, [currentUser]);

  // Determine active student record for personal analytics
  const activeStudentRaw = matchedStudentRecord || (previewSyntheticDemo ? SYNTHETIC_STUDENT_ANALYTICS.find(s => s.id === 'stu_synth_05') : null);

  // 2. Evaluate the active student through the deterministic scoring engine
  const evaluatedStudent = useMemo(() => {
    if (!activeStudentRaw) return null;
    return evaluateStudentAnalytics(activeStudentRaw);
  }, [activeStudentRaw]);

  // Safe student-facing interventions (Confidential faculty notes strictly excluded)
  const safeInterventions = useMemo(() => {
    if (!activeStudentRaw) return [];
    return getStudentSafeInterventions(activeStudentRaw.id, activeStudentRaw.rollNumber);
  }, [activeStudentRaw]);

  // Primary Skills dataset (Preserved from existing Resora context)
  const skillList = [
    { name: 'DSA & Algorithms', level: progress?.dsaScore || 70, color: 'bg-brand-600' },
    { name: 'Core Programming', level: 80, color: 'bg-blue-600' },
    { name: 'Web & Systems Architecture', level: 85, color: 'bg-emerald-600' },
    { name: 'Professional Communication', level: progress?.communicationScore || 70, color: 'bg-amber-500' },
  ];

  // Achievements (Preserved)
  const achievements = [
    {
      title: 'Hackathons',
      count: '3',
      icon: Trophy,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Projects',
      count: '4',
      icon: Code2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Certifications',
      count: '6',
      icon: GraduationCap,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Learning Streak',
      count: '12 Days',
      icon: Flame,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  // Recent Activity Items (Preserved)
  const recentActivities = [
    {
      id: 1,
      title: 'Completed React Component State Lab',
      date: '2 days ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 2,
      title: 'Solved 20 DSA Practice Problems',
      date: '3 days ago',
      icon: Target,
      iconColor: 'text-brand-600 bg-brand-50',
    },
    {
      id: 3,
      title: 'Completed Web Development Track',
      date: '5 days ago',
      icon: Award,
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      id: 4,
      title: 'Registered for Smart India Hackathon',
      date: '1 week ago',
      icon: Trophy,
      iconColor: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* ==================================================
              1. PAGE HEADER
             ================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>KPMG Domain · AI-Powered Student Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                My Student Success & Progress
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Multi-dimensional success score, factor decomposition, and personalized improvement guidance.
              </p>
            </div>

            {/* Quick Navigation to Preparation Hub */}
            <div className="flex items-center space-x-2">
              <Link
                href="/student/preparation"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Preparation Hub</span>
              </Link>
            </div>
          </div>

          {/* ==================================================
              2. STUDENT IDENTITY SAFETY & UNLINKED NOTICE
             ================================================== */}
          {!matchedStudentRecord && !previewSyntheticDemo && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-3xl p-5 text-amber-900 space-y-3">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 text-xs">
                  <h3 className="text-sm font-bold text-amber-950">
                    Institutional Student Analytics Record Unlinked
                  </h3>
                  <p className="text-amber-800 leading-relaxed">
                    Your current account (<strong>{currentUser.email}</strong>) is active on Resora, but has not yet been linked to an official university student roll number in the institutional ERP database.
                  </p>
                  <p className="text-amber-700">
                    For hackathon evaluation and demonstration, you can preview the verified synthetic student record for <strong>Aryan Reddy (2023CSE012)</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => setPreviewSyntheticDemo(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                >
                  Preview Demonstration Student Profile (Aryan Reddy)
                </button>
              </div>
            </div>
          )}

          {/* Synthetic Data Disclaimer Banner */}
          {evaluatedStudent && (
            <div className="bg-purple-900/10 border border-purple-200/80 px-4 py-2.5 rounded-2xl text-xs text-purple-950 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                Demonstration Profile: Showing synthetic student data for{' '}
                <strong>{evaluatedStudent.name} ({evaluatedStudent.rollNumber})</strong>.
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-mono">
                Informational Prototype Benchmarks
              </span>
            </div>
          )}

          {/* ==================================================
              3. PERSONAL SUCCESS OVERVIEW (Engine-Calculated)
             ================================================== */}
          {evaluatedStudent && (
            <div className="space-y-6">
              {/* Hero Success Score Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Hero Circular Success Score Gauge & Narrative */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
                    {evaluatedStudent.computedScore?.finalScore !== null &&
                    evaluatedStudent.computedScore?.finalScore !== undefined ? (
                      <div className="shrink-0 self-center sm:self-auto">
                        <CircularProgress
                          value={evaluatedStudent.computedScore.finalScore}
                          size={130}
                          strokeWidth={11}
                          trackColor="#F1F5F9"
                          gradientColors={
                            (evaluatedStudent.computedScore.finalScore ?? 0) >= 80
                              ? ['#10B981', '#14B8A6']
                              : (evaluatedStudent.computedScore.finalScore ?? 0) >= 65
                              ? ['#2563EB', '#06B6D4']
                              : (evaluatedStudent.computedScore.finalScore ?? 0) >= 45
                              ? ['#F59E0B', '#F97316']
                              : ['#EF4444', '#DC2626']
                          }
                          valueColor="text-slate-900"
                          subText="Overall"
                        />
                      </div>
                    ) : (
                      <div className="w-[130px] h-[130px] rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 self-center sm:self-auto">
                        <span className="text-xl font-bold font-heading">N/A</span>
                        <span className="text-[10px] uppercase font-semibold">Incomplete</span>
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                        MY STUDENT SUCCESS SCORE
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <PersonalRiskBadge level={evaluatedStudent.riskLevel || 'INSUFFICIENT_DATA'} />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed max-w-xl">
                        {evaluatedStudent.computedScore?.explanationText}
                      </p>
                    </div>
                  </div>

                  {/* Right: Circular Profile Completeness Widget */}
                  <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 shrink-0 self-start lg:self-auto">
                    <CircularProgress
                      value={evaluatedStudent.computedScore?.dataCompletenessPercentage || 0}
                      size={72}
                      strokeWidth={6}
                      trackColor="#E2E8F0"
                      gradientColors={['#6366F1', '#A855F7']}
                      valueColor="text-slate-900"
                    />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Profile Completeness
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-heading block mt-0.5">
                        {evaluatedStudent.computedScore?.availableComponentsCount} of 4 Dimensions
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Operational factors synced
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  Note: Prototype success scores and risk classifications are informational benchmarks and do not predict graduation, degree, or placement outcomes.
                </p>
              </div>

              {/* ==================================================
                  4. FOUR PERFORMANCE DIMENSIONS
                 ================================================== */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Four Evaluated Dimensions</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Normalized to 100-point scale
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Academic Assessments */}
                  <DimensionCard
                    title="Academic Assessments"
                    nominalWeight="35%"
                    contribution={evaluatedStudent.computedScore?.academicContribution}
                    interpretation={
                      evaluatedStudent.computedScore?.academicContribution.rawScore !== null
                        ? (evaluatedStudent.computedScore?.academicContribution.rawScore ?? 0) >= 75
                          ? 'Consistent performance on subject exams & midterms.'
                          : 'Borderline assessment results; subject review advised.'
                        : 'No assessment scores recorded yet.'
                    }
                  />

                  {/* 2. Campus Attendance */}
                  <DimensionCard
                    title="Campus Attendance"
                    nominalWeight="25%"
                    contribution={evaluatedStudent.computedScore?.attendanceContribution}
                    interpretation={
                      evaluatedStudent.computedScore?.attendanceContribution.rawScore !== null
                        ? (evaluatedStudent.computedScore?.attendanceContribution.rawScore ?? 0) >= 75
                          ? 'Meets university mandatory 75% attendance cutoff.'
                          : 'Attendance below 75% cutoff; debarment risk.'
                        : 'No session attendance recorded yet.'
                    }
                  />

                  {/* 3. Assignment Completion */}
                  <DimensionCard
                    title="Assignment Completion"
                    nominalWeight="20%"
                    contribution={evaluatedStudent.computedScore?.assignmentContribution}
                    interpretation={
                      evaluatedStudent.computedScore?.assignmentContribution.rawScore !== null
                        ? (evaluatedStudent.computedScore?.assignmentContribution.rawScore ?? 0) >= 80
                          ? 'Homework and coursework submitted on schedule.'
                          : `${evaluatedStudent.assignments.overdueCount ?? 0} assignment(s) overdue; review pending work.`
                        : 'No coursework records recorded yet.'
                    }
                  />

                  {/* 4. Learning & Project Engagement */}
                  <DimensionCard
                    title="Project Engagement"
                    nominalWeight="20%"
                    contribution={evaluatedStudent.computedScore?.engagementContribution}
                    interpretation={
                      evaluatedStudent.computedScore?.engagementContribution.rawScore !== null
                        ? (evaluatedStudent.computedScore?.engagementContribution.rawScore ?? 0) >= 70
                          ? 'Steady lab reservation & project milestone activity.'
                          : 'Increase lab practice to boost engagement index.'
                        : 'No project milestones recorded yet.'
                    }
                  />
                </div>
              </div>

              {/* ==================================================
                  5. ACTIVE FACULTY MENTORING & ADVISING PLANS
                 ================================================== */}
              {safeInterventions.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-200/90 shadow-soft space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-brand-600" />
                        Active Faculty Advising & Support Plan
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Advising sessions and remedial milestones assigned by your department faculty
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 self-start sm:self-auto">
                      {safeInterventions.length} Active Plan{safeInterventions.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {safeInterventions.map((intv) => (
                      <div
                        key={intv.id}
                        className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{intv.title}</span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                intv.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : intv.status === 'IN_PROGRESS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {intv.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{intv.studentGuidance}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                            <span>Faculty Advisor: <strong className="text-slate-800">{intv.assignedMentor}</strong></span>
                            {intv.followUpDate && (
                              <span className="font-mono">Follow-up Target: <strong className="text-slate-800">{intv.followUpDate}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================
                  6. PERSONALIZED ACTION PLAN (Recommendations)
                 ================================================== */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                      Personalized Improvement Guidance
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tailored next steps generated by the analytics engine based strictly on your observed indicators.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 self-start sm:self-auto">
                    Evidence-Based Guidance
                  </span>
                </div>

                <div className="space-y-3">
                  {evaluatedStudent.recommendations && evaluatedStudent.recommendations.length > 0 ? (
                    evaluatedStudent.recommendations.map(rec => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{rec.title}</span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                rec.priority === 'URGENT'
                                  ? 'bg-rose-100 text-rose-700'
                                  : rec.priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-brand-50 text-brand-700'
                              }`}
                            >
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{rec.actionText}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Triggered by: <strong>{rec.triggeredByIndicator}</strong> (Observed: {rec.observedValue})
                          </p>
                        </div>

                        {/* Existing Feature Navigation Link */}
                        <div className="shrink-0 pt-2 sm:pt-0">
                          {rec.category === 'ACADEMIC' ? (
                            <Link
                              href="/student/preparation"
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
                            >
                              <span>Practice in Prep Hub</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : rec.category === 'ENGAGEMENT' ? (
                            <Link
                              href="/student/projects"
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-[11px] shadow-sm transition-all"
                            >
                              <span>View Capstone Projects</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : rec.category === 'ATTENDANCE' ? (
                            <Link
                              href="/student/bookings"
                              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[11px] transition-all"
                            >
                              <span>My Class Bookings</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium italic">
                              Target: {rec.suggestedTarget || 'In Progress'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No remedial recommendations needed. Your profile meets current academic benchmarks.
                    </div>
                  )}
                </div>
              </div>

              {/* ==================================================
                  6. GENUINE HISTORICAL TREND (If available)
                 ================================================== */}
              {evaluatedStudent.academic.historicalSemesterAverages &&
              evaluatedStudent.academic.historicalSemesterAverages.length >= 2 ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-heading">
                        Historical Semester Trajectory
                      </h3>
                      <p className="text-xs text-slate-500">
                        Multi-semester grade observations from your university transcript
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        evaluatedStudent.academic.recentTrend === 'IMPROVING'
                          ? 'bg-emerald-100 text-emerald-700'
                          : evaluatedStudent.academic.recentTrend === 'DECLINING'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evaluatedStudent.academic.recentTrend === 'DECLINING' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {evaluatedStudent.academic.recentTrend}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {evaluatedStudent.academic.historicalSemesterAverages.map((avg, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Semester {idx + 1}</span>
                        <span className="text-lg font-black text-slate-900 font-heading mt-0.5 block">{avg}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs text-slate-500 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Multi-semester historical trajectory is not yet available for this record (minimum 2 evaluated semesters required). No past scores fabricated.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              7. PRESERVED SKILL PROGRESS & ACHIEVEMENTS
             ================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: SKILL PROGRESS & CURRENT GOAL */}
            <div className="space-y-8">
              {/* SKILL PROGRESS */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                      Technical Skills Breakdown
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Core technical and soft skill proficiency</p>
                  </div>
                  <Link
                    href="/student/preparation"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                  >
                    <span>Preparation Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-5">
                  {skillList.map((skill, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{skill.name}</span>
                        <span className="font-extrabold text-slate-900">{skill.level}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CURRENT GOAL Circular Widget */}
              <div className="bg-gradient-to-br from-white via-slate-50/60 to-brand-50/40 p-6 rounded-3xl border border-brand-200/80 shadow-soft space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider bg-brand-100 px-3 py-1 rounded-full border border-brand-200/80">
                    CURRENT GOAL
                  </span>
                  <span className="text-xs font-extrabold text-brand-600 font-mono">184 / 250 Solved</span>
                </div>

                <div className="flex items-center gap-5 pt-1">
                  <div className="shrink-0">
                    <CircularProgress
                      value={74}
                      size={88}
                      strokeWidth={8}
                      trackColor="#E2E8F0"
                      gradientColors={['#2563EB', '#06B6D4']}
                      valueColor="text-slate-900"
                      subText="Completed"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      Complete 250 DSA Problems
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Placement coding readiness goal. 66 questions remaining to unlock the Advanced Problem Set badge.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/student/preparation"
                    className="w-full py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Continue in Prep Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACHIEVEMENTS & RECENT ACTIVITY */}
            <div className="space-y-8">
              {/* ACHIEVEMENTS */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                    Achievements
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Highlights of your campus contributions and milestones</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((ach, idx) => {
                    const Icon = ach.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className={`w-9 h-9 rounded-xl border ${ach.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-900 font-heading leading-none">
                            {ach.count}
                          </div>
                          <span className="text-xs font-bold text-slate-600 mt-1 block">
                            {ach.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-soft space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your latest learning updates and platform activity</p>
                </div>

                <div className="space-y-4">
                  {recentActivities.map(act => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl ${act.iconColor} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {act.title}
                          </span>
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 shrink-0">
                          {act.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Subcomponents
// ---------------------------------------------------------------------------

function PersonalRiskBadge({ level }: { level: StudentRiskLevel }) {
  switch (level) {
    case 'LOW':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Low Risk · On Track</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Moderate Risk · Review Advisories</span>
        </span>
      );
    case 'HIGH':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          <span>High Risk · Academic Action Recommended</span>
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Critical Risk · Mentor Meeting Required</span>
        </span>
      );
    case 'INSUFFICIENT_DATA':
    default:
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Incomplete Profile</span>
        </span>
      );
  }
}

function DimensionCard({
  title,
  nominalWeight,
  contribution,
  interpretation,
}: {
  title: string;
  nominalWeight: string;
  contribution?: ScoreComponentContribution;
  interpretation: string;
}) {
  const isAvailable = contribution?.isAvailable && contribution.rawScore !== null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft space-y-3 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">{title}</span>
          <span className="text-[10px] font-semibold text-slate-400">Weight: {nominalWeight}</span>
        </div>

        {isAvailable ? (
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-slate-900 font-heading">
              {contribution!.rawScore}%
            </span>
            <span className="text-[11px] font-bold text-brand-600 font-mono">
              +{contribution!.weightedPoints} pts
            </span>
          </div>
        ) : (
          <div className="py-2 text-slate-400 text-xs italic">
            Not available
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        {isAvailable ? (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (contribution!.rawScore ?? 0) >= 75
                  ? 'bg-emerald-500'
                  : (contribution!.rawScore ?? 0) >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, contribution!.rawScore ?? 0)}%` }}
            />
          </div>
        ) : null}

        <p className="text-[11px] text-slate-500 leading-relaxed">
          {interpretation}
        </p>

        {isAvailable && (contribution!.effectiveWeight * 100 !== parseFloat(nominalWeight)) ? (
          <p className="text-[10px] text-brand-600 font-mono">
            Reweighted Effective Weight: {(contribution!.effectiveWeight * 100).toFixed(1)}%
          </p>
        ) : null}
      </div>
    </div>
  );
}
