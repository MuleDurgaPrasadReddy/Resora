'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { LeavePermission, LeaveStatus } from '@/types';
import { QrGatePassModal } from './QrGatePassModal';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import {
  ShieldCheck,
  Plus,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  Sparkles,
  Phone,
  Home,
  HeartPulse,
  Compass,
  Trophy,
  Filter,
  Check,
  FileText,
  UserCheck
} from 'lucide-react';

export const LeavePermissionsView: React.FC = () => {
  const { leavePermissions, currentUser } = useResora();

  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'CHANGES_REQUESTED' | 'AFTERNOON'>('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeaveForQr, setSelectedLeaveForQr] = useState<LeavePermission | null>(null);

  // Filter list
  const filteredLeaves = leavePermissions.filter(l => {
    if (filter === 'APPROVED') return l.status === 'APPROVED';
    if (filter === 'PENDING') return l.status === 'PENDING';
    if (filter === 'CHANGES_REQUESTED') return l.status === 'CHANGES_REQUESTED';
    if (filter === 'AFTERNOON') return l.leaveType === 'AFTERNOON_EXIT';
    return true;
  });

  const approvedCount = leavePermissions.filter(l => l.status === 'APPROVED').length;
  const pendingCount = leavePermissions.filter(l => l.status === 'PENDING').length;
  const changesCount = leavePermissions.filter(l => l.status === 'CHANGES_REQUESTED').length;
  const afternoonCount = leavePermissions.filter(l => l.leaveType === 'AFTERNOON_EXIT').length;

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Approved · QR Pass Active</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Awaiting Faculty Review</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span>Clarification Needed</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center space-x-1">
            <UserCheck className="w-3 h-3 text-slate-600" />
            <span>Checked Out at Gate</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case 'AFTERNOON_EXIT':
        return Home;
      case 'MEDICAL_LEAVE':
        return HeartPulse;
      case 'EMERGENCY_LEAVE':
        return AlertTriangle;
      case 'DAY_OUTPASS':
        return Compass;
      case 'EVENT_OD':
        return Trophy;
      default:
        return Compass;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Action Button & Quick Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-card border border-purple-900/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Campus Outpass & Exit Clearance</span>
              </span>
              <span className="text-xs text-purple-300 font-medium">Digital Verification</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              Permissions for Leaves & Afternoon Exits
            </h2>
            <p className="text-xs text-purple-200/90 leading-relaxed">
              Want to go home in the afternoon or need permission to leave campus at any time? Submit your request to faculty. Once approved by faculty, your encrypted digital QR gate pass is generated instantly for security clearance.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave / Outpass</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-purple-900/60">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-300 uppercase font-semibold block">Active QR Passes</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-400">{approvedCount}</span>
              <span className="text-[10px] text-emerald-300">Ready to exit</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-300 uppercase font-semibold block">Pending Faculty</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-amber-400">{pendingCount}</span>
              <span className="text-[10px] text-amber-300">Under review</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-300 uppercase font-semibold block">Afternoon Exits</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-purple-300">{afternoonCount}</span>
              <span className="text-[10px] text-purple-400">Applications</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-300 uppercase font-semibold block">Total History</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-white">{leavePermissions.length}</span>
              <span className="text-[10px] text-slate-400">Total records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Permissions ({leavePermissions.length})
          </button>

          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              filter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved & QR Pass ({approvedCount})</span>
          </button>

          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Faculty ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilter('AFTERNOON')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              filter === 'AFTERNOON'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Afternoon Exits ({afternoonCount})</span>
          </button>

          {changesCount > 0 && (
            <button
              onClick={() => setFilter('CHANGES_REQUESTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                filter === 'CHANGES_REQUESTED'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Action Needed ({changesCount})</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 px-2 py-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Permissions List / Cards */}
      {filteredLeaves.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No leave permissions found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any leave or outpass requests in this filter. Click below to submit an afternoon exit or permission request.
          </p>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Apply for Outpass Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLeaves.map(leave => {
            const Icon = getLeaveIcon(leave.leaveType);
            const isApproved = leave.status === 'APPROVED';

            return (
              <div
                key={leave.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isApproved
                    ? 'border-emerald-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {leave.leaveTypeLabel}
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Pass #{leave.passCode}
                        </span>
                      </div>
                    </div>

                    {getStatusBadge(leave.status)}
                  </div>

                  {/* Date & Departure Box */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-100">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Date of Exit</span>
                      <strong className="text-slate-800 text-xs flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span>{leave.date}</span>
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Departure Time</span>
                      <strong className="text-purple-700 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-purple-600" />
                        <span>{leave.departureTime}</span>
                      </strong>
                    </div>
                  </div>

                  {/* Destination & Reason */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-slate-700">Destination:</span>
                      <span className="truncate">{leave.destination}</span>
                    </div>

                    <p className="text-slate-600 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">Reason: </span>
                      {leave.reason}
                    </p>

                    {leave.expectedReturnTime && (
                      <p className="text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">Expected Return: </span>
                        <strong>{leave.expectedReturnTime}</strong>
                      </p>
                    )}
                  </div>

                  {/* Status Notes & Remarks */}
                  {isApproved && (
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Digitally Endorsed by Faculty</span>
                      </div>
                      <p className="text-emerald-800 text-[11px] pl-5 font-medium">
                        Approved by: <strong>{leave.approvedByFacultyName || 'Faculty Head'}</strong>
                        {leave.approvedAt ? ` · ${leave.approvedAt}` : ''}
                      </p>
                      {leave.approvalRemarks && (
                        <p className="text-emerald-700 text-[11px] pl-5 italic">
                          &ldquo;{leave.approvalRemarks}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {leave.status === 'CHANGES_REQUESTED' && leave.requestChangesNote && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Faculty Requested Clarification:</span>
                      </div>
                      <p className="text-amber-800 text-[11px] pl-5">
                        &ldquo;{leave.requestChangesNote}&rdquo;
                      </p>
                    </div>
                  )}

                  {leave.status === 'REJECTED' && leave.rejectionReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-rose-900">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Application Rejected:</span>
                      </div>
                      <p className="text-rose-800 text-[11px] pl-5">
                        &ldquo;{leave.rejectionReason}&rdquo;
                      </p>
                    </div>
                  )}

                  {leave.status === 'PENDING' && (
                    <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-purple-900">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Faculty Verification in Progress</span>
                      </div>
                      <p className="text-purple-800 text-[11px] pl-5">
                        Request dispatched to CSE Department Faculty Head. Your QR Gate Pass will be generated as soon as faculty approves.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Guardian: <strong className="font-mono">{leave.parentPhone}</strong>
                  </span>

                  {isApproved ? (
                    <button
                      onClick={() => setSelectedLeaveForQr(leave)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View QR Gate Pass</span>
                    </button>
                  ) : leave.status === 'CHANGES_REQUESTED' ? (
                    <button
                      onClick={() => setIsApplyModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      <span>Update Request</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold italic">
                      Awaiting Endorsement
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Gate Pass Modal */}
      <QrGatePassModal
        isOpen={!!selectedLeaveForQr}
        onClose={() => setSelectedLeaveForQr(null)}
        leave={selectedLeaveForQr}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
