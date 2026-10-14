'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Award,
  AlertTriangle,
  ShieldAlert,
  Database,
  UploadCloud,
  Download,
  FileSpreadsheet,
  RotateCcw,
  X,
  Info,
  Building2,
  Filter,
  Check,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import { SYNTHETIC_STUDENT_ANALYTICS } from '@/lib/studentAnalyticsData';
import { evaluateCohortAnalytics } from '@/lib/studentAnalyticsEngine';
import { StudentAnalyticsRecord } from '@/types/studentAnalytics';
import {
  validateAndParseStudentCsv,
  generateExampleCsvTemplate,
  computeDepartmentAnalytics,
  exportInstitutionalSummaryCsv,
  exportValidationErrorsCsv,
  CsvValidationResult,
  InstitutionalAnalyticsSummary,
} from '@/lib/csvAnalyticsImport';

export default function AdminAnalyticsPage() {
  // Navigation tabs between Student Analytics and Facility Intelligence
  const [activeTab, setActiveTab] = useState<'student_success' | 'facility_intelligence'>('student_success');

  // Active dataset state: SYNTHETIC demo data vs IMPORTED session data
  const [activeDataSource, setActiveDataSource] = useState<'SYNTHETIC' | 'IMPORTED'>('SYNTHETIC');
  const [currentDataset, setCurrentDataset] = useState<StudentAnalyticsRecord[]>(SYNTHETIC_STUDENT_ANALYTICS);

  // Department filter
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [importViewMode, setImportViewMode] = useState<'PREVIEW' | 'ERRORS'>('PREVIEW');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Facility Insights (Preserved from existing page)
  const insights = [
    { title: 'Seminar Hall A Utilization Peak', text: 'Seminar Hall A is underutilized between 2 PM and 5 PM on Tuesdays.', type: 'Optimization' },
    { title: 'Robotics Lab Demand Spike', text: 'Robotics Lab demand has increased by 42% on Wednesdays due to drone project milestones.', type: 'Demand' },
    { title: 'Hardware Inspection Alert', text: 'Projector #04 has an unusually high maintenance frequency (3 tickets this month).', type: 'Maintenance' },
  ];

  // 1. Evaluate cohort through Phase 1 deterministic engine
  const evaluatedAllRecords = useMemo(() => {
    return evaluateCohortAnalytics(currentDataset);
  }, [currentDataset]);

  // Available departments in current dataset
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    evaluatedAllRecords.forEach(r => {
      if (r.department) set.add(r.department.toUpperCase());
    });
    return Array.from(set).sort();
  }, [evaluatedAllRecords]);

  // Filtered evaluated cohort
  const evaluatedFilteredRecords = useMemo(() => {
    if (selectedDept === 'ALL') return evaluatedAllRecords;
    return evaluatedAllRecords.filter(r => r.department?.toUpperCase() === selectedDept);
  }, [evaluatedAllRecords, selectedDept]);

  // 2. Department comparisons computed dynamically across entire dataset
  const departmentSummaries = useMemo(() => {
    return computeDepartmentAnalytics(evaluatedAllRecords);
  }, [evaluatedAllRecords]);

  // 3. Dynamic Institutional KPIs
  const totalEvaluated = evaluatedFilteredRecords.length;
  const validScoreRecords = evaluatedFilteredRecords.filter(r => r.computedScore?.finalScore !== null && r.computedScore?.finalScore !== undefined);
  const validScoreCount = validScoreRecords.length;
  const averageSuccessScore = validScoreCount > 0
    ? Math.round((validScoreRecords.reduce((sum, r) => sum + (r.computedScore?.finalScore || 0), 0) / validScoreCount) * 10) / 10
    : null;

  const lowRiskCount = evaluatedFilteredRecords.filter(r => r.riskLevel === 'LOW').length;
  const medRiskCount = evaluatedFilteredRecords.filter(r => r.riskLevel === 'MEDIUM').length;
  const highRiskCount = evaluatedFilteredRecords.filter(r => r.riskLevel === 'HIGH').length;
  const criticalRiskCount = evaluatedFilteredRecords.filter(r => r.riskLevel === 'CRITICAL').length;
  const insufficientCount = evaluatedFilteredRecords.filter(r => r.riskLevel === 'INSUFFICIENT_DATA').length;
  const sufficientPercentage = totalEvaluated > 0
    ? Math.round(((totalEvaluated - insufficientCount) / totalEvaluated) * 100)
    : 0;

  // Chart 1 Data: Department Score vs Attendance
  const deptPerformanceChartData = useMemo(() => {
    return departmentSummaries.map(d => ({
      department: d.department,
      avgScore: d.averageSuccessScore,
      avgAttendance: d.averageAttendance,
      students: d.totalStudents,
      validScoreCount: d.validScoreCount,
      attendanceCount: d.attendanceCount,
    }));
  }, [departmentSummaries]);

  // Chart 2 Data: Department Risk Distribution
  const deptRiskChartData = useMemo(() => {
    return departmentSummaries.map(d => ({
      department: d.department,
      Low: d.riskDistribution.LOW,
      Medium: d.riskDistribution.MEDIUM,
      High: d.riskDistribution.HIGH,
      Critical: d.riskDistribution.CRITICAL,
      Incomplete: d.riskDistribution.INSUFFICIENT_DATA,
      total: d.totalStudents,
    }));
  }, [departmentSummaries]);

  // Handler for file reading & client-side validation
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file.');
      return;
    }

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = validateAndParseStudentCsv(text);
        setValidationResult(result);
        setImportViewMode(result.errors.length > 0 && result.validRowsCount === 0 ? 'ERRORS' : 'PREVIEW');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Switch dataset to validated CSV records for current session
  const handleConfirmImport = () => {
    if (!validationResult || validationResult.validRecords.length === 0) return;
    setCurrentDataset(validationResult.validRecords);
    setActiveDataSource('IMPORTED');
    setSelectedDept('ALL');
    setIsImportModalOpen(false);
    setValidationResult(null);
    setImportFileName('');
  };

  // Reset to default synthetic demonstration data
  const handleResetToDefault = () => {
    setCurrentDataset(SYNTHETIC_STUDENT_ANALYTICS);
    setActiveDataSource('SYNTHETIC');
    setSelectedDept('ALL');
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const csvContent = generateExampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resora_student_analytics_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Institutional Summary CSV
  const handleExportSummaryCsv = () => {
    const summary: InstitutionalAnalyticsSummary = {
      dataSourceLabel: activeDataSource === 'SYNTHETIC' ? 'Synthetic Demonstration Dataset (30 Records)' : `User Uploaded Preview (${currentDataset.length} Records)`,
      totalEvaluated,
      validScoreCount,
      averageSuccessScore,
      sufficientDataPercentage: sufficientPercentage,
      insufficientDataCount: insufficientCount,
      riskCounts: {
        LOW: lowRiskCount,
        MEDIUM: medRiskCount,
        HIGH: highRiskCount,
        CRITICAL: criticalRiskCount,
        INSUFFICIENT_DATA: insufficientCount,
      },
      departmentSummaries,
    };

    const csvContent = exportInstitutionalSummaryCsv(summary);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resora_institutional_analytics_${activeDataSource.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV Error Log
  const handleExportErrorLog = () => {
    if (!validationResult || validationResult.errors.length === 0) return;
    const csvContent = exportValidationErrorsCsv(validationResult.errors);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resora_csv_validation_errors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Title & Tab Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Admin Institutional Analytics
                </span>
                <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                  HacXlerate • KPMG Domain
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">
                Institutional Intelligence & Success Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort success benchmarking, department comparisons, and client-side safe CSV validation
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('student_success')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'student_success'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student Success Analytics
              </button>
              <button
                onClick={() => setActiveTab('facility_intelligence')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'facility_intelligence'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Campus Facility Intelligence
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: STUDENT SUCCESS & INSTITUTIONAL ANALYTICS              */}
          {/* ============================================================ */}
          {activeTab === 'student_success' && (
            <div className="space-y-6">
              {/* Dataset Status Banner & Action Controls */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      activeDataSource === 'SYNTHETIC'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {activeDataSource === 'SYNTHETIC' ? <Info className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {activeDataSource === 'SYNTHETIC'
                          ? 'Active Source: Synthetic Demonstration Cohort'
                          : 'Active Source: User-Uploaded Session Preview'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeDataSource === 'SYNTHETIC'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activeDataSource === 'SYNTHETIC' ? '30 Synthetic Records' : `${currentDataset.length} Session Records`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {activeDataSource === 'SYNTHETIC'
                        ? 'Demonstration sample data across CSE, ECE, and EEE. Results are strictly non-authoritative.'
                        : 'Temporary in-memory dataset evaluated for this browser session. Zero data was saved to permanent storage.'}
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {activeDataSource === 'IMPORTED' && (
                    <button
                      onClick={handleResetToDefault}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Return to the default 30-record synthetic demonstration dataset"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      Reset to Default
                    </button>
                  )}

                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
                    title="Download compliant CSV template with sample fields"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    CSV Template
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Import CSV
                  </button>

                  <button
                    onClick={handleExportSummaryCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                    title="Export aggregate department metrics and score distribution as CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Summary
                  </button>
                </div>
              </div>

              {/* Department Filter Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter Dept:
                  </span>
                  <button
                    onClick={() => setSelectedDept('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedDept === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Departments ({evaluatedAllRecords.length})
                  </button>
                  {availableDepartments.map(dept => {
                    const count = evaluatedAllRecords.filter(r => r.department?.toUpperCase() === dept).length;
                    return (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedDept === dept
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {dept} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-400">
                  Showing {evaluatedFilteredRecords.length} of {evaluatedAllRecords.length} records
                </div>
              </div>

              {/* SECTION 1: INSTITUTIONAL STUDENT SUCCESS OVERVIEW (KPIS) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* KPI 1: Evaluated Records */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cohort Evaluated</span>
                    <Users className="w-4 h-4 text-brand-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-2">
                    {totalEvaluated}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {selectedDept === 'ALL' ? 'Total institutional dataset' : `${selectedDept} department`}
                  </p>
                </div>

                {/* KPI 2: Cohort Average Score */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
                    <Award className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-2">
                    {averageSuccessScore !== null ? `${averageSuccessScore}%` : 'N/A'}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {validScoreCount > 0 ? `From ${validScoreCount}/${totalEvaluated} valid records` : 'No valid scores'}
                  </p>
                </div>

                {/* KPI 3: Low Risk */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Low Risk</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-emerald-700 font-heading mt-2">
                    {lowRiskCount}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {totalEvaluated > 0 ? `${Math.round((lowRiskCount / totalEvaluated) * 100)}% of cohort` : '0%'} • Score ≥ 80
                  </p>
                </div>

                {/* KPI 4: Medium Risk */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Medium Risk</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-amber-700 font-heading mt-2">
                    {medRiskCount}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {totalEvaluated > 0 ? `${Math.round((medRiskCount / totalEvaluated) * 100)}% of cohort` : '0%'} • Score 65–79
                  </p>
                </div>

                {/* KPI 5: High & Critical Risk */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">High & Critical</span>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-rose-700 font-heading mt-2">
                    {highRiskCount + criticalRiskCount}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    High: {highRiskCount} | Critical: {criticalRiskCount}
                  </p>
                </div>

                {/* KPI 6: Data Completeness */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Completeness</span>
                    <Database className="w-4 h-4 text-sky-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-2">
                    {sufficientPercentage}%
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {insufficientCount > 0 ? `${insufficientCount} record(s) incomplete` : 'All records sufficient'}
                  </p>
                </div>
              </div>

              {/* SECTION 2: DEPARTMENT COMPARISON VISUALIZATIONS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-brand-600" />
                      Department Cross-Comparison
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Empirical averages across CSE, ECE, EEE, and active cohorts (excluding unrecorded metrics)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Chart A: Success Score vs Attendance */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Average Success Score vs. Attendance</h3>
                        <p className="text-[10px] text-slate-400">Comparing valid score averages with observed attendance</p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-brand-700">
                          <span className="w-2.5 h-2.5 rounded-sm bg-brand-600 inline-block"></span> Success Score
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Attendance
                        </span>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptPerformanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                                    <div className="font-bold text-sm text-brand-300">{data.department} Department</div>
                                    <div className="text-[11px] text-slate-300">Total Records: {data.students}</div>
                                    <div className="border-t border-slate-700 my-1 pt-1 space-y-1">
                                      <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Avg Success Score:</span>
                                        <span className="font-bold text-brand-400">
                                          {data.avgScore !== null ? `${data.avgScore}% (${data.validScoreCount}/${data.students})` : 'Insufficient Data'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Avg Attendance:</span>
                                        <span className="font-bold text-emerald-400">
                                          {data.avgAttendance !== null ? `${data.avgAttendance}% (${data.attendanceCount}/${data.students})` : 'Insufficient Data'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="avgScore" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={38} />
                          <Bar dataKey="avgAttendance" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={38} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart B: Department Risk Distribution */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Department Risk Distribution</h3>
                        <p className="text-[10px] text-slate-400">Proportion of students in each risk tier</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Low
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-amber-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Med
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-orange-700">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> High
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Crit
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Inc
                        </span>
                      </div>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptRiskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="department" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                                    <div className="font-bold text-sm text-slate-100">{data.department} Department</div>
                                    <div className="text-[11px] text-slate-400">Total Students: {data.total}</div>
                                    <div className="border-t border-slate-700 my-1 pt-1 space-y-1">
                                      <div className="text-emerald-400">Low Risk: {data.Low}</div>
                                      <div className="text-amber-400">Medium Risk: {data.Medium}</div>
                                      <div className="text-orange-400">High Risk: {data.High}</div>
                                      <div className="text-rose-400">Critical Risk: {data.Critical}</div>
                                      <div className="text-slate-400">Incomplete Data: {data.Incomplete}</div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="Low" stackId="a" fill="#10B981" />
                          <Bar dataKey="Medium" stackId="a" fill="#F59E0B" />
                          <Bar dataKey="High" stackId="a" fill="#F97316" />
                          <Bar dataKey="Critical" stackId="a" fill="#EF4444" />
                          <Bar dataKey="Incomplete" stackId="a" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Department Detailed Metrics Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Detailed Department Aggregate Matrix</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sample sizes displayed per metric. Missing values are excluded and never coerced to zero.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3.5 px-5">Department</th>
                          <th className="py-3.5 px-4">Students (N)</th>
                          <th className="py-3.5 px-4">Avg Success Score</th>
                          <th className="py-3.5 px-4">Avg Attendance</th>
                          <th className="py-3.5 px-4">Academic Avg</th>
                          <th className="py-3.5 px-4">Assignment Rate</th>
                          <th className="py-3.5 px-4">Engagement Avg</th>
                          <th className="py-3.5 px-5">Risk Distribution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {departmentSummaries.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                              No department records found in active dataset.
                            </td>
                          </tr>
                        ) : (
                          departmentSummaries.map((dept) => (
                            <tr key={dept.department} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-5">
                                <span className="font-bold text-slate-900">{dept.department}</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                <span className="font-semibold text-slate-900">{dept.totalStudents}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                {dept.averageSuccessScore !== null ? (
                                  <div>
                                    <span className="font-bold text-brand-600">{dept.averageSuccessScore}%</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({dept.validScoreCount}/{dept.totalStudents})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient data</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                {dept.averageAttendance !== null ? (
                                  <div>
                                    <span className="font-semibold text-slate-900">{dept.averageAttendance}%</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({dept.attendanceCount}/{dept.totalStudents})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient data</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                {dept.averageAcademic !== null ? (
                                  <div>
                                    <span className="text-slate-800">{dept.averageAcademic}%</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({dept.academicCount}/{dept.totalStudents})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient data</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                {dept.averageAssignment !== null ? (
                                  <div>
                                    <span className="text-slate-800">{dept.averageAssignment}%</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({dept.assignmentCount}/{dept.totalStudents})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient data</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                {dept.averageEngagement !== null ? (
                                  <div>
                                    <span className="text-slate-800">{dept.averageEngagement}/100</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({dept.engagementCount}/{dept.totalStudents})</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Insufficient data</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Low Risk">
                                    L:{dept.riskDistribution.LOW}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" title="Medium Risk">
                                    M:{dept.riskDistribution.MEDIUM}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800" title="High Risk">
                                    H:{dept.riskDistribution.HIGH}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800" title="Critical Risk">
                                    C:{dept.riskDistribution.CRITICAL}
                                  </span>
                                  {dept.riskDistribution.INSUFFICIENT_DATA > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600" title="Incomplete Data">
                                      ?:{dept.riskDistribution.INSUFFICIENT_DATA}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Ethical & Methodological Disclaimer Notice */}
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      <strong>Methodological Guidance:</strong> Department success score comparisons represent empirical aggregations across valid records in the selected session. No department is categorized as &quot;best&quot; or &quot;worst&quot; without contextual consideration of sample size and data completeness. These indicators do not infer graduation probability, placement guarantees, or institutional causality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CAMPUS FACILITY & RESOURCE INTELLIGENCE (PRESERVED)   */}
          {/* ============================================================ */}
          {activeTab === 'facility_intelligence' && (
            <div className="space-y-6">
              {/* AI Insights Cards Section (Original Resora Feature) */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Automated Facility AI Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.map((ins, i) => (
                    <div key={i} className="bg-purple-900 text-white p-5 rounded-3xl border border-purple-800 shadow-card space-y-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 uppercase">
                        {ins.type}
                      </span>
                      <h4 className="text-sm font-bold">{ins.title}</h4>
                      <p className="text-xs text-purple-200 leading-relaxed">{ins.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility KPIs (Original Resora Feature) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cancellation Rate</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">2.4%</h3>
                  <p className="text-[10px] text-emerald-600 mt-1">↓ 0.8% lower than last month</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">No-Show Rate</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">1.1%</h3>
                  <p className="text-[10px] text-emerald-600 mt-1">Auto-release grace period active</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Peak Booking Hour</span>
                  <h3 className="text-2xl font-extrabold text-brand-600 font-heading mt-1">02:00 PM</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Highest load on Block A & B</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Most Requested Space</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading mt-1">AI/ML Lab</h3>
                  <p className="text-[10px] text-slate-500 mt-1">94% average occupancy</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* CSV IMPORT & VALIDATION MODAL                                */}
      {/* ============================================================ */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    Import Student Analytics CSV
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    Client-Side Session Preview
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validates headers, numerical bounds, and roll numbers in memory. Zero data is persisted to permanent storage.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setValidationResult(null);
                  setImportFileName('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {importFileName ? (
                    <span className="text-brand-600">{importFileName}</span>
                  ) : (
                    'Click to upload or drag & drop CSV file'
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Strict RFC-4180 parsing with comma escaping and range validation
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate();
                    }}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-semibold underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download compliant example template (.csv)
                  </button>
                </div>
              </div>

              {/* Validation Summary Cards */}
              {validationResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Total Rows</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-0.5">{validationResult.totalRows}</div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">Valid Rows</div>
                      <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{validationResult.validRowsCount}</div>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                      <div className="text-[10px] font-bold text-rose-700 uppercase">Invalid Rows</div>
                      <div className="text-xl font-extrabold text-rose-700 mt-0.5">{validationResult.invalidRowsCount}</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                      <div className="text-[10px] font-bold text-amber-700 uppercase">Warnings</div>
                      <div className="text-xl font-extrabold text-amber-700 mt-0.5">{validationResult.warningRowsCount}</div>
                    </div>
                  </div>

                  {/* Sub-view switcher within modal */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setImportViewMode('PREVIEW')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          importViewMode === 'PREVIEW'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Parsed Preview ({validationResult.previewRows.length} rows)
                      </button>
                      <button
                        onClick={() => setImportViewMode('ERRORS')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                          importViewMode === 'ERRORS'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Issues & Errors ({validationResult.errors.length})
                      </button>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <button
                        onClick={handleExportErrorLog}
                        className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Error Log CSV
                      </button>
                    )}
                  </div>

                  {/* SUB-VIEW 1: PARSED PREVIEW */}
                  {importViewMode === 'PREVIEW' && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="max-h-56 overflow-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">Row</th>
                              {validationResult.headers.map((h) => (
                                <th key={h} className="py-2.5 px-3">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {validationResult.previewRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70">
                                <td className="py-2 px-3 font-mono text-[10px] text-slate-400">#{idx + 2}</td>
                                {validationResult.headers.map((h) => (
                                  <td key={h} className="py-2 px-3 truncate max-w-[120px]">
                                    {row[h] || <span className="text-slate-300 italic">—</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 2: ERROR LIST */}
                  {importViewMode === 'ERRORS' && (
                    <div className="border border-rose-200 rounded-2xl overflow-hidden bg-rose-50/20">
                      <div className="max-h-56 overflow-auto">
                        {validationResult.errors.length === 0 ? (
                          <div className="p-6 text-center text-emerald-600 font-semibold text-xs flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> All rows passed schema and range validation with zero errors!
                          </div>
                        ) : (
                          <table className="w-full text-left text-xs">
                            <thead className="bg-rose-100/60 text-rose-900 uppercase text-[10px] font-bold sticky top-0">
                              <tr>
                                <th className="py-2.5 px-3">Row</th>
                                <th className="py-2.5 px-3">Severity</th>
                                <th className="py-2.5 px-3">Column</th>
                                <th className="py-2.5 px-3">Input Value</th>
                                <th className="py-2.5 px-3">Issue Reason</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100/70 text-slate-800">
                              {validationResult.errors.map((err, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/60">
                                  <td className="py-2 px-3 font-mono font-bold text-slate-700">#{err.rowNumber}</td>
                                  <td className="py-2 px-3">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        err.severity === 'ERROR'
                                          ? 'bg-rose-200 text-rose-800'
                                          : 'bg-amber-200 text-amber-800'
                                      }`}
                                    >
                                      {err.severity}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{err.column}</td>
                                  <td className="py-2 px-3 font-mono text-[11px] text-rose-700 truncate max-w-[120px]">
                                    {err.value || '<empty>'}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 text-[11px]">{err.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Persistence Warning Box */}
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      <strong>Session Persistence Boundary:</strong> Accepting imported records will switch the analytics dashboard view for the current page session. These records will <strong>never</strong> be written to PostgreSQL, Prisma, Supabase, or localStorage. Refreshing or clicking &quot;Reset to Default&quot; will discard this temporary dataset.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setValidationResult(null);
                  setImportFileName('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel & Discard
              </button>

              <button
                onClick={handleConfirmImport}
                disabled={!validationResult || validationResult.validRowsCount === 0}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  validationResult && validationResult.validRowsCount > 0
                    ? 'bg-brand-600 text-white hover:bg-brand-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Confirm & Switch View ({validationResult ? validationResult.validRowsCount : 0} Valid Records)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
