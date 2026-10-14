'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { EventRegistration } from '@/types';
import {
  Ticket,
  X,
  Printer,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Building2,
  Sparkles,
  User
} from 'lucide-react';

interface EventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: EventRegistration | null;
}

export const EventTicketModal: React.FC<EventTicketModalProps> = ({ isOpen, onClose, registration }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !registration) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(registration.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/90 border border-purple-400/40 flex items-center justify-center shadow-md">
                <Ticket className="w-4 h-4 text-purple-100" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                  Official Campus Event Pass
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Verified Entry Ticket
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

          <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Ticket ID:</span>
              <button
                onClick={handleCopyCode}
                className="font-mono font-bold text-purple-200 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-700/50 flex items-center space-x-1 hover:border-purple-400 transition-colors"
              >
                <span>{registration.ticketCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CONFIRMED ENTRY</span>
            </div>
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 bg-slate-50 flex flex-col items-center border-b border-slate-100 relative">
          <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-dashed border-purple-200 relative group">
            <QRCodeSVG
              value={registration.qrPayload}
              size={180}
              level="H"
              includeMargin
            />
            <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-full border border-purple-200">
                Gate Entry Token
              </span>
            </div>
          </div>

          <div className="mt-4 text-center space-y-1">
            <h4 className="text-sm font-bold text-slate-900 max-w-xs mx-auto">
              {registration.eventTitle}
            </h4>
            <p className="text-xs text-purple-700 font-semibold">
              Organized by {registration.clubName}
            </p>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-4 max-h-[44vh] overflow-y-auto">
          {/* Attendee Info Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Registered Attendee
            </span>
            <div className="flex items-baseline justify-between">
              <strong className="text-sm font-bold text-slate-900">{registration.studentName}</strong>
              <span className="font-mono text-xs font-semibold text-slate-700">{registration.rollNumber}</span>
            </div>
            <p className="text-[11px] text-slate-500">{registration.department}</p>
          </div>

          {/* Schedule & Venue Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] font-bold uppercase">Date</span>
              </div>
              <strong className="text-xs text-slate-900 block">{registration.date}</strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] font-bold uppercase">Time</span>
              </div>
              <strong className="text-xs text-slate-900 block truncate">{registration.time}</strong>
            </div>
          </div>

          {/* Venue */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-2 text-xs">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Venue / Hall</span>
              <strong className="text-slate-800">{registration.venue}</strong>
            </div>
          </div>

          {/* On-Duty (OD) Clearance Banner */}
          {registration.isOdApproved && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Official OD Attendance Sanctioned</span>
              </div>
              <p className="text-[11px] text-emerald-800 pl-5">
                On-Duty attendance will be automatically credited to your Resora attendance portal upon check-in scan.
              </p>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center">
            Registered on {registration.registeredAt} · Resora Campus Event Registry
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
