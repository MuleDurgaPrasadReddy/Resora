'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { StatusBadge } from '@/components/common/Badge';
import { MultiStepBookingModal } from '@/components/booking/MultiStepBookingModal';
import { QrGatePassModal } from '@/components/permissions/QrGatePassModal';
import { Booking, LeavePermission, LeaveStatus } from '@/types';
import {
  CalendarCheck,
  QrCode,
  Building2,
  Plus,
  Compass,
  Home,
  HeartPulse,
  AlertTriangle,
  Trophy,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  ArrowRight,
  Ticket,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function StudentBookingsAndPassesPage() {
  const { bookings, leavePermissions, currentUser } = useResora();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedLeaveForQr, setSelectedLeaveForQr] = useState<LeavePermission | null>(null);

  // Tabs: ALL, LAB_BOOKINGS, LEAVE_PERMISSIONS
  const [activeTab, setActiveTab] = useState<'ALL' | 'LAB_BOOKINGS' | 'LEAVE_PERMISSIONS'>('ALL');
  // Status filter: ALL, APPROVED, PENDING, CHANGES_REQUESTED
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'CHANGES_REQUESTED'>('ALL');

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'APPROVED') return b.status === 'APPROVED' || b.status === 'CHECKED_IN';
    if (statusFilter === 'PENDING') return b.status === 'PENDING';
    if (statusFilter === 'CHANGES_REQUESTED') return b.status === 'CHANGES_REQUESTED';
    return true;
  });

  const filteredLeaves = leavePermissions.filter(l => {
    if (statusFilter === 'APPROVED') return l.status === 'APPROVED';
    if (statusFilter === 'PENDING') return l.status === 'PENDING';
    if (statusFilter === 'CHANGES_REQUESTED') return l.status === 'CHANGES_REQUESTED';
    return true;
  });

  const totalCount = bookings.length + leavePermissions.length;
  const approvedTotal =
    bookings.filter(b => b.status === 'APPROVED' || b.status === 'CHECKED_IN').length +
    leavePermissions.filter(l => l.status === 'APPROVED').length;
  const pendingTotal =
    bookings.filter(b => b.status === 'PENDING').length +
    leavePermissions.filter(l => l.status === 'PENDING').length;
  const changesTotal =
    bookings.filter(b => b.status === 'CHANGES_REQUESTED').length +
    leavePermissions.filter(l => l.status === 'CHANGES_REQUESTED').length;

  const getLeaveIcon = (type: string) => {
    switch (type) {
      case 'AFTERNOON_EXIT':
        return Home;
      case 'MEDICAL_LEAVE':
        return HeartPulse;
      case 'EMERGENCY_LEAVE':
        return AlertTriangle;
      case 'EVENT_OD':
        return Trophy;
      default:
        return Compass;
    }
  };

  const getLeaveStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Approved · Gate Pass Ready</span>
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Title Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Activity & Access Desk
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  {approvedTotal} Active Passes
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
                My Bookings & Passes
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your reserved lab spaces, requested leave permissions, and access authorized QR Gate Passes
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/student/resources?tab=permissions"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>+ Take Leave Permission</span>
              </Link>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Book Lab Space</span>
              </button>
            </div>
          </div>

          {/* Top-Level Tabs: All, Lab Bookings, Leave Permissions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>All Requests</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-semibold">
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('LAB_BOOKINGS')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'LAB_BOOKINGS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lab Bookings</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  activeTab === 'LAB_BOOKINGS' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('LEAVE_PERMISSIONS')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'LEAVE_PERMISSIONS'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Leave & Outpass Passes</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  activeTab === 'LEAVE_PERMISSIONS' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  {leavePermissions.length}
                </span>
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-200 text-slate-800 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All Statuses
              </button>

              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-colors flex items-center space-x-1 ${
                  statusFilter === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Approved ({approvedTotal})</span>
              </button>

              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-colors flex items-center space-x-1 ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Pending ({pendingTotal})</span>
              </button>

              {changesTotal > 0 && (
                <button
                  onClick={() => setStatusFilter('CHANGES_REQUESTED')}
                  className={`px-2.5 py-1 rounded-xl font-semibold transition-colors flex items-center space-x-1 ${
                    statusFilter === 'CHANGES_REQUESTED'
                      ? 'bg-orange-100 text-orange-800 font-bold border border-orange-200'
                      : 'text-slate-500 hover:text-orange-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Action Needed ({changesTotal})</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 1: Requested Leave & Outpass Permissions */}
          {(activeTab === 'ALL' || activeTab === 'LEAVE_PERMISSIONS') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Leave & Outpass Permissions ({filteredLeaves.length})
                  </h2>
                </div>
                <Link
                  href="/student/resources?tab=permissions"
                  className="text-xs text-purple-600 hover:text-purple-800 font-bold flex items-center space-x-1"
                >
                  <span>+ Take Another Permission</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {filteredLeaves.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-xs text-slate-500">
                  No leave permissions matching the selected filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLeaves.map(leave => {
                    const Icon = getLeaveIcon(leave.leaveType);
                    const isApproved = leave.status === 'APPROVED';

                    return (
                      <div
                        key={leave.id}
                        className={`bg-white rounded-3xl border p-5 transition-all flex flex-col justify-between space-y-3 ${
                          isApproved
                            ? 'border-emerald-200/90 shadow-sm hover:shadow-md'
                            : 'border-slate-200/80 shadow-2xs hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Header row */}
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
                                <h3 className="text-sm font-bold text-slate-900">{leave.leaveTypeLabel}</h3>
                                <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                                  #{leave.passCode}
                                </span>
                              </div>
                            </div>
                            {getLeaveStatusBadge(leave.status)}
                          </div>

                          {/* Schedule block */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-100">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Exit Date</span>
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
                          <div className="space-y-1 text-xs">
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

                          {/* Notes if approved / changes / rejected */}
                          {isApproved && (
                            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-2.5 text-xs text-emerald-900 space-y-0.5">
                              <div className="flex items-center space-x-1.5 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Faculty Endorsement Active</span>
                              </div>
                              <p className="text-emerald-800 text-[11px] pl-5">
                                Approved by {leave.approvedByFacultyName || 'Department Faculty'}
                                {leave.approvalRemarks ? ` · "${leave.approvalRemarks}"` : ''}
                              </p>
                            </div>
                          )}

                          {leave.status === 'CHANGES_REQUESTED' && leave.requestChangesNote && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-xs text-amber-900 space-y-0.5">
                              <div className="flex items-center space-x-1.5 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Faculty Note:</span>
                              </div>
                              <p className="text-amber-800 text-[11px] pl-5">{leave.requestChangesNote}</p>
                            </div>
                          )}

                          {leave.status === 'REJECTED' && leave.rejectionReason && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-xs text-rose-900 space-y-0.5">
                              <div className="flex items-center space-x-1.5 font-bold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejection Reason:</span>
                              </div>
                              <p className="text-rose-800 text-[11px] pl-5">{leave.rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Card Action Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            Guardian: <strong className="font-mono">{leave.parentPhone}</strong>
                          </span>

                          {isApproved ? (
                            <button
                              onClick={() => setSelectedLeaveForQr(leave)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View QR Gate Pass</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold italic">
                              {leave.status === 'PENDING' ? 'Awaiting Faculty Signature' : 'Decision Logged'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Lab & Facility Bookings */}
          {(activeTab === 'ALL' || activeTab === 'LAB_BOOKINGS') && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Lab & Facility Reservations ({filteredBookings.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="text-xs text-brand-600 hover:text-brand-800 font-bold flex items-center space-x-1"
                >
                  <span>+ Book Another Space</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-xs text-slate-500">
                  No lab bookings matching the selected filter.
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden divide-y divide-slate-100">
                  {filteredBookings.map(b => (
                    <div
                      key={b.id}
                      className="p-5 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start space-x-4 flex-1 min-w-[280px]">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3 className="text-sm font-bold text-slate-900">{b.resourceName}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700 font-mono">
                              #{b.bookingCode}
                            </span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            Location: {b.location} · Purpose: <strong>{b.purpose}</strong>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Date: {b.date} ({b.startTime} - {b.endTime}) · Requested: {b.requestedAt || 'Today'}
                          </p>
                          {b.requestChangesNote && (
                            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                              <strong>Faculty Request Note:</strong> &quot;{b.requestChangesNote}&quot;
                            </div>
                          )}
                          {b.rejectionReason && (
                            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                              <strong>Rejection Reason:</strong> &quot;{b.rejectionReason}&quot;
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {(b.status === 'APPROVED' || b.status === 'CHECKED_IN') && (
                          <Link
                            href="/student/qr-pass"
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View Lab Pass</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Lab Booking Modal */}
      <MultiStepBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* QR Gate Pass Modal for Leave Outpasses */}
      <QrGatePassModal
        isOpen={!!selectedLeaveForQr}
        onClose={() => setSelectedLeaveForQr(null)}
        leave={selectedLeaveForQr}
      />
    </div>
  );
}
