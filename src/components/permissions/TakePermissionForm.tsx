'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { LeaveType, ApplyForLeaveInput } from '@/types';
import {
  Compass,
  Home,
  HeartPulse,
  AlertTriangle,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Sparkles,
  Ticket,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const TakePermissionForm: React.FC = () => {
  const router = useRouter();
  const { applyForLeave, currentUser } = useResora();

  const [leaveType, setLeaveType] = useState<LeaveType>('AFTERNOON_EXIT');
  const [leaveTypeLabel, setLeaveTypeLabel] = useState('Afternoon Exit (Going Home)');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('01:30 PM (Afternoon)');
  const [expectedReturnTime, setExpectedReturnTime] = useState('Not Returning Today (Day Scholar)');
  const [destination, setDestination] = useState('Home (Residence)');
  const [reason, setReason] = useState(
    'Completed morning lectures & lab demo. Leaving campus in the afternoon to study from home.'
  );
  const [isFullDayOrAfternoon, setIsFullDayOrAfternoon] = useState<'AFTERNOON' | 'EARLY_EXIT' | 'FULL_DAY'>('AFTERNOON');
  const [parentName, setParentName] = useState('K. M. Reddy (Father)');
  const [parentPhone, setParentPhone] = useState('+91 98765 43210');
  const [studentPhone, setStudentPhone] = useState('+91 98765 11223');

  const [submitting, setSubmitting] = useState(false);
  const [submittedLeavePassCode, setSubmittedLeavePassCode] = useState<string | null>(null);

  const leaveTypeOptions: Array<{
    type: LeaveType;
    label: string;
    description: string;
    icon: React.ElementType;
    badgeColor: string;
    suggestedReason: string;
    suggestedReturn: string;
    category: 'AFTERNOON' | 'EARLY_EXIT' | 'FULL_DAY';
  }> = [
    {
      type: 'AFTERNOON_EXIT',
      label: 'Afternoon Exit (Going Home)',
      description: 'Leave college post-lunch or afternoon to head home safely',
      icon: Home,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      suggestedReason: 'Completed morning lectures & lab demo. Leaving campus in the afternoon to study from home.',
      suggestedReturn: 'Not Returning Today (Day Scholar)',
      category: 'AFTERNOON',
    },
    {
      type: 'MEDICAL_LEAVE',
      label: 'Medical / Health Leave',
      description: 'Illness, severe headache, doctor consultation or clinic visit',
      icon: HeartPulse,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
      suggestedReason: 'Experiencing sudden fever and migraine. Heading home/clinic for medical rest.',
      suggestedReturn: 'Tomorrow 08:30 AM',
      category: 'EARLY_EXIT',
    },
    {
      type: 'EMERGENCY_LEAVE',
      label: 'Emergency Leave',
      description: 'Urgent family situation or unexpected domestic requirement',
      icon: AlertTriangle,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      suggestedReason: 'Urgent family requirement at home. Guardian informed faculty.',
      suggestedReturn: 'Tomorrow 08:30 AM',
      category: 'EARLY_EXIT',
    },
    {
      type: 'DAY_OUTPASS',
      label: 'Day Outpass (Short Leave)',
      description: 'Step outside campus temporarily and return before curfew',
      icon: Compass,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      suggestedReason: 'Urgent banking work / document attestation outside campus.',
      suggestedReturn: 'Today by 05:30 PM',
      category: 'EARLY_EXIT',
    },
    {
      type: 'EVENT_OD',
      label: 'On-Duty (Hackathon / Event OD)',
      description: 'Represent college at inter-college hackathon, seminar or competition',
      icon: Trophy,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      suggestedReason: 'Participating in Smart India Hackathon zonal round at IIIT Campus.',
      suggestedReturn: 'Tomorrow 06:00 PM',
      category: 'FULL_DAY',
    },
  ];

  const departureTimePresets = [
    '12:45 PM (Post-Lunch)',
    '01:30 PM (Afternoon)',
    '02:30 PM (Mid-Afternoon)',
    '03:45 PM (Post-Lab Session)',
    'Immediate (Next 15 Mins)',
  ];

  const handleSelectType = (option: typeof leaveTypeOptions[0]) => {
    setLeaveType(option.type);
    setLeaveTypeLabel(option.label);
    setReason(option.suggestedReason);
    setExpectedReturnTime(option.suggestedReturn);
    setIsFullDayOrAfternoon(option.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !destination.trim() || !parentPhone.trim()) return;

    setSubmitting(true);
    const input: ApplyForLeaveInput = {
      leaveType,
      leaveTypeLabel,
      reason: reason.trim(),
      destination: destination.trim(),
      date,
      departureTime,
      expectedReturnTime,
      isFullDayOrAfternoon,
      parentPhone: parentPhone.trim(),
      parentName: parentName.trim(),
      studentPhone: studentPhone.trim(),
    };

    const result = applyForLeave(input);
    setSubmitting(false);
    setSubmittedLeavePassCode(result.leave?.passCode || 'OUT-REQ');
  };

  const handleResetForAnother = () => {
    setSubmittedLeavePassCode(null);
    setReason('Completed morning lectures & lab demo. Leaving campus in the afternoon to study from home.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner linking to My Bookings & Passes */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-purple-500/20 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
              Permission Desk
            </span>
            <span className="text-xs text-purple-300 font-semibold">Afternoon Exit & Outpass System</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading">
            Take Campus Leave & Outpass Permission
          </h2>
          <p className="text-xs text-purple-200/90 max-w-xl">
            Want to go home from afternoon or leave college? Fill in your leave details below. Once approved by faculty, your digital QR gate pass is immediately available in <strong>My Bookings & Passes</strong>.
          </p>
        </div>

        <Link
          href="/student/bookings"
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 hover:border-purple-300"
        >
          <Ticket className="w-4 h-4 text-purple-300" />
          <span>View My Bookings & Passes</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {submittedLeavePassCode ? (
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-8 sm:p-10 shadow-soft text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Application ID #{submittedLeavePassCode}
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              Leave Permission Request Submitted!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your permission request for <strong>{departureTime}</strong> on <strong>{date}</strong> has been routed to the Department Faculty Head for digital authorization.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto text-xs text-slate-600 text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <strong className="text-slate-800">{leaveTypeLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heading To:</span>
              <strong className="text-slate-800">{destination}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guardian Contact:</span>
              <strong className="font-mono text-slate-800">{parentPhone}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 text-purple-700 text-[11px] font-medium flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Upon faculty approval, your digital QR Gate Access Pass will appear in <strong>My Bookings & Passes</strong>.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/student/bookings"
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Ticket className="w-4 h-4" />
              <span>Track in My Bookings & Passes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleResetForAnother}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Take Another Permission
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6"
        >
          {/* Step 1: Permission Category */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Leave / Outpass Category
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaveTypeOptions.map(option => {
                const Icon = option.icon;
                const isSelected = leaveType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleSelectType(option)}
                    className={`text-left p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-2xs ring-2 ring-purple-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold text-slate-900 block truncate">
                        {option.label}
                      </strong>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Schedule & Departure Time */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Schedule & Departure Time
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span>Exit Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Requested Departure Time</span>
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  placeholder="e.g. 01:30 PM (Afternoon)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Popular Departure Slots:</span>
              {departureTimePresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepartureTime(preset)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                    departureTime === preset
                      ? 'bg-purple-600 text-white border-purple-600 font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Destination & Purpose */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Destination & Reason for Departure
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Destination / Heading To</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Home, Miyapur, Hyderabad"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Expected Return Status</span>
                </label>
                <input
                  type="text"
                  value={expectedReturnTime}
                  onChange={e => setExpectedReturnTime(e.target.value)}
                  placeholder="e.g. Not Returning Today or Tomorrow 08:30 AM"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Reason / Explanation for Leaving College</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain clearly why you need to go home in the afternoon or leave college early..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-sans"
                required
              />
            </div>
          </div>

          {/* Step 4: Parent Verification */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Parent / Guardian Contact for Gate Verification
              </h3>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Parent / Guardian Name"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Guardian Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Gate security personnel may cross-verify with this contact number during departure inspection.
                </span>
              </div>
            </div>
          </div>

          {/* Submit Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Logged in as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.rollNumber || 'CSE-2023-042'})
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Permission...' : 'Take Permission & Request Faculty Outpass'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
