'use client';

import React from 'react';
import { CampusEvent } from '@/types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  Sparkles,
  Ticket,
  UserCheck,
  Building2,
  AlertCircle,
  Phone,
  Mail,
  GraduationCap,
  Gift
} from 'lucide-react';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampusEvent | null;
  onRegister: (eventId: string) => void;
  onViewTicket: () => void;
  onCancelRegistration: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onRegister,
  onViewTicket,
  onCancelRegistration,
}) => {
  if (!isOpen || !event) return null;

  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  {event.categoryLabel}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-semibold">
                  {event.format === 'IN_PERSON' ? 'In-Person' : event.format === 'HYBRID' ? 'Hybrid / Zoom' : 'Online'}
                </span>

                {event.isOdApproved && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>On-Duty (OD) Approved</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {event.title}
              </h2>
              <p className="text-xs text-purple-200/90 font-medium">
                Organized by <strong>{event.clubName}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-purple-900/60 text-xs">
            <div className="flex items-center space-x-2 text-purple-200">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center space-x-2 text-purple-200">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>

            <div className="flex items-center space-x-2 text-purple-200 col-span-2 sm:col-span-1">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Capacity Progress Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Registration Status:</span>
                <strong className="text-purple-700">
                  {event.registrationStatus === 'FAST_FILLING' ? 'Fast Filling' : 'Open'}
                </strong>
              </span>
              <span className="text-slate-800">
                <strong>{event.registeredCount}</strong> / {event.capacity} seats filled ({percentFilled}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentFilled > 85 ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* About Event */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About the Event
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Agenda Timeline if present */}
          {event.detailedAgenda && event.detailedAgenda.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Event Schedule & Agenda
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                {event.detailedAgenda.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perks & Benefits */}
          {event.perks && event.perks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-purple-600" />
                <span>What Participants Receive</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-purple-50/70 border border-purple-200/70 rounded-xl text-xs text-purple-900 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="font-medium">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility & Prerequisites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Eligibility
              </span>
              <strong className="text-slate-800">{event.eligibility}</strong>
            </div>

            {event.prerequisites && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Prerequisites / Requirements
                </span>
                <span className="text-slate-700">{event.prerequisites.join(' · ')}</span>
              </div>
            )}
          </div>

          {/* Coordinators Contact */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Faculty & Student Coordinators
            </h4>
            <div className="flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] block">Faculty Coordinator</span>
                <strong className="text-slate-800">{event.facultyCoordinator.name}</strong> ({event.facultyCoordinator.department})
              </div>

              {event.studentCoordinators.length > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] block">Student Lead</span>
                  <strong className="text-slate-800">{event.studentCoordinators[0].name}</strong> ({event.studentCoordinators[0].phone})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entry Fee</span>
            <strong className="text-emerald-700 font-extrabold text-sm">{event.entryFee}</strong>
          </div>

          <div className="flex items-center space-x-3">
            {event.isRegistered ? (
              <>
                <button
                  onClick={onCancelRegistration}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Cancel Registration
                </button>

                <button
                  onClick={onViewTicket}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View Entry Pass</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onRegister(event.id)}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register for Event (Free)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
