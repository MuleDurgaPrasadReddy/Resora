'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { MultiStepBookingModal } from '@/components/booking/MultiStepBookingModal';
import { SYNTHETIC_STUDENT_ANALYTICS } from '@/lib/studentAnalyticsData';
import {
  evaluateCohortAnalytics,
  evaluateStudentAnalytics,
} from '@/lib/studentAnalyticsEngine';
import {
  StudentAnalyticsRecord,
  StudentRiskLevel,
  RiskFlag,
  StudentRecommendation,
} from '@/types/studentAnalytics';
import {
  StudentIntervention,
  InterventionType,
  InterventionPriority,
  InterventionStatus,
  EarlyWarningAlert,
  INTERVENTION_TYPE_DETAILS,
  generateEarlyWarningAlerts,
  interventionStore,
  calculateInterventionSummary,
} from '@/lib/studentInterventionEngine';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Eye,
  X,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Layers,
  ChevronRight,
  Info,
  RotateCcw,
  Plus,
  Check,
  Bell,
  History,
  Send,
  FileEdit,
  UserCheck,
} from 'lucide-react';

export default function FacultyStudentMentoringPage() {
  const { currentUser } = useResora();

  // Active view tab: Roster & Analytics vs Early-Warning Alerts & Interventions
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'EARLY_WARNING'>('ROSTER');

  // Interventions state synced with in-memory session store
  const [interventions, setInterventions] = useState<StudentIntervention[]>(() => interventionStore.getAll());

  // 1. Evaluate synthetic cohort through the deterministic scoring engine
  const evaluatedStudents = useMemo(() => {
    return evaluateCohortAnalytics(SYNTHETIC_STUDENT_ANALYTICS);
  }, []);

  // 2. Derive Evidence-Based Early-Warning Alerts
  const earlyWarningAlerts = useMemo(() => {
    return generateEarlyWarningAlerts(evaluatedStudents, interventions);
  }, [evaluatedStudents, interventions]);

  // 3. Compact Intervention Summary Counts
  const interventionSummary = useMemo(() => {
    return calculateInterventionSummary(interventions);
  }, [interventions]);

  // Filter & Sort State for Student Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'SCORE_ASC' | 'ATTENDANCE_DESC' | 'NAME_ASC'>('SCORE_DESC');

  // Filter for Early-Warning Alert Queue
  const [alertCategoryFilter, setAlertCategoryFilter] = useState<string>('ALL');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('ALL');

  // Modals & Detail Drawer State
  const [selectedStudent, setSelectedStudent] = useState<StudentAnalyticsRecord | null>(null);
  const [drawerActiveSection, setDrawerActiveSection] = useState<'OVERVIEW' | 'INTERVENTIONS'>('OVERVIEW');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [actionFeedbackMessage, setActionFeedbackMessage] = useState<string | null>(null);

  // New Intervention Form State in Drawer
  const [newInterventionType, setNewInterventionType] = useState<InterventionType>('ATTENDANCE_COUNSELING');
  const [newInterventionPriority, setNewInterventionPriority] = useState<InterventionPriority>('HIGH');
  const [newInterventionIndicator, setNewInterventionIndicator] = useState<string>('');
  const [newInterventionNotes, setNewInterventionNotes] = useState<string>('');
  const [newInterventionMentor, setNewInterventionMentor] = useState<string>(currentUser?.name || 'Prof. Sharma (CSE)');
  const [newInterventionFollowUp, setNewInterventionFollowUp] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeTargetIntvId, setOutcomeTargetIntvId] = useState<string | null>(null);
  const [outcomeNotesInput, setOutcomeNotesInput] = useState<string>('');

  // 4. Cohort Summary Metrics (Computed dynamically from evaluated dataset)
  const cohortMetrics = useMemo(() => {
    const total = evaluatedStudents.length;
    const low = evaluatedStudents.filter(s => s.riskLevel === 'LOW').length;
    const medium = evaluatedStudents.filter(s => s.riskLevel === 'MEDIUM').length;
    const high = evaluatedStudents.filter(s => s.riskLevel === 'HIGH').length;
    const critical = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL').length;
    const insufficient = evaluatedStudents.filter(s => s.riskLevel === 'INSUFFICIENT_DATA').length;

    return {
      total,
      low,
      medium,
      high,
      critical,
      highOrCritical: high + critical,
      insufficient,
    };
  }, [evaluatedStudents]);

  // 5. Chart Data for Risk Distribution (Recharts)
  const riskChartData = useMemo(() => {
    return [
      { name: 'Low Risk', level: 'LOW', count: cohortMetrics.low, color: '#10B981' },
      { name: 'Medium Risk', level: 'MEDIUM', count: cohortMetrics.medium, color: '#F59E0B' },
      { name: 'High Risk', level: 'HIGH', count: cohortMetrics.high, color: '#F97316' },
      { name: 'Critical Risk', level: 'CRITICAL', count: cohortMetrics.critical, color: '#EF4444' },
      { name: 'Incomplete', level: 'INSUFFICIENT_DATA', count: cohortMetrics.insufficient, color: '#94A3B8' },
    ];
  }, [cohortMetrics]);

  // 6. Filtered and Sorted Student List
  const filteredStudents = useMemo(() => {
    return evaluatedStudents
      .filter(student => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = student.name.toLowerCase().includes(q);
          const matchRoll = student.rollNumber.toLowerCase().includes(q);
          const matchEmail = student.email.toLowerCase().includes(q);
          if (!matchName && !matchRoll && !matchEmail) return false;
        }

        if (selectedDepartment !== 'ALL' && student.department !== selectedDepartment) {
          return false;
        }

        if (selectedRiskLevel !== 'ALL' && student.riskLevel !== selectedRiskLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'SCORE_DESC') {
          const scoreA = a.computedScore?.finalScore ?? -1;
          const scoreB = b.computedScore?.finalScore ?? -1;
          return scoreB - scoreA;
        }
        if (sortBy === 'SCORE_ASC') {
          const scoreA = a.computedScore?.finalScore ?? 999;
          const scoreB = b.computedScore?.finalScore ?? 999;
          return scoreA - scoreB;
        }
        if (sortBy === 'ATTENDANCE_DESC') {
          const attA = a.attendance.overallPercentage ?? -1;
          const attB = b.attendance.overallPercentage ?? -1;
          return attB - attA;
        }
        if (sortBy === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [evaluatedStudents, searchQuery, selectedDepartment, selectedRiskLevel, sortBy]);

  // Filtered Early Warning Alerts
  const filteredAlerts = useMemo(() => {
    return earlyWarningAlerts.filter(alert => {
      if (alertCategoryFilter !== 'ALL' && alert.category !== alertCategoryFilter) return false;
      if (alertSeverityFilter !== 'ALL' && alert.severity !== alertSeverityFilter) return false;
      return true;
    });
  }, [earlyWarningAlerts, alertCategoryFilter, alertSeverityFilter]);

  // Top Observed Concerns across cohort
  const topObservedConcerns = useMemo(() => {
    const flagMap: Record<string, { title: string; category: string; severity: string; count: number }> = {};

    filteredStudents.forEach(st => {
      (st.riskFlags || []).forEach(f => {
        if (f.category !== 'DATA_QUALITY') {
          if (!flagMap[f.title]) {
            flagMap[f.title] = { title: f.title, category: f.category, severity: f.severity, count: 0 };
          }
          flagMap[f.title].count += 1;
        }
      });
    });

    return Object.values(flagMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [filteredStudents]);

  const hasActiveFilters = searchQuery !== '' || selectedDepartment !== 'ALL' || selectedRiskLevel !== 'ALL';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('ALL');
    setSelectedRiskLevel('ALL');
    setSortBy('SCORE_DESC');
  };

  // Helper to open student drawer and pre-fill intervention
  const handleOpenStudentIntervention = (student: StudentAnalyticsRecord, prefillIndicator?: string) => {
    setSelectedStudent(student);
    setDrawerActiveSection('INTERVENTIONS');
    if (prefillIndicator) {
      setNewInterventionIndicator(prefillIndicator);
    } else if (student.riskFlags && student.riskFlags.length > 0) {
      setNewInterventionIndicator(`${student.riskFlags[0].title} (${student.riskFlags[0].observedValue})`);
    } else {
      setNewInterventionIndicator('General Advising Check-in');
    }
  };

  // Helper to submit new intervention
  const handleCreateIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newInterventionNotes.trim()) return;

    interventionStore.add({
      studentId: selectedStudent.id,
      studentRollNumber: selectedStudent.rollNumber,
      studentName: selectedStudent.name,
      department: selectedStudent.department,
      triggeredIndicator: newInterventionIndicator || 'Faculty Direct Referral',
      interventionType: newInterventionType,
      priority: newInterventionPriority,
      status: 'OPEN',
      actionNotes: newInterventionNotes.trim(),
      assignedMentor: newInterventionMentor.trim() || currentUser?.name || 'Prof. Sharma (CSE)',
      followUpDate: newInterventionFollowUp || undefined,
      isSyntheticDemo: true,
    });

    setInterventions(interventionStore.getAll());
    setNewInterventionNotes('');
    setActionFeedbackMessage(`Intervention created for ${selectedStudent.name}. Logged in session memory.`);
    setTimeout(() => setActionFeedbackMessage(null), 4000);
  };

  // Helper to update intervention status
  const handleUpdateStatus = (intvId: string, newStatus: InterventionStatus) => {
    if (newStatus === 'COMPLETED') {
      setOutcomeTargetIntvId(intvId);
      setOutcomeNotesInput('');
      setIsOutcomeModalOpen(true);
      return;
    }

    interventionStore.updateStatus(intvId, newStatus, currentUser?.name || 'Faculty Advisor');
    setInterventions(interventionStore.getAll());
    setActionFeedbackMessage(`Intervention status updated to ${newStatus}.`);
    setTimeout(() => setActionFeedbackMessage(null), 4000);
  };

  // Helper to submit completion with outcome note
  const handleCompleteWithOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeTargetIntvId || !outcomeNotesInput.trim()) return;

    interventionStore.updateStatus(
      outcomeTargetIntvId,
      'COMPLETED',
      currentUser?.name || 'Faculty Advisor',
      'Intervention marked completed with outcome review',
      outcomeNotesInput.trim()
    );

    setInterventions(interventionStore.getAll());
    setIsOutcomeModalOpen(false);
    setOutcomeTargetIntvId(null);
    setOutcomeNotesInput('');
    setActionFeedbackMessage('Intervention resolved and outcome recorded.');
    setTimeout(() => setActionFeedbackMessage(null), 4000);
  };

  // Interventions for currently selected student in drawer
  const studentInterventions = useMemo(() => {
    if (!selectedStudent) return [];
    return interventions.filter(i => i.studentId === selectedStudent.id);
  }, [selectedStudent, interventions]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-brand-50 text-brand-700 border border-brand-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-brand-600" />
                <span>KPMG Domain · AI-Powered Student Analytics Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Student Success & At-Risk Mentoring Hub
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Explainable success scoring, evidence-based early-warning alerts, and tracked faculty intervention workflows.
              </p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setActiveTab('ROSTER')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'ROSTER'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Cohort Roster & Scores
              </button>
              <button
                onClick={() => setActiveTab('EARLY_WARNING')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'EARLY_WARNING'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Early Warnings & Queue</span>
                {earlyWarningAlerts.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                    {earlyWarningAlerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action Feedback Banner */}
          {actionFeedbackMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionFeedbackMessage}</span>
              </div>
              <button onClick={() => setActionFeedbackMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Metric Cards Section (Dynamic from evaluated dataset & interventions) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cohort Size</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-heading mt-1">{cohortMetrics.total}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">CSE, ECE & EEE</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Low Risk</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-emerald-600 font-heading mt-1">{cohortMetrics.low}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Score ≥ 80.0</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">High / Critical</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-rose-600 font-heading mt-1">{cohortMetrics.highOrCritical}</h3>
              <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{cohortMetrics.critical} Critical &lt; 45.0</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Early Warnings</span>
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-amber-600 font-heading mt-1">{earlyWarningAlerts.length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Evidence triggers</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Active Interv.</span>
                <FileEdit className="w-4 h-4 text-brand-600" />
              </div>
              <h3 className="text-2xl font-black text-brand-600 font-heading mt-1">
                {interventionSummary.open + interventionSummary.inProgress}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {interventionSummary.open} Open · {interventionSummary.inProgress} In Prog
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Follow-ups Due</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className={`text-2xl font-black font-heading mt-1 ${interventionSummary.followUpDueCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {interventionSummary.followUpDueCount}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {interventionSummary.completed} Completed
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: COHORT ROSTER & SCORES                                */}
          {/* ============================================================ */}
          {activeTab === 'ROSTER' && (
            <div className="space-y-6">
              {/* Visual Summary: Recharts Risk Distribution & Cohort Concerns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                        Cohort Risk Distribution
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Calculated from {cohortMetrics.total} student evaluation profiles
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                      Deterministic Thresholds
                    </span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl space-y-1">
                                  <p className="font-bold">{data.name}</p>
                                  <p className="text-slate-300">
                                    Students: <span className="font-bold text-white">{data.count}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                          {riskChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Observed Concerns */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                      Top Observed Cohort Concerns
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Most frequent empirical risk indicators
                    </p>
                  </div>

                  <div className="space-y-2.5 my-auto">
                    {topObservedConcerns.map((concern, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-slate-100 bg-slate-50/80 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{concern.title}</p>
                          <span className="text-[10px] text-slate-400 capitalize">{concern.category.toLowerCase()} category</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-rose-600">{concern.count}</span>
                          <span className="text-[10px] text-slate-400 block">students</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Derived from actual multi-dimensional assessment metrics.
                  </p>
                </div>
              </div>

              {/* Search, Filter & Sort Controls */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search students by name, roll number, or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
                    />
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                    <select
                      value={selectedDepartment}
                      onChange={e => setSelectedDepartment(e.target.value)}
                      className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
                    >
                      <option value="ALL">All Departments</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                    </select>

                    <select
                      value={selectedRiskLevel}
                      onChange={e => setSelectedRiskLevel(e.target.value)}
                      className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
                    >
                      <option value="ALL">All Risk Levels</option>
                      <option value="LOW">Low Risk (≥ 80)</option>
                      <option value="MEDIUM">Medium Risk (65–79)</option>
                      <option value="HIGH">High Risk (45–64)</option>
                      <option value="CRITICAL">Critical Risk (&lt; 45)</option>
                      <option value="INSUFFICIENT_DATA">Incomplete Data</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
                    >
                      <option value="SCORE_DESC">Sort: Score (High → Low)</option>
                      <option value="SCORE_ASC">Sort: Score (Low → High)</option>
                      <option value="ATTENDANCE_DESC">Sort: Attendance</option>
                      <option value="NAME_ASC">Sort: Name (A-Z)</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                        title="Reset Filters"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-5">Student</th>
                        <th className="py-3.5 px-4">Dept & Sem</th>
                        <th className="py-3.5 px-4">Success Score</th>
                        <th className="py-3.5 px-4">Risk Tier</th>
                        <th className="py-3.5 px-4">Attendance</th>
                        <th className="py-3.5 px-4">Assignments</th>
                        <th className="py-3.5 px-4">Active Alerts</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                            No student profiles match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => {
                          const hasAlerts = earlyWarningAlerts.some(a => a.studentId === student.id);
                          const activeIntv = interventions.find(i => i.studentId === student.id && i.status !== 'COMPLETED');

                          return (
                            <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-5">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{student.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{student.rollNumber}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-slate-600">
                                <span className="font-semibold text-slate-900">{student.department}</span>
                                <span className="text-[10px] text-slate-400 block">Sem {student.semester}</span>
                              </td>

                              <td className="py-3 px-4">
                                {student.computedScore?.finalScore !== null && student.computedScore?.finalScore !== undefined ? (
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {student.computedScore.finalScore}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient Data</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <RiskBadge level={student.riskLevel || 'INSUFFICIENT_DATA'} />
                              </td>

                              <td className="py-3 px-4">
                                {student.attendance.overallPercentage !== null && student.attendance.overallPercentage !== undefined ? (
                                  <span
                                    className={`font-semibold ${student.attendance.overallPercentage < 75
                                        ? 'text-rose-600 font-bold'
                                        : 'text-slate-800'
                                      }`}
                                  >
                                    {student.attendance.overallPercentage}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">—</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {student.assignments.completionRate !== null && student.assignments.completionRate !== undefined ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">{student.assignments.completionRate}%</span>
                                    {student.assignments.overdueCount ? (
                                      <span className="text-[10px] text-rose-500 font-bold block">
                                        {student.assignments.overdueCount} overdue
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">—</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {hasAlerts ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Early Warning
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">—</span>
                                )}
                              </td>

                              <td className="py-3 px-5 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenStudentIntervention(student)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                                >
                                  {activeIntv ? 'View Interv.' : 'Intervene'}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setDrawerActiveSection('OVERVIEW');
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  Profile
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: EARLY-WARNING ALERTS QUEUE & INTERVENTIONS TRACKER   */}
          {/* ============================================================ */}
          {activeTab === 'EARLY_WARNING' && (
            <div className="space-y-6">
              {/* Early Warning Alerts Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      Evidence-Based Early-Warning Alerts
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Empirical indicators flagged by the scoring engine requiring faculty advisement
                    </p>
                  </div>

                  {/* Filter Alerts */}
                  <div className="flex items-center gap-2">
                    <select
                      value={alertCategoryFilter}
                      onChange={e => setAlertCategoryFilter(e.target.value)}
                      className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
                    >
                      <option value="ALL">All Warning Types</option>
                      <option value="ATTENDANCE">Attendance Deficits</option>
                      <option value="ACADEMIC">Declining Trajectory</option>
                      <option value="ASSIGNMENTS">Assignment Backlogs</option>
                      <option value="BACKLOGS">Pending Backlogs</option>
                      <option value="DATA_QUALITY">Profile Incomplete</option>
                    </select>

                    <select
                      value={alertSeverityFilter}
                      onChange={e => setAlertSeverityFilter(e.target.value)}
                      className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
                    >
                      <option value="ALL">All Severities</option>
                      <option value="CRITICAL">Critical Only</option>
                      <option value="HIGH">High Only</option>
                      <option value="MEDIUM">Medium Only</option>
                    </select>
                  </div>
                </div>

                {/* Alerts Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAlerts.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 italic">
                      Zero early-warning alerts match the selected criteria.
                    </div>
                  ) : (
                    filteredAlerts.map(alert => {
                      const studentObj = evaluatedStudents.find(s => s.id === alert.studentId);
                      const hasActiveIntv = interventions.some(
                        i => i.studentId === alert.studentId && i.status !== 'COMPLETED'
                      );

                      return (
                        <div
                          key={alert.id}
                          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${alert.severity === 'CRITICAL'
                                    ? 'bg-rose-100 text-rose-700'
                                    : alert.severity === 'HIGH'
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                              >
                                {alert.severity} SEVERITY
                              </span>

                              {hasActiveIntv ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Intervention Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  Action Required
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug">{alert.title}</h4>

                            <div className="flex items-center space-x-2 pt-1">
                              <div className="w-6 h-6 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700 flex items-center justify-center shrink-0">
                                {alert.studentName.charAt(0)}
                              </div>
                              <div className="text-xs">
                                <span className="font-bold text-slate-800">{alert.studentName}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({alert.studentRollNumber} · {alert.department})</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px] space-y-1">
                              <div className="flex justify-between text-slate-600">
                                <span>Observed:</span>
                                <span className="font-bold text-slate-900">{alert.observedValue}</span>
                              </div>
                              {alert.thresholdValue && (
                                <div className="flex justify-between text-slate-500 text-[10px]">
                                  <span>Threshold:</span>
                                  <span>{alert.thresholdValue}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              <strong>Recommended:</strong> {alert.recommendedAction}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                            <button
                              onClick={() => studentObj && handleOpenStudentIntervention(studentObj, `${alert.title} (${alert.observedValue})`)}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Intervene & Log Plan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* All Interventions Tracker Table */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileEdit className="w-4 h-4 text-brand-600" />
                      Session Interventions Queue & Follow-Up Tracker
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tracked advising actions recorded during this faculty session
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-5">Student</th>
                          <th className="py-3 px-4">Intervention Type</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Assigned Mentor</th>
                          <th className="py-3 px-4">Follow-Up Date</th>
                          <th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {interventions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                              No interventions recorded yet in this session.
                            </td>
                          </tr>
                        ) : (
                          interventions.map(intv => {
                            const details = INTERVENTION_TYPE_DETAILS[intv.interventionType];
                            const studentObj = evaluatedStudents.find(s => s.id === intv.studentId);
                            const todayStr = new Date().toISOString().slice(0, 10);
                            const isOverdue = intv.status !== 'COMPLETED' && intv.followUpDate && intv.followUpDate <= todayStr;

                            return (
                              <tr key={intv.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-5">
                                  <span className="font-bold text-slate-900 block">{intv.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {intv.studentRollNumber} · {intv.department}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <span className="font-semibold text-slate-800">{details.label}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-xs">{intv.triggeredIndicator}</span>
                                </td>

                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${intv.priority === 'URGENT'
                                        ? 'bg-rose-100 text-rose-700'
                                        : intv.priority === 'HIGH'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-brand-50 text-brand-700'
                                      }`}
                                  >
                                    {intv.priority}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${intv.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : intv.status === 'IN_PROGRESS'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                  >
                                    {intv.status.replace('_', ' ')}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-slate-600 font-medium">{intv.assignedMentor}</td>

                                <td className="py-3 px-4">
                                  {intv.followUpDate ? (
                                    <span className={`font-mono text-xs ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                      {intv.followUpDate} {isOverdue && '(Due)'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">—</span>
                                  )}
                                </td>

                                <td className="py-3 px-5 text-right space-x-1.5">
                                  {intv.status === 'OPEN' && (
                                    <button
                                      onClick={() => handleUpdateStatus(intv.id, 'IN_PROGRESS')}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"
                                    >
                                      Mark In Progress
                                    </button>
                                  )}
                                  {intv.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => handleUpdateStatus(intv.id, 'COMPLETED')}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                                    >
                                      Complete
                                    </button>
                                  )}
                                  <button
                                    onClick={() => studentObj && handleOpenStudentIntervention(studentObj)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                                  >
                                    History
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* STUDENT DETAIL & INTERVENTION SLIDE-OVER DRAWER              */}
      {/* ============================================================ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 font-extrabold text-brand-700 flex items-center justify-center text-sm">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading leading-tight">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudent.rollNumber} · {selectedStudent.department} · Sem {selectedStudent.semester}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="bg-slate-200/60 p-0.5 rounded-xl flex items-center text-xs">
                  <button
                    onClick={() => setDrawerActiveSection('OVERVIEW')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${drawerActiveSection === 'OVERVIEW'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => setDrawerActiveSection('INTERVENTIONS')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${drawerActiveSection === 'INTERVENTIONS'
                        ? 'bg-white text-brand-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Interventions ({studentInterventions.length})
                  </button>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerActiveSection === 'OVERVIEW' && (
                <>
                  {/* Success Score Banner */}
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Student Success Score (0 – 100)
                        </span>
                        <div className="flex items-baseline space-x-3 mt-1">
                          {selectedStudent.computedScore?.finalScore !== null && selectedStudent.computedScore?.finalScore !== undefined ? (
                            <>
                              <span className="text-4xl font-black text-slate-900 font-heading">
                                {selectedStudent.computedScore.finalScore}%
                              </span>
                              <RiskBadge level={selectedStudent.riskLevel || 'INSUFFICIENT_DATA'} />
                            </>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-xl font-bold text-slate-600">
                                Insufficient Data to Calculate
                              </span>
                              <p className="text-xs text-slate-400">
                                Minimum 50% data profile required to evaluate score reliably.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Data Completeness
                        </span>
                        <span className="text-base font-extrabold text-slate-800">
                          {selectedStudent.computedScore?.dataCompletenessPercentage}%
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {selectedStudent.computedScore?.availableComponentsCount} of 4 dimensions recorded
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800 block mb-0.5">Factor Explanation:</span>
                      {selectedStudent.computedScore?.explanationText}
                    </div>
                  </div>

                  {/* 4 Dimensional Component Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                      Dimensional Score Breakdown
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <ComponentScoreCard
                        name="Academic Assessments"
                        nominalWeight="35%"
                        contribution={selectedStudent.computedScore?.academicContribution}
                      />
                      <ComponentScoreCard
                        name="Class Attendance"
                        nominalWeight="25%"
                        contribution={selectedStudent.computedScore?.attendanceContribution}
                      />
                      <ComponentScoreCard
                        name="Assignment Milestones"
                        nominalWeight="20%"
                        contribution={selectedStudent.computedScore?.assignmentContribution}
                      />
                      <ComponentScoreCard
                        name="Platform Engagement"
                        nominalWeight="20%"
                        contribution={selectedStudent.computedScore?.engagementContribution}
                      />
                    </div>
                  </div>

                  {/* Risk Flags */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                      Active Evidence-Based Risk Flags
                    </h4>

                    {selectedStudent.riskFlags && selectedStudent.riskFlags.length > 0 ? (
                      <div className="space-y-2">
                        {selectedStudent.riskFlags.map(flag => (
                          <div
                            key={flag.id}
                            className={`p-3.5 rounded-2xl border text-xs space-y-1 ${flag.severity === 'CRITICAL'
                                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                : flag.severity === 'HIGH'
                                  ? 'bg-orange-50/80 border-orange-200 text-orange-900'
                                  : flag.severity === 'MEDIUM'
                                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {flag.title}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                                {flag.severity}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-90">{flag.description}</p>
                            <div className="flex items-center space-x-4 pt-1 text-[10px] font-mono opacity-80">
                              <span>Observed: <strong>{flag.observedValue}</strong></span>
                              <span>Threshold: <strong>{flag.thresholdValue}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>No active risk flags detected for this student profile.</span>
                      </div>
                    )}
                  </div>

                  {/* Action Link to Interventions */}
                  <div className="pt-2">
                    <button
                      onClick={() => setDrawerActiveSection('INTERVENTIONS')}
                      className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-2xl text-xs border border-brand-200 flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileEdit className="w-4 h-4" />
                      <span>Manage Faculty Interventions & Mentoring Notes</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {drawerActiveSection === 'INTERVENTIONS' && (
                <div className="space-y-6">
                  {/* Create New Intervention Card */}
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-brand-600" />
                        Record New Faculty Intervention
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">In-Memory Session</span>
                    </div>

                    <form onSubmit={handleCreateIntervention} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Concern / Observed Indicator
                        </label>
                        <input
                          type="text"
                          value={newInterventionIndicator}
                          onChange={e => setNewInterventionIndicator(e.target.value)}
                          placeholder="e.g. Critical Attendance Deficit (58.5% < 75%)"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Intervention Type
                          </label>
                          <select
                            value={newInterventionType}
                            onChange={e => setNewInterventionType(e.target.value as InterventionType)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-medium"
                          >
                            <option value="ATTENDANCE_COUNSELING">Attendance Counseling</option>
                            <option value="ACADEMIC_TUTORING">Remedial Academic Tutoring</option>
                            <option value="ASSIGNMENT_RECOVERY">Assignment Recovery</option>
                            <option value="DATA_COMPLETION">Profile Data Completion</option>
                            <option value="WELLNESS_CHECK">Advising & Wellness Check</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Priority
                          </label>
                          <select
                            value={newInterventionPriority}
                            onChange={e => setNewInterventionPriority(e.target.value as InterventionPriority)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-medium"
                          >
                            <option value="URGENT">Urgent</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Assigned Faculty Mentor
                          </label>
                          <input
                            type="text"
                            value={newInterventionMentor}
                            onChange={e => setNewInterventionMentor(e.target.value)}
                            placeholder="Responsible faculty member"
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Follow-Up Date
                          </label>
                          <input
                            type="date"
                            value={newInterventionFollowUp}
                            onChange={e => setNewInterventionFollowUp(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Faculty Action / Mentoring Notes (Confidential)
                        </label>
                        <textarea
                          rows={3}
                          value={newInterventionNotes}
                          onChange={e => setNewInterventionNotes(e.target.value)}
                          placeholder="Record specific counseling actions, requirements, or diagnostic observations..."
                          className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setIsBookingModalOpen(true)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          Authorize Lab Access
                        </button>

                        <button
                          type="submit"
                          disabled={!newInterventionNotes.trim()}
                          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Record Intervention Plan</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of Existing Interventions for this Student */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                      Existing Interventions for {selectedStudent.name} ({studentInterventions.length})
                    </h4>

                    {studentInterventions.length === 0 ? (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 italic">
                        No previous interventions logged for this student.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {studentInterventions.map(intv => {
                          const details = INTERVENTION_TYPE_DETAILS[intv.interventionType];

                          return (
                            <div
                              key={intv.id}
                              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft space-y-2.5 text-xs"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-bold text-slate-900 block">{details.label}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Triggered: {intv.triggeredIndicator}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${intv.status === 'COMPLETED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : intv.status === 'IN_PROGRESS'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                  >
                                    {intv.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mentoring Notes</span>
                                <p className="text-slate-700 leading-relaxed text-xs">{intv.actionNotes}</p>
                              </div>

                              {intv.outcomeNotes && (
                                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 space-y-1">
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Resolution Outcome</span>
                                  <p className="text-emerald-900 leading-relaxed text-xs">{intv.outcomeNotes}</p>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                <div>
                                  Mentor: <strong>{intv.assignedMentor}</strong>
                                  {intv.followUpDate && (
                                    <span className="ml-2 font-mono">Follow-up: {intv.followUpDate}</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {intv.status === 'OPEN' && (
                                    <button
                                      onClick={() => handleUpdateStatus(intv.id, 'IN_PROGRESS')}
                                      className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg"
                                    >
                                      Mark In Progress
                                    </button>
                                  )}
                                  {intv.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => handleUpdateStatus(intv.id, 'COMPLETED')}
                                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                                    >
                                      Complete & Log Outcome
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Activity History Timeline */}
                              {intv.history && intv.history.length > 0 && (
                                <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-400 font-mono">
                                  <span className="font-bold uppercase text-[9px] text-slate-500 block">Activity Log:</span>
                                  {intv.history.map(h => (
                                    <div key={h.id} className="flex justify-between">
                                      <span>{new Date(h.timestamp).toLocaleDateString()} · {h.action}</span>
                                      <span className="italic">{h.performedBy}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outcome Completion Modal */}
      {isOutcomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Complete Intervention & Record Outcome
              </h3>
              <button
                onClick={() => setIsOutcomeModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Record the observed resolution or meeting outcome before closing this intervention.
            </p>

            <form onSubmit={handleCompleteWithOutcome} className="space-y-3">
              <textarea
                rows={3}
                value={outcomeNotesInput}
                onChange={e => setOutcomeNotesInput(e.target.value)}
                placeholder="e.g. Student submitted medical documentation; condonation approved. Attendance recovered to 76% in week 6."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!outcomeNotesInput.trim()}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preserve MultiStepBookingModal from original page */}
      <MultiStepBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper Subcomponents
// ---------------------------------------------------------------------------

function RiskBadge({ level }: { level: StudentRiskLevel }) {
  switch (level) {
    case 'LOW':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Low Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-600" /> Medium Risk
        </span>
      );
    case 'HIGH':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-orange-600" /> High Risk
        </span>
      );
    case 'CRITICAL':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-rose-600" /> Critical Risk
        </span>
      );
    case 'INSUFFICIENT_DATA':
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-500" /> Incomplete Data
        </span>
      );
  }
}

function ComponentScoreCard({
  name,
  nominalWeight,
  contribution,
}: {
  name: string;
  nominalWeight: string;
  contribution?: {
    rawScore: number | null;
    effectiveWeight: number;
    weightedPoints: number;
    isAvailable: boolean;
  };
}) {
  const isAvailable = contribution?.isAvailable && contribution.rawScore !== null;

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-soft space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 text-xs">{name}</span>
        <span className="text-[10px] font-semibold text-slate-400">Weight: {nominalWeight}</span>
      </div>

      {isAvailable ? (
        <>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              Raw Score: <strong className="text-slate-900">{contribution!.rawScore}%</strong>
            </span>
            <span className="font-bold text-brand-600 text-[11px]">
              +{contribution!.weightedPoints} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${contribution!.rawScore}%` }} />
          </div>
          <p className="text-[9px] text-slate-400 font-mono">
            Effective Weight: {(contribution!.effectiveWeight * 100).toFixed(1)}%
          </p>
        </>
      ) : (
        <div className="py-2 text-center text-slate-400 text-[11px] italic">
          — Dimension Not Recorded
        </div>
      )}
    </div>
  );
}
