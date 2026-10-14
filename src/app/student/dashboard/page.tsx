'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { MultiStepBookingModal } from '@/components/booking/MultiStepBookingModal';
import { QrGatePassModal } from '@/components/permissions/QrGatePassModal';
import { EventTicketModal } from '@/components/events/EventTicketModal';
import { StatusBadge } from '@/components/common/Badge';
import { CircularProgress } from '@/components/common/CircularProgress';
import { getStudentAttendanceSummary } from '@/lib/attendanceService';
import { getStudentAcademicSummary } from '@/lib/academicService';
import { LeavePermission, EventRegistration } from '@/types';
import {
  Sparkles,
  Building2,
  CalendarCheck,
  Cpu,
  MapPin,
  Briefcase,
  BookOpen,
  Trophy,
  Globe,
  TrendingUp,
  QrCode,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Award,
  MessageSquareQuote,
  Laptop,
  ExternalLink,
  Flame,
  Ticket,
  ShieldCheck,
  Compass,
  Code,
  Users,
  Search,
  Plus,
  Filter,
  Check,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Bookmark,
  BellRing,
  HelpCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const {
    currentUser,
    bookings,
    leavePermissions,
    opportunities,
    campusEvents,
    campusClubs,
    eventRegistrations,
    progress,
    projects,
    applyToOpportunity,
    toggleSaveOpportunity,
  } = useResora();

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedLeaveForQr, setSelectedLeaveForQr] = useState<LeavePermission | null>(null);
  const [selectedEventTicket, setSelectedEventTicket] = useState<EventRegistration | null>(null);

  // Filter tabs state
  const [featureCategory, setFeatureCategory] = useState<'ALL' | 'ACADEMIC' | 'CAREER' | 'CAMPUS' | 'LEARNING'>('ALL');
  const [passesTab, setPassesTab] = useState<'ALL' | 'BOOKINGS' | 'GATE_PASSES'>('ALL');
  const [oppFilter, setOppFilter] = useState<'ALL' | 'HACKATHON' | 'INTERNSHIP' | 'FULL_TIME'>('ALL');
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Summaries
  const attendanceSummary = useMemo(() => {
    return getStudentAttendanceSummary(currentUser);
  }, [currentUser]);

  const academicSummary = useMemo(() => {
    return getStudentAcademicSummary(currentUser);
  }, [currentUser]);

  // Student specific bookings
  const studentBookings = useMemo(() => {
    return bookings.filter(
      b => b && (b.userId === currentUser?.id || (b.userName && currentUser?.name && b.userName.includes(currentUser.name.split(' ')[0])))
    );
  }, [bookings, currentUser]);

  // Student specific outpass / gate passes
  const studentLeaves = useMemo(() => {
    return leavePermissions.filter(
      l => l && (l.userId === currentUser?.id || (l.userName && currentUser?.name && l.userName.includes(currentUser.name.split(' ')[0])))
    );
  }, [leavePermissions, currentUser]);

  // Approved active gate pass (if any)
  const activeGatePass = useMemo(() => {
    return studentLeaves.find(l => l.status === 'APPROVED');
  }, [studentLeaves]);

  // Joined clubs & registered events
  const joinedClubs = useMemo(() => {
    return campusClubs.filter(c => c.isJoined);
  }, [campusClubs]);

  const studentRegistrations = useMemo(() => {
    return eventRegistrations.filter(
      r => r && (
        (r.rollNumber && currentUser?.rollNumber && r.rollNumber === currentUser.rollNumber) ||
        (r.studentName && currentUser?.name && r.studentName.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase()))
      )
    );
  }, [eventRegistrations, currentUser]);

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    if (oppFilter === 'ALL') return opportunities.slice(0, 4);
    return opportunities.filter(o => o.type === oppFilter).slice(0, 4);
  }, [opportunities, oppFilter]);

  // Handle Apply button click
  const handleApplyOpportunity = (id: string, title: string) => {
    applyToOpportunity(id);
    setAppliedToast(`Application submitted for ${title}!`);
    setTimeout(() => {
      setAppliedToast(null);
    }, 3500);
  };

  // Feature Directory Cards definition wrapped in useMemo
  const featureCards = useMemo(() => [
    {
      id: 'academics',
      title: 'Academics & Grades',
      desc: `${academicSummary.cgpa} CGPA · Clean Record · Grade Sheets`,
      icon: GraduationCap,
      href: '/student/academics',
      category: 'ACADEMIC' as const,
      gradient: 'from-blue-500 to-indigo-600',
      badge: 'Live ERP',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'attendance',
      title: 'ERP Attendance',
      desc: `${attendanceSummary.overallPercentage}% · +${attendanceSummary.safeBunksOverall} Safe Bunks (>75%)`,
      icon: UserCheck,
      href: '/student/attendance',
      category: 'ACADEMIC' as const,
      gradient: 'from-emerald-500 to-teal-600',
      badge: attendanceSummary.statusLabel,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'bookings',
      title: 'Bookings & Outpasses',
      desc: `${studentBookings.length} Bookings · ${studentLeaves.length} Passes Clearance`,
      icon: Ticket,
      href: '/student/bookings',
      category: 'CAMPUS' as const,
      gradient: 'from-amber-500 to-orange-600',
      badge: activeGatePass ? 'Pass Active' : 'Clear',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'resources',
      title: 'Campus Labs & Pods',
      desc: 'Smart reservation for 40+ Labs, GPUs & Kits',
      icon: Building2,
      href: '/student/resources',
      category: 'CAMPUS' as const,
      gradient: 'from-violet-500 to-purple-600',
      badge: 'Instant Book',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'preparation',
      title: 'Placement & DSA Prep',
      desc: '150+ LeetCode Tracks, Flashcards & Roadmaps',
      icon: Code,
      href: '/student/preparation',
      category: 'CAREER' as const,
      gradient: 'from-rose-500 to-pink-600',
      badge: `${progress.dsaScore}% Solved`,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'opportunities',
      title: 'Drives & Hackathons',
      desc: 'Smart match for Tier-1 Internships & Grants',
      icon: Trophy,
      href: '/student/opportunities',
      category: 'CAREER' as const,
      gradient: 'from-indigo-500 to-blue-600',
      badge: 'AI Matched',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'lms',
      title: 'AceIt LMS Portal',
      desc: '91.6% Completed · 14-Day Streak · Live Tracks',
      icon: Laptop,
      href: '/student/lms',
      category: 'LEARNING' as const,
      gradient: 'from-sky-500 to-cyan-600',
      badge: 'Streak 14d 🔥',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'events-clubs',
      title: 'Clubs & Campus Fests',
      desc: `${joinedClubs.length} Active Clubs · InnovateX Hackathon Pass`,
      icon: Sparkles,
      href: '/student/events-clubs',
      category: 'CAMPUS' as const,
      gradient: 'from-fuchsia-500 to-pink-600',
      badge: 'OD Sanctioned',
      badgeColor: 'bg-fuchsia-100 text-fuchsia-700',
    },
    {
      id: 'projects',
      title: 'Capstone Projects',
      desc: `${projects.length} Active Repositories · Mentored by Faculty`,
      icon: Layers,
      href: '/student/projects',
      category: 'CAREER' as const,
      gradient: 'from-teal-500 to-emerald-600',
      badge: 'Showcase',
      badgeColor: 'bg-teal-100 text-teal-700',
    },
    {
      id: 'roadmap',
      title: '4-Year Career Roadmap',
      desc: 'Semester-by-semester engineering milestones',
      icon: Compass,
      href: '/student/roadmap',
      category: 'CAREER' as const,
      gradient: 'from-blue-600 to-teal-600',
      badge: 'Year 3 Active',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'exam-prep',
      title: 'Exam Preparation & PYQs',
      desc: 'Previous Year Papers, Formula Sheets & Plan',
      icon: BookOpen,
      href: '/student/exam-preparation',
      category: 'ACADEMIC' as const,
      gradient: 'from-amber-600 to-red-600',
      badge: 'Midterms Ready',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'smart-finder',
      title: 'AI Smart Finder',
      desc: 'Natural language search for rooms, labs & mentors',
      icon: Search,
      href: '/student/smart-finder',
      category: 'CAMPUS' as const,
      gradient: 'from-purple-600 to-indigo-700',
      badge: 'AI Powered',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'progress',
      title: 'Skill Matrix & Radar',
      desc: `${progress.overallReadiness}% Overall Placement Readiness Index`,
      icon: TrendingUp,
      href: '/student/progress',
      category: 'CAREER' as const,
      gradient: 'from-cyan-600 to-blue-700',
      badge: 'Top 10%',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'feedback',
      title: 'Feedback & Surveys',
      desc: 'Course surveys, faculty ratings & campus NPS',
      icon: MessageSquareQuote,
      href: '/student/feedback',
      category: 'LEARNING' as const,
      gradient: 'from-rose-500 to-orange-500',
      badge: 'Anonymous',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
  ], [
    academicSummary,
    attendanceSummary,
    studentBookings,
    studentLeaves,
    activeGatePass,
    progress,
    joinedClubs,
    projects,
  ]);

  const visibleFeatureCards = useMemo(() => {
    if (featureCategory === 'ALL') return featureCards;
    return featureCards.filter(c => c.category === featureCategory);
  }, [featureCards, featureCategory]);

  // Today's Live Class Schedule
  const todayClasses = [
    {
      id: 'c1',
      code: 'CS301',
      name: 'Advanced Database Systems',
      time: '09:00 AM – 10:30 AM',
      room: 'Block B · Room 302',
      faculty: 'Dr. S. Rao',
      status: 'COMPLETED',
      type: 'Lecture',
    },
    {
      id: 'c2',
      code: 'CS304L',
      name: 'Operating Systems Kernel Lab',
      time: '11:00 AM – 12:45 PM',
      room: 'Computing Complex · Lab 4',
      faculty: 'Prof. K. Ananth',
      status: 'IN_PROGRESS',
      type: 'Lab Practice',
    },
    {
      id: 'c3',
      code: 'CS308',
      name: 'Computer Networks & Security',
      time: '01:30 PM – 03:00 PM',
      room: 'Seminar Hall 2',
      faculty: 'Dr. Malini Iyer',
      status: 'UPCOMING',
      type: 'Lecture',
    },
    {
      id: 'c4',
      code: 'GDSC',
      name: 'Cloud Study Jam & Solution Challenge',
      time: '04:00 PM – 05:30 PM',
      room: 'Innovation Hub Room 302',
      faculty: 'GDSC Core Team',
      status: 'UPCOMING',
      type: 'Club Meetup',
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {appliedToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold">{appliedToast}</span>
            </div>
          )}

          {/* Real-time Campus Announcement Ticker */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-3 sm:p-3.5 text-white flex flex-wrap items-center justify-between gap-3 shadow-md border border-indigo-700/40">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 shrink-0">
                Live Campus ERP
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">|</span>
              <p className="text-xs text-slate-200 truncate">
                <span className="font-semibold text-white">InnovateX 2026:</span> Flagship 36-Hr National Hackathon (Sanctioned 2-Day OD) is fast filling. Registrations close Oct 20!
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Link
                href="/student/events-clubs"
                className="px-3 py-1 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-indigo-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
              >
                <span>View Hackathon</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Hero Identity & Command Banner */}
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.35)] border border-blue-400/30">
            {/* Background geometric accents */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:18px_18px] opacity-20 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
                    B.Tech CSE · Semester {academicSummary.currentSemester} · Section B
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Roll: {currentUser?.rollNumber || 'CSE-2023-042'}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
                  {greeting}, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Student'}! 👋
                </h1>

                <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
                  Welcome to your Resora Campus Command Center. Access your live ERP biometric attendance, academic grades, AceIt LMS tracks, lab bookings, and digital outpass clearances in one unified portal.
                </p>

                {/* Micro Metric Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center space-x-1.5 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300">CGPA:</span>
                    <span className="font-bold text-white">{academicSummary.cgpa} / 10.0</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">ERP Attendance:</span>
                    <span className="font-bold text-white">{attendanceSummary.overallPercentage}%</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-slate-300">LMS Streak:</span>
                    <span className="font-bold text-white">14 Days 🔥</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-black/25 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">Placement Ready:</span>
                    <span className="font-bold text-white">{progress.overallReadiness}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4 text-brand-600" />
                  <span>Quick Book Space</span>
                </button>

                {activeGatePass ? (
                  <button
                    onClick={() => setSelectedLeaveForQr(activeGatePass)}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Gate Pass QR</span>
                  </button>
                ) : (
                  <Link
                    href="/student/bookings"
                    className="px-5 py-3 bg-brand-500/80 hover:bg-brand-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all hover:scale-105 active:scale-95 border border-white/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Apply Outpass</span>
                  </Link>
                )}

                <Link
                  href="/student/smart-finder"
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20"
                  title="Open AI Smart Finder"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* 6 Key Performance Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* 1. Academic Performance */}
            <Link
              href="/student/academics"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Sem {academicSummary.currentSemester}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academics</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {academicSummary.cgpa} <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  0 Active Backlogs (Clean)
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{academicSummary.totalCreditsEarned} / {academicSummary.totalCreditsRequired} Credits</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 2. ERP Biometric Attendance */}
            <Link
              href="/student/attendance"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Live ERP
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {attendanceSummary.overallPercentage}%
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  +{attendanceSummary.safeBunksOverall} Bunks Safe (&gt;75%)
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{attendanceSummary.totalAttended}/{attendanceSummary.totalConducted} Attended</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 3. Placement Readiness */}
            <Link
              href="/student/preparation"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Tier-1 Ready
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Readiness</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {progress.overallReadiness}%
                </p>
                <p className="text-[11px] text-purple-600 font-semibold mt-1">
                  DSA: {progress.dsaScore}% · Aptitude: {progress.aptitudeScore}%
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Coding Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 4. AceIt LMS Portal */}
            <Link
              href="/student/lms"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    AceIt LMS
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coursework</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  91.6%
                </p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-1">
                  11 of 12 Submitted
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Flame className="w-3.5 h-3.5" /> 14 Days Active
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 5. Campus Bookings & Passes */}
            <Link
              href="/student/bookings"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {studentBookings.length + studentLeaves.length} Active
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passes & Labs</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {studentBookings.length} <span className="text-xs text-slate-400 font-normal">Labs</span>
                </p>
                <p className="text-[11px] text-amber-700 font-semibold mt-1">
                  {activeGatePass ? 'Gate Pass OUT-8941 Active' : 'No active gate pass'}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>View Clearance</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 6. Clubs & Hackathons */}
            <Link
              href="/student/events-clubs"
              className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    GDSC + Robo
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Life</h3>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {joinedClubs.length} <span className="text-xs text-slate-400 font-normal">Clubs</span>
                </p>
                <p className="text-[11px] text-pink-600 font-semibold mt-1">
                  1 Registered Event Pass
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Fests & Clubs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>

          {/* Quick Feature Navigation Hub (All Student Modules) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                    Campus Feature Hub
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    14 Portals
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct shortcuts to all specialized tools and student services
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs">
                {(['ALL', 'ACADEMIC', 'CAREER', 'CAMPUS', 'LEARNING'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFeatureCategory(tab)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                      featureCategory === tab
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'ALL'
                      ? 'All'
                      : tab === 'ACADEMIC'
                      ? 'Academics & Exams'
                      : tab === 'CAREER'
                      ? 'Career & Prep'
                      : tab === 'CAMPUS'
                      ? 'Campus & Passes'
                      : 'Learning & LMS'}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
              {visibleFeatureCards.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-brand-300 bg-slate-50/50 hover:bg-white hover:shadow-card hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>

                    <div className="mt-3 flex items-center text-[10px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Launch Portal</span>
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Live Agenda, Passes & Bookings, Opportunities */}
            <div className="lg:col-span-2 space-y-8">
              {/* Today's Class Schedule & Live Routine */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base font-heading">
                        Today&apos;s Class Routine & Sessions
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Semester 5
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Timetable synchronized with Live ERP biometric verification
                    </p>
                  </div>
                  <Link
                    href="/student/attendance"
                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Attendance ERP →</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {todayClasses.map(cls => (
                    <div
                      key={cls.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                        cls.status === 'IN_PROGRESS'
                          ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-500/30'
                          : cls.status === 'COMPLETED'
                          ? 'border-slate-200 bg-slate-50/50 opacity-80'
                          : 'border-slate-200 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            cls.status === 'IN_PROGRESS'
                              ? 'bg-brand-600 text-white shadow-md'
                              : cls.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cls.code.replace('CS', '')}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{cls.name}</h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                cls.status === 'IN_PROGRESS'
                                  ? 'bg-brand-100 text-brand-700 animate-pulse'
                                  : cls.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {cls.status === 'IN_PROGRESS'
                                ? 'Ongoing'
                                : cls.status === 'COMPLETED'
                                ? 'Attended'
                                : 'Upcoming'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cls.time}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cls.room}</span>
                            </span>
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cls.faculty}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {cls.status === 'IN_PROGRESS' ? (
                          <span className="px-3 py-1.5 bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            <span>In Session</span>
                          </span>
                        ) : cls.status === 'COMPLETED' ? (
                          <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Marked Present</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Starts {cls.time.split('–')[0].trim()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Bookings & Digital Gate Passes Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base font-heading">
                        My Bookings & Gate Passes
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        {studentBookings.length + studentLeaves.length} Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lab reservations, hardware kits & campus outpass clearances
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Filter Segmented Control */}
                    <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setPassesTab('ALL')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          passesTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setPassesTab('BOOKINGS')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          passesTab === 'BOOKINGS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Labs ({studentBookings.length})
                      </button>
                      <button
                        onClick={() => setPassesTab('GATE_PASSES')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          passesTab === 'GATE_PASSES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Passes ({studentLeaves.length})
                      </button>
                    </div>

                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-xl transition-colors border border-brand-200"
                      title="New Booking"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Gate Passes (Shown if tab is ALL or GATE_PASSES) */}
                  {(passesTab === 'ALL' || passesTab === 'GATE_PASSES') &&
                    studentLeaves.map(leave => (
                      <div
                        key={leave.id}
                        className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 flex flex-wrap items-center justify-between gap-4 hover:bg-amber-50/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                Campus Gate Pass: {leave.passCode}
                              </h4>
                              <StatusBadge status={leave.status} />
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {leave.leaveTypeLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {leave.destination} · Departure: {leave.departureTime} ({leave.date})
                            </p>
                            {leave.approvedByFacultyName && (
                              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                ✓ Authorized by {leave.approvedByFacultyName} · Valid: {leave.validGate || 'Main Gate'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {leave.status === 'APPROVED' ? (
                            <button
                              onClick={() => setSelectedLeaveForQr(leave)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>View QR Gate Pass</span>
                            </button>
                          ) : (
                            <span className="text-xs text-amber-700 italic font-medium">
                              Awaiting Faculty Approval
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Resource Bookings (Shown if tab is ALL or BOOKINGS) */}
                  {(passesTab === 'ALL' || passesTab === 'BOOKINGS') &&
                    studentBookings.map(b => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{b.resourceName}</h4>
                              <StatusBadge status={b.status} />
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {b.purpose}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {b.date === new Date().toISOString().split('T')[0] ? 'Today' : b.date},{' '}
                              {b.startTime} – {b.endTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href="/student/bookings"
                            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm flex items-center space-x-1"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Need lab equipment or leave permission?</span>
                  <Link href="/student/bookings" className="font-bold text-brand-600 hover:underline">
                    Open Bookings & Pass Management →
                  </Link>
                </div>
              </div>

              {/* Opportunities & Campus Drives Section */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base font-heading">
                        Recommended Opportunities & Drives
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        AI Matched
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hackathons, research fellowships & internships tailored for your CGPA ({academicSummary.cgpa})
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    {(['ALL', 'HACKATHON', 'INTERNSHIP'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setOppFilter(f)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          oppFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        {f === 'ALL' ? 'All' : f === 'HACKATHON' ? 'Hackathons' : 'Internships'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  {filteredOpportunities.map(opp => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-300 hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                              {opp.title}
                            </h4>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              {opp.type}
                            </span>
                            {((opp.recommendations && opp.recommendations.length > 0) || opp.isFeatured) && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                <span>Faculty Recommended</span>
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1">
                            {opp.organization} · Deadline: <span className="font-semibold text-slate-700">{opp.deadline}</span>
                          </p>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {opp.tags.slice(0, 4).map(t => (
                              <span
                                key={t}
                                className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => toggleSaveOpportunity(opp.id)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
                          title="Save opportunity"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleApplyOpportunity(opp.id, opp.title)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-brand-600 hover:bg-brand-700 text-white shadow-sm flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Explore full database of 50+ campus drives and off-campus roles</span>
                  <Link href="/student/opportunities" className="font-bold text-brand-600 hover:underline">
                    View All Opportunities →
                  </Link>
                </div>
              </div>

              {/* Campus Clubs & Registered Event Passes Spotlight */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base font-heading">
                        Campus Clubs & Registered Events
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                        {joinedClubs.length} Joined
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your registered event tickets, on-duty passes & club activities
                    </p>
                  </div>
                  <Link href="/student/events-clubs" className="text-xs font-bold text-brand-600 hover:underline">
                    Explore Clubs & Fests →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Ticket Card */}
                  {studentRegistrations.length > 0 ? (
                    studentRegistrations.slice(0, 1).map(reg => (
                      <div
                        key={reg.id}
                        className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden border border-indigo-700/50 shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-2">
                            <span className="flex items-center gap-1">
                              <Ticket className="w-3.5 h-3.5" />
                              <span>Registered Pass</span>
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                              OD Approved
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug">{reg.eventTitle}</h4>
                          <p className="text-[11px] text-slate-300 mt-1">
                            {reg.date} · {reg.venue}
                          </p>
                          <div className="mt-2.5 inline-block text-[10px] font-mono bg-black/40 px-2.5 py-1 rounded-lg text-indigo-200 border border-white/10">
                            Ticket: {reg.ticketCode}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Host: {reg.clubName}</span>
                          <button
                            onClick={() => setSelectedEventTicket(reg)}
                            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View Ticket QR</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-center text-xs text-slate-500">
                      No active event registrations yet
                    </div>
                  )}

                  {/* Joined Club Spotlight */}
                  {joinedClubs.slice(0, 1).map(club => (
                    <div
                      key={club.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-pink-300 hover:shadow-card transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                            {club.shortCode}
                          </span>
                          <span className="text-xs font-bold text-amber-600">★ {club.rating}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{club.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{club.tagline}</p>
                        <div className="mt-2 text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded-lg inline-block">
                          Role: {club.userRole || 'Active Member'}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Meetup: {club.regularMeetup.frequency.split(' ')[0]}
                        </span>
                        <Link
                          href="/student/events-clubs"
                          className="font-bold text-pink-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Club Hub →</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Academic Record, ERP Attendance, AceIt LMS, Placement Readiness */}
            <div className="space-y-6">
              {/* Academic Performance Snapshot Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">Academic Record</h3>
                    <p className="text-xs text-slate-500">CGPA, SGPA & Arrear Status</p>
                  </div>
                  <Link href="/student/academics" className="text-xs font-bold text-brand-600 hover:underline">
                    View All →
                  </Link>
                </div>

                {/* CGPA Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white relative overflow-hidden border border-blue-400/40 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                        Cumulative GPA
                      </span>
                      <p className="text-3xl font-extrabold font-heading mt-0.5">
                        {academicSummary.cgpa} <span className="text-xs text-slate-300 font-normal">/ 10.0</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Sem {academicSummary.currentSemester}: 8.85 SGPA</span>
                    </span>
                  </div>

                  <div className="mt-3 w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 transition-all duration-500"
                      style={{ width: `${Math.min((academicSummary.cgpa / 10) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-200 font-medium">
                    <span>
                      {academicSummary.totalCreditsEarned} / {academicSummary.totalCreditsRequired} Credits Earned
                    </span>
                    <span className="text-emerald-300 font-bold">
                      {academicSummary.activeBacklogs === 0
                        ? '0 Backlogs (Clean)'
                        : `${academicSummary.activeBacklogs} Active Arrears`}
                    </span>
                  </div>
                </div>

                {/* Quick Subject Highlights */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Current Courses</span>
                    <span>Grade / Marks</span>
                  </div>
                  {academicSummary.subjects.slice(0, 4).map(s => (
                    <div key={s.courseCode} className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold truncate max-w-[160px]">
                        {s.courseCode} {s.courseName.split(' ')[0]}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 text-xs">{s.totalMarks}%</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            s.gradeLetter === 'O'
                              ? 'bg-purple-100 text-purple-700'
                              : s.gradeLetter === 'A+'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.gradeLetter} ({s.gradePoint} GP)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/student/academics"
                  className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-blue-200/60"
                >
                  <span>Open Full Academic Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Class Attendance Snapshot Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">ERP Attendance</h3>
                    <p className="text-xs text-slate-500">Live biometric verification</p>
                  </div>
                  <Link href="/student/attendance" className="text-xs font-bold text-brand-600 hover:underline">
                    View All →
                  </Link>
                </div>

                {/* Overall Attendance Circular Gauge Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white relative overflow-hidden border border-emerald-400/40 shadow-md flex items-center justify-between gap-4">
                  <div className="shrink-0">
                    <CircularProgress
                      value={attendanceSummary.overallPercentage}
                      size={88}
                      strokeWidth={8}
                      trackColor="#1E293B"
                      valueColor="text-white"
                      gradientColors={
                        attendanceSummary.overallPercentage >= 85
                          ? ['#10B981', '#14B8A6']
                          : attendanceSummary.overallPercentage >= 75
                          ? ['#38BDF8', '#3B82F6']
                          : ['#F59E0B', '#F97316']
                      }
                      subText="Attended"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider">
                        Live ERP Status
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                        {attendanceSummary.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      <span className="text-white font-bold text-sm">{attendanceSummary.totalAttended}</span> of{' '}
                      {attendanceSummary.totalConducted} Classes Attended
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-emerald-300 font-bold truncate">
                        {attendanceSummary.safeBunksOverall > 0
                          ? `+${attendanceSummary.safeBunksOverall} Bunks Safe (>75%)`
                          : 'Attendance Critical'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject Breakdown Mini List */}
                <div className="mt-4 space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject-Wise Breakdown
                  </span>
                  {attendanceSummary.courses.slice(0, 4).map(c => (
                    <div key={c.courseCode} className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold truncate max-w-[150px]">
                        {c.courseCode} {c.courseName.split(' ')[0]}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-400">
                          {c.attended}/{c.total}
                        </span>
                        <span
                          className={`font-bold text-xs ${
                            c.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {c.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/student/attendance"
                  className="mt-4 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-emerald-200/60"
                >
                  <span>Open Full Attendance Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* AceIt LMS Portal Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base font-heading">AceIt LMS Portal</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        lms.ilifeaceit.com
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Course modules, assignments & coding tracks</p>
                  </div>
                  <Link href="/student/lms" className="text-xs font-bold text-indigo-600 hover:underline">
                    View All →
                  </Link>
                </div>

                {/* LMS Highlights Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white relative overflow-hidden border border-purple-400/40 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                        Assignment Completion
                      </span>
                      <p className="text-2xl font-extrabold font-heading mt-0.5">91.6%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-300 block">Learning Streak</span>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1 justify-end">
                        <Flame className="w-3.5 h-3.5" /> 14 Days Active
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-emerald-300 transition-all duration-500"
                      style={{ width: '91.6%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-200 font-medium">
                    <span>11 of 12 Submitted</span>
                    <span className="text-amber-200 font-bold">1 Overdue (OS Lab)</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  <Link
                    href="/student/lms"
                    className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200/60"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Open LMS Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href="https://lms.ilifeaceit.com/student-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
                    title="Open Live lms.ilifeaceit.com in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Placement Readiness & Daily Coding Progress Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center">
                <div className="flex items-center justify-between mb-4 text-left">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-heading">Your Readiness</h3>
                    <p className="text-xs text-slate-500">Tier-1 Engineering Placement Evaluation</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                    Top 10%
                  </span>
                </div>

                {/* Circular Gauge */}
                <div className="relative mx-auto flex items-center justify-center my-2">
                  <CircularProgress
                    value={progress.overallReadiness}
                    size={140}
                    strokeWidth={10}
                    trackColor="#F1F5F9"
                    gradientColors={['#2563EB', '#06B6D4']}
                    valueColor="text-slate-900"
                    subText="Readiness"
                  />
                </div>

                {/* Progress Breakdown */}
                <div className="mt-5 space-y-2.5 text-left text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">DSA & Algorithms</span>
                      <span className="text-slate-900 font-bold">{progress.dsaScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress.dsaScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">Aptitude & Logical</span>
                      <span className="text-slate-900 font-bold">{progress.aptitudeScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress.aptitudeScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">CS Fundamentals</span>
                      <span className="text-slate-900 font-bold">{progress.csFundamentalsScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progress.csFundamentalsScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">Capstone Projects</span>
                      <span className="text-slate-900 font-bold">{progress.projectsScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress.projectsScore}%` }} />
                    </div>
                  </div>
                </div>

                <Link
                  href="/student/preparation"
                  className="mt-6 w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all border border-brand-200/60"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Solve Today&apos;s Coding Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      <MultiStepBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* QR Gate Pass Modal */}
      <QrGatePassModal
        isOpen={!!selectedLeaveForQr}
        onClose={() => setSelectedLeaveForQr(null)}
        leave={selectedLeaveForQr}
      />

      {/* Event Ticket QR Modal */}
      <EventTicketModal
        isOpen={!!selectedEventTicket}
        onClose={() => setSelectedEventTicket(null)}
        registration={selectedEventTicket}
      />
    </div>
  );
}
