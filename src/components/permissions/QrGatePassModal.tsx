'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LeavePermission } from '@/types';
import {
  ShieldCheck,
  X,
  Printer,
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Building2,
  QrCode,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface QrGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeavePermission | null;
}

export const QrGatePassModal: React.FC<QrGatePassModalProps> = ({ isOpen, onClose, leave }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !leave) return null;

  const qrDataPayload = JSON.stringify({
    passId: leave.passCode,
    studentId: leave.rollNumber,
    name: leave.userName,
    date: leave.date,
    departureTime: leave.departureTime,
    destination: leave.destination,
    facultySignature: leave.approvedByFacultyName || 'Authorized Faculty',
    type: leave.leaveType,
    system: 'RESORA_CAMPUS_SECURITY_GATE'
  });

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(leave.passCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/90 border border-purple-400/40 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-purple-100" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                  Campus Security Authorization
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Official Gate Exit Pass
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

          {/* Pass ID & Live Status Bar */}
          <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Pass Code:</span>
              <button
                onClick={handleCopyCode}
                className="font-mono font-bold text-purple-200 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-700/50 flex items-center space-x-1 hover:border-purple-400 transition-colors"
              >
                <span>{leave.passCode}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
              </button>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE CLEARANCE</span>
            </div>
          </div>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 bg-slate-50 flex flex-col items-center border-b border-slate-100">
          <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-dashed border-purple-200 relative group">
            <QRCodeSVG
              value={qrDataPayload}
              size={190}
              level="H"
              includeMargin
              imageSettings={{
                src: '',
                excavate: false,
                height: 0,
                width: 0,
              }}
            />
            <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/90 px-2 py-0.5 rounded-full border border-purple-200/80">
                Encrypted Gate Token
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-slate-800">
              Present this QR to Security Personnel at the gate
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Authorized Gates: <strong className="text-purple-700 font-semibold">{leave.validGate || 'Campus Main Gate & Gate 2'}</strong>
            </p>
          </div>
        </div>

        {/* Detailed Verification Information */}
        <div className="p-6 space-y-4 max-h-[46vh] overflow-y-auto">
          {/* Student Info Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Student Credential
                </span>
                <h4 className="text-sm font-bold text-slate-900">{leave.userName}</h4>
                <p className="text-xs text-slate-500">
                  Roll No: <span className="font-mono font-semibold text-slate-700">{leave.rollNumber}</span> · {leave.department} ({leave.academicYearLabel || '3rd Year'})
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                {leave.leaveTypeLabel}
              </span>
            </div>
          </div>

          {/* Departure & Schedule Details */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] font-bold uppercase">Exit Date</span>
              </div>
              <strong className="text-xs text-slate-900 block">{leave.date}</strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase">Exit Time</span>
              </div>
              <strong className="text-xs text-emerald-700 block">{leave.departureTime}</strong>
            </div>
          </div>

          {/* Destination & Reason */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">Destination:</span>
              <strong className="text-slate-800">{leave.destination}</strong>
            </div>

            <div className="text-slate-600 text-xs pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Reason: </span>
              {leave.reason}
            </div>

            {leave.expectedReturnTime && (
              <div className="text-[11px] text-slate-500 pt-0.5">
                <span className="font-medium text-slate-600">Expected Return: </span>
                <span className="font-semibold text-slate-800">{leave.expectedReturnTime}</span>
              </div>
            )}
          </div>

          {/* Faculty Approval Signature */}
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-1 text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Digitally Approved by Faculty</span>
            </div>
            <p className="text-emerald-800 text-[11px] pl-6 font-medium">
              Endorsed by: <strong>{leave.approvedByFacultyName || 'Faculty Authority'}</strong>
              {leave.approvedAt ? ` (${leave.approvedAt})` : ''}
            </p>
            {leave.approvalRemarks && (
              <p className="text-emerald-700 text-[11px] pl-6 italic">
                &ldquo;{leave.approvalRemarks}&rdquo;
              </p>
            )}
          </div>

          {/* Emergency & Guardian Verification */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="block text-[9px] uppercase font-bold text-slate-400">Guardian Contact on File</span>
              <span className="font-mono font-semibold text-slate-700">{leave.parentPhone}</span>
              {leave.parentName ? ` (${leave.parentName})` : ''}
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Security Gate Log</span>
              <span className="text-emerald-600 font-semibold">Pre-Cleared</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
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
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
