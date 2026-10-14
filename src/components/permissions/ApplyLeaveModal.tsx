'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { LeaveType, ApplyForLeaveInput } from '@/types';
import {
  X,
  Clock,
  Home,
  HeartPulse,
  AlertTriangle,
  Compass,
  Trophy,
  Calendar,
  MapPin,
  FileText,
  Phone,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser, applyForLeave } = useResora();

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
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

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

  const handleSelectType = (option: typeof leaveTypeOptions[0]) => {
    setLeaveType(option.type);
    setLeaveTypeLabel(option.label);
    setReason(option.suggestedReason);
    setExpectedReturnTime(option.suggestedReturn);
    setIsFullDayOrAfternoon(option.category);
  };

  const departureTimePresets = [
    '12:45 PM (Post-Lunch)',
    '01:30 PM (Afternoon)',
    '02:30 PM (Mid-Afternoon)',
    '03:45 PM (Post-Lab Session)',
    'Immediate (Next 15 Mins)',
  ];

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

    applyForLeave(input);
    setSubmitting(false);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/90 border border-purple-400/40 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-purple-100" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                  Permissions & Campus Outpass
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Apply for Leave / Campus Outpass
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-purple-200/90 mt-2 max-w-lg">
            Submit your afternoon exit or leave permission for faculty endorsement. Once approved by faculty, your digital QR gate clearance pass is generated immediately.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Application Submitted to Faculty!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your request has been routed to the Department Faculty Head. You will receive an instant notification and digital QR gate pass once approved.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Leave Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Select Permission Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {leaveTypeOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = leaveType === option.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleSelectType(option)}
                      className={`text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 shadow-2xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-900 block truncate">
                            {option.label}
                          </strong>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Departure Date & Time Selection */}
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Departure Time</span>
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={e => setDepartureTime(e.target.value)}
                  placeholder="e.g. 01:30 PM (Afternoon)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            {/* Departure Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Times:</span>
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

            {/* 3. Destination & Return Time */}
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Expected Return / Status</span>
                </label>
                <input
                  type="text"
                  value={expectedReturnTime}
                  onChange={e => setExpectedReturnTime(e.target.value)}
                  placeholder="e.g. Not Returning Today or Tomorrow 08:30 AM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* 4. Reason for Leaving */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Reason / Purpose for Campus Departure</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain clearly why you need to leave college early or during the afternoon..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-sans"
                required
              />
            </div>

            {/* 5. Parent / Emergency Verification Contacts */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Parent / Emergency Verification</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Parent / Guardian Name"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Guardian Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500">
                Security gate officers may verify departure with the registered guardian number in case of unscheduled campus departures.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Application...' : 'Submit Permission Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
