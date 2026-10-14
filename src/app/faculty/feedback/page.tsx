'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import {
  getFacultyAggregateFeedback,
  getFacultyBroadcastNotes,
  publishFacultyBroadcastNote,
  FacultyAggregateFeedback,
  FacultyBroadcastNote,
} from '@/lib/feedbackService';
import {
  Star,
  MessageSquareQuote,
  TrendingUp,
  Award,
  Users,
  Send,
  Plus,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  Bell,
  Clock,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  BarChart3,
  Heart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function FacultyFeedbackPage() {
  const { currentUser } = useResora();

  // Faculty feedback state
  const [aggregate, setAggregate] = useState<FacultyAggregateFeedback>(() => getFacultyAggregateFeedback());
  const [broadcasts, setBroadcasts] = useState<FacultyBroadcastNote[]>(() => getFacultyBroadcastNotes());

  // Filter state for student remarks
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // New broadcast form modal state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [noteCourse, setNoteCourse] = useState('CSE-301');
  const [noteCategory, setNoteCategory] = useState<'CURRICULUM_UPDATE' | 'EXAM_PREP' | 'OFFICE_HOURS' | 'APPRECIATION'>('EXAM_PREP');
  const [noteCohort, setNoteCohort] = useState('3rd Year CSE (Sec A & B)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered comments
  const filteredComments = useMemo(() => {
    return aggregate.recentStudentComments.filter(c => {
      const matchCourse = selectedCourseFilter === 'ALL' || c.courseCode === selectedCourseFilter;
      const matchRating = c.rating >= minRatingFilter;
      return matchCourse && matchRating;
    });
  }, [aggregate, selectedCourseFilter, minRatingFilter]);

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteMessage.trim()) return;

    const updated = publishFacultyBroadcastNote({
      courseCode: noteCourse,
      instructorName: currentUser?.name || aggregate.instructorName,
      title: noteTitle,
      message: noteMessage,
      category: noteCategory,
      targetCohort: noteCohort,
    });

    setBroadcasts(updated);
    setIsBroadcastModalOpen(false);
    setNoteTitle('');
    setNoteMessage('');
    setToastMessage('Guidance broadcast successfully published to student cohort!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-200 px-5 py-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card border border-slate-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 text-brand-400" />
                  <span>Faculty Appraisal & Teaching Effectiveness</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  Student Feedback & Cohort Evaluation Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Real-time qualitative insights, pedagogical scores, and response channels directly to your enrolled students.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Cohort Feedback</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {aggregate.overallRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </p>
              <span className="text-[10px] font-bold text-emerald-600">Top 5% Faculty Tier</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Responses</span>
                <Users className="w-4 h-4 text-brand-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {aggregate.totalResponses}
              </p>
              <span className="text-[10px] font-bold text-brand-600">{aggregate.responseRatePercent}% Participation Rate</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Satisfaction</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {aggregate.netSatisfactionScore}%
              </p>
              <span className="text-[10px] font-bold text-emerald-600">92% Positive Sentiment</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Broadcasts</span>
                <Bell className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-heading mt-1">
                {broadcasts.length}
              </p>
              <span className="text-[10px] font-bold text-indigo-600">Cohort Guidance Notes</span>
            </div>
          </div>

          {/* Grid Layout: Pedagogical Breakdown & Course Ratings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Pedagogical Dimensions & Course Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Pedagogical Dimensions Chart & Progress Bars */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    Pedagogical Evaluation Criteria
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aggregated student ratings across key accreditation dimensions
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Conceptual Clarity & Pedagogy', score: aggregate.dimensionScores.pedagogy, max: 5 },
                    { label: 'Doubt Resolution & Office Hours Accessibility', score: aggregate.dimensionScores.accessibility, max: 5 },
                    { label: 'Practical Lab Demonstrations & Coding Depth', score: aggregate.dimensionScores.labRelevance, max: 5 },
                    { label: 'Evaluation Fairness & Transparent Grading', score: aggregate.dimensionScores.evaluationFairness, max: 5 },
                    { label: 'Course Pace & Syllabus Coverage Structure', score: aggregate.dimensionScores.coursePace, max: 5 },
                  ].map((dim, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{dim.label}</span>
                        <div className="flex items-center space-x-1 font-bold text-slate-900">
                          <span>{dim.score}</span>
                          <span className="text-slate-400 text-[10px]">/ 5.0</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${(dim.score / dim.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course-Specific Performance Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-heading">
                      Course-Wise Teaching Evaluations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Breakdown across currently assigned academic subjects
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aggregate.coursesTaught.map(course => (
                    <div
                      key={course.courseCode}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2 hover:bg-slate-100/60 transition-colors"
                    >
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-brand-700 border border-slate-200">
                        {course.courseCode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {course.courseName}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-center space-x-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="text-base font-black text-slate-900 font-heading">{course.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{course.responses} reviews</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Remarks & Qualitative Feedback */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-heading">
                      Qualitative Student Remarks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Constructive comments and observations from student evaluations
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedCourseFilter}
                      onChange={e => setSelectedCourseFilter(e.target.value)}
                      className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="ALL">All Courses</option>
                      <option value="CSE-301">CSE-301 DBMS</option>
                      <option value="CSE-306">CSE-306 Adv DB Lab</option>
                    </select>

                    <select
                      value={minRatingFilter}
                      onChange={e => setMinRatingFilter(Number(e.target.value))}
                      className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value={0}>All Ratings</option>
                      <option value={5}>5 Stars Only</option>
                      <option value={4}>4+ Stars</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredComments.map(comment => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                            {comment.courseCode}
                          </span>
                          <span className="font-bold text-slate-800">
                            {comment.isAnonymous ? 'Anonymous Student' : comment.studentName}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= comment.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400">{comment.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        &ldquo;{comment.comment}&rdquo;
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {comment.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                          <ThumbsUp className="w-3 h-3 text-brand-500" />
                          <span>{comment.upvotesCount} student agreements</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Broadcast Feed & Actionable Recommendations */}
            <div className="space-y-6">
              {/* Published Broadcasts Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Your Active Guidance</h3>
                    <p className="text-xs text-slate-500">Live instructional feedback to cohorts</p>
                  </div>
                  <button
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="p-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"
                    title="Publish Announcement"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {broadcasts.map(b => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-indigo-700 font-mono">{b.courseCode}</span>
                        <span className="text-slate-400">{b.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{b.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                        {b.message}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Cohort: {b.targetCohort}</span>
                        <span className="text-brand-600 font-semibold">{b.readCount} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Pedagogical Quality Circle (AQC) */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-soft space-y-4">
                <div className="flex items-center space-x-2 text-brand-300">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Quality Circle Insights</span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  Key Strengths & Recommended Micro-Adjustments
                </h4>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <span className="text-emerald-300 font-bold block text-[11px]">Primary Strength</span>
                    <p className="text-[11px] text-slate-200">
                      98% of students praise your live interactive PostgreSQL explain-plan demos and query profiling.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                    <span className="text-amber-300 font-bold block text-[11px]">Suggested Adjustment</span>
                    <p className="text-[11px] text-slate-200">
                      Allocate 10 additional minutes during transaction isolation modules for student Q&A before moving to NoSQL.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* PUBLISH BROADCAST MODAL                                        */}
      {/* ============================================================== */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Publish Guidance to Enrolled Cohort
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcast instructional advice, exam solutions, or office hours announcements.
                </p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Course</label>
                  <select
                    value={noteCourse}
                    onChange={e => setNoteCourse(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="CSE-301">CSE-301 DBMS</option>
                    <option value="CSE-306">CSE-306 Adv DB Lab</option>
                    <option value="CSE-403">CSE-403 Cloud DBs</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="EXAM_PREP">Exam Prep & Solutions</option>
                    <option value="OFFICE_HOURS">Special Office Hours</option>
                    <option value="CURRICULUM_UPDATE">Curriculum Resource</option>
                    <option value="APPRECIATION">Cohort Appreciation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Cohort</label>
                <input
                  type="text"
                  value={noteCohort}
                  onChange={e => setNoteCohort(e.target.value)}
                  placeholder="e.g. 3rd Year CSE (Sec A & B)"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Guidance Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="e.g. Midterm 1 Walkthrough & Recommended Practice Problems"
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Message Content</label>
                <textarea
                  value={noteMessage}
                  onChange={e => setNoteMessage(e.target.value)}
                  placeholder="Write clear, supportive recommendations for the students..."
                  required
                  rows={4}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
