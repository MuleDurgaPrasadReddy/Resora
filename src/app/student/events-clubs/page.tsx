'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { CampusEvent, CampusClub, ClubRecruitment, EventRegistration, EventCategory, ClubCategory } from '@/types';
import { EventTicketModal } from '@/components/events/EventTicketModal';
import { EventDetailsModal } from '@/components/events/EventDetailsModal';
import { ClubDetailsModal } from '@/components/events/ClubDetailsModal';
import { JoinClubModal } from '@/components/events/JoinClubModal';
import { ProposeEventModal } from '@/components/events/ProposeEventModal';
import {
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Ticket,
  Sparkles,
  ShieldCheck,
  Trophy,
  Star,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building2,
  Compass,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function EventsAndClubsPage() {
  const {
    campusEvents,
    campusClubs,
    eventRegistrations,
    currentUser,
    registerForEvent,
    cancelEventRegistration,
    joinClub,
    applyForClubRole,
    proposeNewEvent,
  } = useResora();

  // Navigation Tabs: EVENTS, CLUBS, MY_PASSES, RECRUITMENTS
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'CLUBS' | 'MY_PASSES' | 'RECRUITMENTS'>('EVENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'ALL' | 'HACKATHON' | 'WORKSHOP' | 'TECHNICAL' | 'CULTURAL' | 'OD_ONLY'>('ALL');
  const [clubCategoryFilter, setClubCategoryFilter] = useState<'ALL' | 'TECHNICAL' | 'ROBOTICS' | 'ENTREPRENEURSHIP' | 'CULTURAL' | 'MEDIA_DESIGN'>('ALL');

  // Modals state
  const [selectedTicketRegistration, setSelectedTicketRegistration] = useState<EventRegistration | null>(null);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<CampusEvent | null>(null);
  const [selectedDetailClub, setSelectedDetailClub] = useState<CampusClub | null>(null);
  const [isJoinClubModalOpen, setIsJoinClubModalOpen] = useState(false);
  const [selectedClubForJoin, setSelectedClubForJoin] = useState<CampusClub | null>(null);
  const [selectedRecruitmentForJoin, setSelectedRecruitmentForJoin] = useState<ClubRecruitment | null>(null);
  const [isProposeEventModalOpen, setIsProposeEventModalOpen] = useState(false);

  // All open recruitments aggregated
  const allRecruitments: Array<{ club: CampusClub; recruitment: ClubRecruitment }> = [];
  campusClubs.forEach(club => {
    if (club.activeRecruitments) {
      club.activeRecruitments.forEach(rec => {
        allRecruitments.push({ club, recruitment: rec });
      });
    }
  });

  // Filtered Events
  const filteredEvents = campusEvents.filter(e => {
    const matchesSearch =
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      eventCategoryFilter === 'ALL' ||
      (eventCategoryFilter === 'OD_ONLY' ? e.isOdApproved : e.category === eventCategoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Filtered Clubs
  const filteredClubs = campusClubs.filter(c => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      clubCategoryFilter === 'ALL' || c.category === clubCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleRegisterEvent = (eventId: string) => {
    const result = registerForEvent(eventId);
    if (result.success && result.registration) {
      setSelectedDetailEvent(null);
      setSelectedTicketRegistration(result.registration);
    }
  };

  const handleOpenTicketForEvent = (event: CampusEvent) => {
    const reg = eventRegistrations.find(r => r.eventId === event.id);
    if (reg) {
      setSelectedTicketRegistration(reg);
    }
  };

  const handleOpenApplyRole = (club: CampusClub, recruitment: ClubRecruitment) => {
    setSelectedClubForJoin(club);
    setSelectedRecruitmentForJoin(recruitment);
    setIsJoinClubModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Hero Banner with Search & Action Buttons */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card border border-purple-900/50">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold flex items-center space-x-1.5">
                    <PartyPopper className="w-3.5 h-3.5" />
                    <span>Campus Life & Innovation Guilds</span>
                  </span>
                  <span className="text-xs text-purple-300 font-medium">Semester 2026</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  Events & Student Clubs Hub
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
                  Explore hackathons, robotics masterclasses, and vibrant student-led clubs. Register for events to unlock verifiable digital QR entry passes and official On-Duty (OD) attendance sanctions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsProposeEventModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Propose an Event</span>
                </button>

                <button
                  onClick={() => setActiveTab('MY_PASSES')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-purple-300" />
                  <span>My Passes ({eventRegistrations.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-900/60">
              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
                <span className="text-[10px] text-purple-300 uppercase font-semibold block">Upcoming Events</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-white">{campusEvents.length}</span>
                  <span className="text-[10px] text-purple-300">Live on campus</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
                <span className="text-[10px] text-purple-300 uppercase font-semibold block">Official Clubs</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-white">{campusClubs.length}</span>
                  <span className="text-[10px] text-purple-300">Student chapters</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
                <span className="text-[10px] text-purple-300 uppercase font-semibold block">Open Recruitments</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-amber-400">{allRecruitments.length}</span>
                  <span className="text-[10px] text-amber-300">Core roles hiring</span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
                <span className="text-[10px] text-purple-300 uppercase font-semibold block">My Active Passes</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-emerald-400">{eventRegistrations.length}</span>
                  <span className="text-[10px] text-emerald-300">With QR codes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events, workshops, hackathons, or student clubs (e.g. GDSC, Drone, Next.js, PitchTank)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-2xs placeholder:text-slate-400 font-sans"
            />
          </div>

          {/* Top-Level Tabs Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('EVENTS')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'EVENTS'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <PartyPopper className="w-4 h-4" />
                <span>Upcoming Events</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'EVENTS' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {campusEvents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('CLUBS')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'CLUBS'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Student Clubs & Chapters</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'CLUBS' ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {campusClubs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('MY_PASSES')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'MY_PASSES'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Passes & Memberships</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'MY_PASSES' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {eventRegistrations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('RECRUITMENTS')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === 'RECRUITMENTS'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Club Recruitments</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'RECRUITMENTS' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {allRecruitments.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: Upcoming Events */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setEventCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    eventCategoryFilter === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  All Events ({campusEvents.length})
                </button>

                <button
                  onClick={() => setEventCategoryFilter('HACKATHON')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    eventCategoryFilter === 'HACKATHON'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Hackathons
                </button>

                <button
                  onClick={() => setEventCategoryFilter('WORKSHOP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    eventCategoryFilter === 'WORKSHOP'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Workshops & Bootcamps
                </button>

                <button
                  onClick={() => setEventCategoryFilter('TECHNICAL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    eventCategoryFilter === 'TECHNICAL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Tech Masterclasses
                </button>

                <button
                  onClick={() => setEventCategoryFilter('CULTURAL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    eventCategoryFilter === 'CULTURAL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Cultural & Music
                </button>

                <button
                  onClick={() => setEventCategoryFilter('OD_ONLY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    eventCategoryFilter === 'OD_ONLY'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OD Approved Only</span>
                </button>
              </div>

              {/* Events Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEvents.map(event => {
                  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-3xl border border-slate-200/80 hover:border-purple-300 shadow-soft hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="p-5 space-y-3.5">
                        {/* Tags Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            {event.categoryLabel}
                          </span>

                          {event.isOdApproved && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>OD Approved</span>
                            </span>
                          )}
                        </div>

                        {/* Title & Host */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-purple-700 font-semibold mt-0.5">
                            by {event.clubName}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {event.tagline}
                          </p>
                        </div>

                        {/* Schedule & Location */}
                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <strong className="text-slate-800">{event.date}</strong>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>

                          <div className="flex items-center space-x-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>

                        {/* Capacity meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Capacity</span>
                            <span className="font-semibold text-slate-700">
                              {event.registeredCount} / {event.capacity} seats ({percentFilled}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDetailEvent(event)}
                          className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          View Details
                        </button>

                        {event.isRegistered ? (
                          <button
                            onClick={() => handleOpenTicketForEvent(event)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-2xs transition-all"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>View Pass</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(event.id)}
                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm transition-all"
                          >
                            <span>Register Free</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Student Clubs & Chapters */}
          {activeTab === 'CLUBS' && (
            <div className="space-y-4">
              {/* Club Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setClubCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  All Clubs ({campusClubs.length})
                </button>

                <button
                  onClick={() => setClubCategoryFilter('TECHNICAL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'TECHNICAL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Technical & Coding
                </button>

                <button
                  onClick={() => setClubCategoryFilter('ROBOTICS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'ROBOTICS'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Robotics & Hardware
                </button>

                <button
                  onClick={() => setClubCategoryFilter('ENTREPRENEURSHIP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'ENTREPRENEURSHIP'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Startups / E-Cell
                </button>

                <button
                  onClick={() => setClubCategoryFilter('CULTURAL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'CULTURAL'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Cultural & Music
                </button>

                <button
                  onClick={() => setClubCategoryFilter('MEDIA_DESIGN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    clubCategoryFilter === 'MEDIA_DESIGN'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  UI/UX & Media Studio
                </button>
              </div>

              {/* Clubs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClubs.map(club => (
                  <div
                    key={club.id}
                    className="bg-white rounded-3xl border border-slate-200/80 hover:border-purple-300 shadow-soft hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Strip */}
                      <div className={`bg-gradient-to-r ${club.bannerGradient} p-4 text-white flex items-center justify-between`}>
                        <span className="font-mono font-extrabold text-xs tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md">
                          {club.shortCode}
                        </span>

                        <div className="flex items-center space-x-1 text-xs font-bold bg-black/20 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>{club.rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            {club.categoryLabel}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {club.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {club.tagline}
                          </p>
                        </div>

                        {/* Members & Faculty Mentor */}
                        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Active Members:</span>
                            <strong className="text-slate-800">{club.memberCount} Students</strong>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">Weekly Meetup:</span>
                            <span className="font-medium text-purple-700">{club.regularMeetup.frequency}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">Faculty In-Charge:</span>
                            <span className="text-slate-700 font-medium">{club.facultyMentor.name}</span>
                          </div>
                        </div>

                        {/* Open Recruitments badge if available */}
                        {club.activeRecruitments && club.activeRecruitments.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 text-xs font-semibold flex items-center justify-between border border-purple-200">
                            <span>🚀 {club.activeRecruitments.length} Core Roles Hiring</span>
                            <span className="text-[10px] text-purple-600 font-bold uppercase">Apply Now</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDetailClub(club)}
                        className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        Explore Club
                      </button>

                      <button
                        onClick={() => joinClub(club.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                          club.isJoined
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {club.isJoined ? 'Leave' : 'Join Club'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: My Registrations & Passes */}
          {activeTab === 'MY_PASSES' && (
            <div className="space-y-6">
              {/* Event Passes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      My Event Entry Passes ({eventRegistrations.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('EVENTS')}
                    className="text-xs text-purple-600 font-bold hover:underline"
                  >
                    Browse More Events →
                  </button>
                </div>

                {eventRegistrations.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500 space-y-2">
                    <Ticket className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700">No event registrations found</p>
                    <p>Register for hackathons and workshops to get your digital entry QR tickets.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventRegistrations.map(reg => (
                      <div
                        key={reg.id}
                        className="bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                #{reg.ticketCode}
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 mt-1">{reg.eventTitle}</h3>
                              <p className="text-xs text-purple-700 font-semibold">{reg.clubName}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Confirmed</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Date</span>
                              <strong className="text-slate-800">{reg.date}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Timing</span>
                              <strong className="text-slate-800 truncate block">{reg.time}</strong>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{reg.venue}</span>
                          </div>

                          {reg.isOdApproved && (
                            <div className="p-2 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 font-medium flex items-center space-x-1.5 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Official On-Duty (OD) Attendance Sanctioned</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => cancelEventRegistration(reg.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => setSelectedTicketRegistration(reg)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>View QR Entry Pass</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Joined Clubs */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      My Club Memberships ({campusClubs.filter(c => c.isJoined).length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {campusClubs
                    .filter(c => c.isJoined)
                    .map(club => (
                      <div
                        key={club.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              {club.shortCode}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {club.userRole || 'Active Member'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-2">{club.name}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{club.tagline}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedDetailClub(club)}
                            className="text-xs text-purple-600 font-bold hover:underline"
                          >
                            Club Details →
                          </button>
                          <button
                            onClick={() => joinClub(club.id)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold"
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Core Team Recruitments */}
          {activeTab === 'RECRUITMENTS' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Active Campus Club Core Team Hiring Drives</h3>
                  <p className="text-purple-700 text-[11px] mt-0.5">
                    Apply for leadership, engineering, design, and PR roles to lead flagship university events.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs">
                  {allRecruitments.length} Roles Open
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRecruitments.map(({ club, recruitment }) => (
                  <div
                    key={recruitment.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            {club.name} ({club.shortCode})
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{recruitment.roleTitle}</h4>
                          <span className="text-xs text-slate-500">{recruitment.department}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {recruitment.openings} Openings
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {recruitment.description}
                      </p>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-600">Eligibility: </span>
                          <span>{recruitment.eligibility}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Application Deadline: </span>
                          <strong className="text-rose-600">{recruitment.deadline}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedDetailClub(club)}
                        className="text-xs text-slate-600 font-semibold hover:text-purple-600"
                      >
                        About {club.shortCode} →
                      </button>

                      <button
                        onClick={() => handleOpenApplyRole(club, recruitment)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <span>Apply for Role</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Ticket QR Modal */}
      <EventTicketModal
        isOpen={!!selectedTicketRegistration}
        onClose={() => setSelectedTicketRegistration(null)}
        registration={selectedTicketRegistration}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={!!selectedDetailEvent}
        onClose={() => setSelectedDetailEvent(null)}
        event={selectedDetailEvent}
        onRegister={handleRegisterEvent}
        onViewTicket={() => {
          if (selectedDetailEvent) {
            handleOpenTicketForEvent(selectedDetailEvent);
            setSelectedDetailEvent(null);
          }
        }}
        onCancelRegistration={() => {
          if (selectedDetailEvent) {
            const reg = eventRegistrations.find(r => r.eventId === selectedDetailEvent.id);
            if (reg) {
              cancelEventRegistration(reg.id);
              setSelectedDetailEvent(null);
            }
          }
        }}
      />

      {/* Club Details Modal */}
      <ClubDetailsModal
        isOpen={!!selectedDetailClub}
        onClose={() => setSelectedDetailClub(null)}
        club={selectedDetailClub}
        onJoinToggle={joinClub}
        onApplyRole={rec => {
          if (selectedDetailClub) {
            handleOpenApplyRole(selectedDetailClub, rec);
            setSelectedDetailClub(null);
          }
        }}
      />

      {/* Join Club / Recruitment Modal */}
      <JoinClubModal
        isOpen={isJoinClubModalOpen}
        onClose={() => {
          setIsJoinClubModalOpen(false);
          setSelectedClubForJoin(null);
          setSelectedRecruitmentForJoin(null);
        }}
        club={selectedClubForJoin}
        recruitment={selectedRecruitmentForJoin}
        onSubmit={applyForClubRole}
      />

      {/* Propose Event Modal */}
      <ProposeEventModal
        isOpen={isProposeEventModalOpen}
        onClose={() => setIsProposeEventModalOpen(false)}
        onSubmit={proposeNewEvent}
      />
    </div>
  );
}
