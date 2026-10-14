'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import {
  getStudentCourseSurveys,
  submitCourseSurvey,
  getCampusFacilitiesFeedback,
  rateCampusFacility,
  getFacultyBroadcastNotes,
  CourseFacultyFeedback,
  CampusFacilityItem,
  FacultyBroadcastNote,
  FacultyEvaluationCriterion,
} from '@/lib/feedbackService';
import {
  Star,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ThumbsUp,
  AlertCircle,
  Building2,
  Send,
  Eye,
  EyeOff,
  Filter,
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  HelpCircle,
  Radio,
  FileCheck,
  Bell,
  Cpu,
  Wifi,
  Coffee,
  Bookmark,
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

const SUGGESTED_SENTIMENT_CHIPS = [
  'Clear Explanations',
  'Industry Relevant',
  'Engaging Problem Sets',
  'Helpful Doubt Clearing',
  'Prompt Feedback',
  'Great Live Demos',
  'Balanced Pace',
  'Accessible Mentor',
  'Challenging Exams',
  'Well Structured Slides',
];

export default function StudentFeedbackPage() {
  const { currentUser } = useResora();

  // Tab State
  const [activeTab, setActiveTab] = useState<'FACULTY' | 'CAMPUS' | 'BROADCASTS' | 'ANALYTICS'>('FACULTY');

  // Surveys state
  const [surveys, setSurveys] = useState<CourseFacultyFeedback[]>(() => getStudentCourseSurveys());
  const [facilities, setFacilities] = useState<CampusFacilityItem[]>(() => getCampusFacilitiesFeedback());
  const [broadcastNotes, setBroadcastNotes] = useState<FacultyBroadcastNote[]>(() => getFacultyBroadcastNotes());

  // Survey Modal / Drawer State
  const [activeSurveyModal, setActiveSurveyModal] = useState<CourseFacultyFeedback | null>(null);
  const [ratingPedagogy, setRatingPedagogy] = useState<number>(5);
  const [ratingAccessibility, setRatingAccessibility] = useState<number>(5);
  const [ratingCoursePace, setRatingCoursePace] = useState<number>(4);
  const [ratingLabRelevance, setRatingLabRelevance] = useState<number>(5);
  const [ratingFairness, setRatingFairness] = useState<number>(5);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [qualitativeComment, setQualitativeComment] = useState<string>('');
  const [isAnonymousSubmission, setIsAnonymousSubmission] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Facility quick filter
  const [facilityCategory, setFacilityCategory] = useState<string>('ALL');

  // Computed survey stats
  const totalSurveys = surveys.length;
  const submittedSurveys = surveys.filter(s => s.status === 'SUBMITTED');
  const pendingSurveys = surveys.filter(s => s.status === 'PENDING');
  const completionPercentage = Math.round((submittedSurveys.length / totalSurveys) * 100);

  // Handlers
  const handleOpenSurvey = (survey: CourseFacultyFeedback) => {
    setActiveSurveyModal(survey);
    if (survey.ratings) {
      setRatingPedagogy(survey.ratings.pedagogy);
      setRatingAccessibility(survey.ratings.accessibility);
      setRatingCoursePace(survey.ratings.coursePace);
      setRatingLabRelevance(survey.ratings.labRelevance);
      setRatingFairness(survey.ratings.evaluationFairness);
      setSelectedChips(survey.sentimentTags || []);
      setQualitativeComment(survey.comment || '');
      setIsAnonymousSubmission(survey.isAnonymous);
    } else {
      setRatingPedagogy(5);
      setRatingAccessibility(5);
      setRatingCoursePace(4);
      setRatingLabRelevance(5);
      setRatingFairness(5);
      setSelectedChips([]);
      setQualitativeComment('');
      setIsAnonymousSubmission(true);
    }
  };

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyModal) return;

    const payload = {
      ratings: {
        pedagogy: ratingPedagogy,
        accessibility: ratingAccessibility,
        coursePace: ratingCoursePace,
        labRelevance: ratingLabRelevance,
        evaluationFairness: ratingFairness,
      },
      sentimentTags: selectedChips,
      comment: qualitativeComment,
      isAnonymous: isAnonymousSubmission,
    };

    const updated = submitCourseSurvey(activeSurveyModal.id, payload);
    setSurveys(updated);
    setActiveSurveyModal(null);
    setToastMessage(`Evaluation for ${activeSurveyModal.courseCode} (${activeSurveyModal.instructorName}) successfully submitted!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFacilityRate = (facilityId: string, rating: number) => {
    const updated = rateCampusFacility(facilityId, rating);
    setFacilities(updated);
    setToastMessage('Thank you! Your facility satisfaction rating has been recorded.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Facility filter
  const filteredFacilities = useMemo(() => {
    if (facilityCategory === 'ALL') return facilities;
    return facilities.filter(f => f.category === facilityCategory);
  }, [facilities, facilityCategory]);

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

          {/* Hero Banner with Anonymity Guarantee & KPI Strip */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card border border-slate-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  <span>NAAC / NBA Institutional Feedback Cycle 2026</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  Student Satisfaction & Faculty Evaluations
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your constructive feedback directly shapes pedagogical quality, curriculum delivery, and campus infrastructure upgrades.
                </p>
                <div className="pt-1 flex items-center space-x-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Submissions are strictly cryptographically anonymized by default.</span>
                </div>
              </div>

              {/* Progress Ring / KPI Card */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[200px] space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
                  Evaluation Progress
                </span>
                <div className="text-3xl font-extrabold font-heading text-white">
                  {submittedSurveys.length} <span className="text-sm font-normal text-slate-400">/ {totalSurveys}</span>
                </div>
                <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-brand-400 rounded-full transition-all duration-700"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-[11px] text-emerald-300 font-semibold block">
                  {pendingSurveys.length === 0 ? 'All Evaluations Complete 🎉' : `${pendingSurveys.length} Surveys Pending`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Surveys</span>
              <p className="text-xl font-extrabold text-amber-600 font-heading mt-1">{pendingSurveys.length}</p>
              <span className="text-[10px] text-slate-500">Requires your input</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
              <p className="text-xl font-extrabold text-emerald-600 font-heading mt-1">{submittedSurveys.length}</p>
              <span className="text-[10px] text-slate-500">Recorded & anonymized</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Facilities</span>
              <p className="text-xl font-extrabold text-brand-600 font-heading mt-1">{facilities.length} Areas</p>
              <span className="text-[10px] text-slate-500">Avg 4.4 ★ satisfaction</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Broadcasts</span>
              <p className="text-xl font-extrabold text-indigo-600 font-heading mt-1">{broadcastNotes.length} Updates</p>
              <span className="text-[10px] text-slate-500">Action items from faculty</span>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex border-b border-slate-200 space-x-1 sm:space-x-3 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('FACULTY')}
              className={`py-3 px-4 border-b-2 rounded-t-lg transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'FACULTY'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Course & Faculty Evaluations</span>
              {pendingSurveys.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px]">
                  {pendingSurveys.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('CAMPUS')}
              className={`py-3 px-4 border-b-2 rounded-t-lg transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'CAMPUS'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus & Infrastructure Satisfaction</span>
            </button>

            <button
              onClick={() => setActiveTab('BROADCASTS')}
              className={`py-3 px-4 border-b-2 rounded-t-lg transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'BROADCASTS'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Faculty Feedback & Advice</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px]">
                {broadcastNotes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`py-3 px-4 border-b-2 rounded-t-lg transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'ANALYTICS'
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Satisfaction Metrics (CSAT)</span>
            </button>
          </div>

          {/* ========================================================== */}
          {/* TAB 1: COURSE & FACULTY TEACHING EVALUATIONS               */}
          {/* ========================================================== */}
          {activeTab === 'FACULTY' && (
            <div className="space-y-6">
              {/* Pending Evaluations Section */}
              {pendingSurveys.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        Action Required: Pending Course Evaluations
                      </h3>
                      <p className="text-xs text-slate-500">
                        Please evaluate the pedagogical and practical delivery for this semester.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      {pendingSurveys.length} surveys waiting
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingSurveys.map(survey => (
                      <div
                        key={survey.id}
                        className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {survey.courseCode} · Sem {survey.semester}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{survey.credits} Credits</span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {survey.courseName}
                          </h4>

                          <div className="flex items-center space-x-3 pt-1">
                            <img
                              src={survey.instructorAvatar}
                              alt={survey.instructorName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{survey.instructorName}</p>
                              <p className="text-[10px] text-slate-400">{survey.instructorTitle}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenSurvey(survey)}
                          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Evaluate Faculty Now</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Evaluations Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-heading">
                      Submitted Evaluations & Feedback Receipts
                    </h3>
                    <p className="text-xs text-slate-500">
                      Your completed evaluations stored with verifiable encryption.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {submittedSurveys.length} Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submittedSurveys.map(survey => (
                    <div
                      key={survey.id}
                      className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={survey.instructorAvatar}
                            alt={survey.instructorName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-mono font-bold text-brand-600">{survey.courseCode}</span>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">{survey.courseName}</h4>
                            <p className="text-[11px] text-slate-500">{survey.instructorName}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                            <span>{survey.overallScore} / 5.0</span>
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Submitted {survey.submittedAt}</span>
                        </div>
                      </div>

                      {/* Dimension Ratings Mini-Grid */}
                      {survey.ratings && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-[10px]">
                          <div>
                            <span className="text-slate-400 block">Clarity & Pedagogy</span>
                            <span className="font-bold text-slate-800">{survey.ratings.pedagogy} ★</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Doubt Solving</span>
                            <span className="font-bold text-slate-800">{survey.ratings.accessibility} ★</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Course Pace</span>
                            <span className="font-bold text-slate-800">{survey.ratings.coursePace} ★</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Lab Relevance</span>
                            <span className="font-bold text-slate-800">{survey.ratings.labRelevance} ★</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Fair Evaluation</span>
                            <span className="font-bold text-slate-800">{survey.ratings.evaluationFairness} ★</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Privacy</span>
                            <span className="font-bold text-emerald-700">{survey.isAnonymous ? 'Anonymous' : 'Attributed'}</span>
                          </div>
                        </div>
                      )}

                      {/* Sentiment Tags */}
                      {survey.sentimentTags && survey.sentimentTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {survey.sentimentTags.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Qualitative Comment */}
                      {survey.comment && (
                        <p className="text-xs text-slate-600 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          &ldquo;{survey.comment}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Recorded in Department Audit</span>
                        </span>
                        <button
                          onClick={() => handleOpenSurvey(survey)}
                          className="text-brand-600 font-bold hover:underline"
                        >
                          Edit Evaluation →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: CAMPUS & INFRASTRUCTURE SATISFACTION                */}
          {/* ========================================================== */}
          {activeTab === 'CAMPUS' && (
            <div className="space-y-6">
              {/* Category Filter Pills */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Type:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'LABS', 'LIBRARY', 'WIFI', 'CANTEEN', 'STUDY_PODS', 'SPORTS'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFacilityCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          facilityCategory === cat
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Areas' : cat.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  Showing {filteredFacilities.length} campus touchpoints
                </span>
              </div>

              {/* Facilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFacilities.map(f => (
                  <div
                    key={f.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                          {f.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{f.totalVotes} student reviews</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{f.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{f.location}</p>
                      </div>

                      {/* Current Satisfaction Index */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Campus Rating</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-lg font-black text-slate-900 font-heading">{f.averageRating}</span>
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${star <= Math.round(f.averageRating) ? 'fill-amber-400' : 'text-slate-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            f.satisfactionStatus === 'EXCELLENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.satisfactionStatus.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Highlight & Recent Action */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <p className="text-[11px] leading-relaxed">
                          <strong className="text-slate-800">Highlight:</strong> {f.keyHighlight}
                        </p>
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[10px] text-blue-900">
                          <strong>Recent Upgrade Action:</strong> {f.recentActionTaken}
                        </div>
                      </div>
                    </div>

                    {/* Quick Student Rating Input */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          {f.userRating ? `Your Rating: ${f.userRating} ★` : 'Rate this facility:'}
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleFacilityRate(f.id, star)}
                              className="p-1 hover:scale-125 transition-transform"
                              title={`Rate ${star} Stars`}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= (f.userRating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 hover:text-amber-400'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: FACULTY FEEDBACK & ADVICE TO STUDENTS               */}
          {/* ========================================================== */}
          {activeTab === 'BROADCASTS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Cohort Guidance & Action Items from Faculty
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct instructional responses and study suggestions posted based on recent academic evaluations.
                  </p>
                </div>
                <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-bold">
                  {broadcastNotes.length} Announcements
                </span>
              </div>

              <div className="space-y-4">
                {broadcastNotes.map(note => (
                  <div
                    key={note.id}
                    className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                          {note.courseCode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{note.instructorName}</span>
                        <span className="text-[10px] text-slate-400">· {note.targetCohort}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                        <span>Posted on {note.createdAt}</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {note.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 font-heading">{note.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {note.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">{note.readCount} students have viewed this guide</span>
                      <Link
                        href="/student/academics"
                        className="text-brand-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <span>Check Course Marks & Materials</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 4: SATISFACTION METRICS & CSAT BENCHMARKS             */}
          {/* ========================================================== */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Institutional CSAT Index
                  </span>
                  <p className="text-3xl font-black text-slate-900 font-heading">4.68 / 5.0</p>
                  <p className="text-xs text-emerald-600 font-bold">93.6% Positive Student Rating</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Course Survey Participation
                  </span>
                  <p className="text-3xl font-black text-slate-900 font-heading">{completionPercentage}%</p>
                  <p className="text-xs text-brand-600 font-bold">
                    {submittedSurveys.length} of {totalSurveys} courses evaluated
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Institutional Quality Standard
                  </span>
                  <p className="text-3xl font-black text-emerald-600 font-heading">A++ Grade</p>
                  <p className="text-xs text-slate-500">NAAC / NBA Accreditation Benchmark</p>
                </div>
              </div>

              {/* Chart: Dimension Scores Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-heading">
                    Pedagogical Dimensions Average Ratings (5.0 Scale)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aggregated across all 5 enrolled academic courses
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { dimension: 'Pedagogy & Clarity', score: 4.85 },
                        { dimension: 'Doubt Accessibility', score: 4.80 },
                        { dimension: 'Course Pace', score: 4.52 },
                        { dimension: 'Lab Practical', score: 4.88 },
                        { dimension: 'Fair Evaluation', score: 4.76 },
                      ]}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
                      <XAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="score" fill="#2563EB" radius={[8, 8, 0, 0]}>
                        {[4.85, 4.80, 4.52, 4.88, 4.76].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 3 ? '#10B981' : index === 2 ? '#6366F1' : '#2563EB'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* EVALUATION SUBMISSION MODAL / SLIDE DRAWER                     */}
      {/* ============================================================== */}
      {activeSurveyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <img
                  src={activeSurveyModal.instructorAvatar}
                  alt={activeSurveyModal.instructorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-100 text-brand-800">
                      {activeSurveyModal.courseCode}
                    </span>
                    <span className="text-xs text-slate-500">Sem {activeSurveyModal.semester}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base font-heading">
                    {activeSurveyModal.courseName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Instructor: {activeSurveyModal.instructorName} ({activeSurveyModal.instructorTitle})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSurveyModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitSurvey} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Anonymity Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submissions are strictly confidential & encrypted.</span>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAnonymousSubmission}
                    onChange={e => setIsAnonymousSubmission(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Submit Anonymously</span>
                </label>
              </div>

              {/* 5 Core Evaluation Dimensions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                  Pedagogical Evaluation Criteria (1 to 5 Stars)
                </h4>

                {/* Pedagogy */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="text-xs font-bold text-slate-800 block">1. Conceptual Clarity & Pedagogy</span>
                    <p className="text-[10px] text-slate-400">Teaching effectiveness, clear explanations & structured lectures.</p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingPedagogy(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingPedagogy ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="text-xs font-bold text-slate-800 block">2. Doubt Solving & Mentorship Accessibility</span>
                    <p className="text-[10px] text-slate-400">Availability during office hours, patience in resolving questions.</p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingAccessibility(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingAccessibility ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Pace */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="text-xs font-bold text-slate-800 block">3. Course Pace & Syllabus Coverage</span>
                    <p className="text-[10px] text-slate-400">Balanced delivery, neither too rushed nor lagging behind schedule.</p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingCoursePace(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingCoursePace ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lab Relevance */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="text-xs font-bold text-slate-800 block">4. Practical & Lab Demonstrations</span>
                    <p className="text-[10px] text-slate-400">Industry-aligned coding assignments, practical lab relevance.</p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingLabRelevance(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingLabRelevance ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fairness in Evaluation */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="text-xs font-bold text-slate-800 block">5. Evaluation Fairness & Transparency</span>
                    <p className="text-[10px] text-slate-400">Clarity of rubrics, unbiased internal marks & midterm feedback.</p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingFairness(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= ratingFairness ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Select Descriptive Feedback Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SENTIMENT_CHIPS.map(chip => {
                    const isSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Comment */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  Constructive Comments & Suggestions:
                </span>
                <textarea
                  value={qualitativeComment}
                  onChange={e => setQualitativeComment(e.target.value)}
                  placeholder="Share specific examples of what went well or what could be improved in future lecture series..."
                  rows={3}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSurveyModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center space-x-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Evaluation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
