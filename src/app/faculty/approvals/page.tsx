'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { StatusBadge } from '@/components/common/Badge';
import { QrGatePassModal } from '@/components/permissions/QrGatePassModal';
import { Booking, LeavePermission } from '@/types';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Building2,
  Compass,
  ShieldCheck,
  QrCode,
  Phone,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  Home,
  HeartPulse,
  Trophy,
  Check,
  Send
} from 'lucide-react';

export default function FacultyApprovalsPage() {
  const {
    bookings,
    leavePermissions,
    approveBooking,
    rejectBooking,
    requestChangesBooking,
    approveLeavePermission,
    rejectLeavePermission,
    requestChangesLeavePermission,
  } = useResora();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'LEAVE_PERMISSIONS' | 'LAB_BOOKINGS'>('LEAVE_PERMISSIONS');

  // Lab Booking Modals
  const [selectedBookingForChanges, setSelectedBookingForChanges] = useState<Booking | null>(null);
  const [changesComment, setChangesComment] = useState('Please reduce the booking duration to 3 hours.');

  // Leave Permission Modals
  const [selectedLeaveForApprove, setSelectedLeaveForApprove] = useState<LeavePermission | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('Approved. Permitted to exit campus.');
  const [selectedLeaveForChanges, setSelectedLeaveForChanges] = useState<LeavePermission | null>(null);
  const [leaveChangeNote, setLeaveChangeNote] = useState('Please obtain parent verbal confirmation or leave after 2:30 PM class.');
  const [selectedLeaveForReject, setSelectedLeaveForReject] = useState<LeavePermission | null>(null);
  const [leaveRejectReason, setLeaveRejectReason] = useState('Mandatory laboratory examination scheduled this afternoon.');
  const [selectedLeaveForQr, setSelectedLeaveForQr] = useState<LeavePermission | null>(null);

  // Filters for leaves
  const [leaveFilter, setLeaveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'AFTERNOON'>('PENDING');

  // Counts
  const pendingBookingsCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'CHANGES_REQUESTED').length;
  const pendingLeavesCount = leavePermissions.filter(l => l.status === 'PENDING' || l.status === 'CHANGES_REQUESTED').length;

  const filteredLeaves = leavePermissions.filter(l => {
    if (leaveFilter === 'PENDING') return l.status === 'PENDING' || l.status === 'CHANGES_REQUESTED';
    if (leaveFilter === 'APPROVED') return l.status === 'APPROVED';
    if (leaveFilter === 'AFTERNOON') return l.leaveType === 'AFTERNOON_EXIT';
    return true;
  });

  const handleSendRequestChangesBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForChanges || !changesComment.trim()) return;
    requestChangesBooking(selectedBookingForChanges.id, changesComment);
    setSelectedBookingForChanges(null);
    setChangesComment('Please reduce the booking duration to 3 hours.');
  };

  const handleConfirmApproveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForApprove) return;
    approveLeavePermission(selectedLeaveForApprove.id, approvalRemarks);
    setSelectedLeaveForApprove(null);
  };

  const handleConfirmRequestChangesLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForChanges || !leaveChangeNote.trim()) return;
    requestChangesLeavePermission(selectedLeaveForChanges.id, leaveChangeNote.trim());
    setSelectedLeaveForChanges(null);
  };

  const handleConfirmRejectLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForReject || !leaveRejectReason.trim()) return;
    rejectLeavePermission(selectedLeaveForReject.id, leaveRejectReason.trim());
    setSelectedLeaveForReject(null);
  };

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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Page Title */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Faculty Governance & Clearances
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
                Student Approvals & Gate Clearances
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Review student outpass applications for afternoon departures and approve lab resource bookings
              </p>
            </div>
          </div>

          {/* Top-Level Tabs Switcher */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('LEAVE_PERMISSIONS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'LEAVE_PERMISSIONS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Leave & Outpass Permissions</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'LEAVE_PERMISSIONS' ? 'bg-purple-700 text-purple-100' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingLeavesCount} Pending
              </span>
            </button>

            <button
              onClick={() => setActiveTab('LAB_BOOKINGS')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'LAB_BOOKINGS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Lab & Facility Bookings</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'LAB_BOOKINGS' ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pendingBookingsCount} Pending
              </span>
            </button>
          </div>

          {/* TAB 1: Leave & Outpass Permissions */}
          {activeTab === 'LEAVE_PERMISSIONS' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setLeaveFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    leaveFilter === 'PENDING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Review ({pendingLeavesCount})</span>
                </button>

                <button
                  onClick={() => setLeaveFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    leaveFilter === 'APPROVED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approved & QR Issued ({leavePermissions.filter(l => l.status === 'APPROVED').length})</span>
                </button>

                <button
                  onClick={() => setLeaveFilter('AFTERNOON')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    leaveFilter === 'AFTERNOON'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Afternoon Leaves</span>
                </button>

                <button
                  onClick={() => setLeaveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    leaveFilter === 'ALL'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  All Applications ({leavePermissions.length})
                </button>
              </div>

              {/* Leave Applications List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {filteredLeaves.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No applications in this category</h4>
                      <p className="text-xs text-slate-500">All student leave outpass requests have been processed.</p>
                    </div>
                  ) : (
                    filteredLeaves.map(leave => {
                      const Icon = getLeaveIcon(leave.leaveType);
                      const isPending = leave.status === 'PENDING' || leave.status === 'CHANGES_REQUESTED';
                      const isApproved = leave.status === 'APPROVED';

                      return (
                        <div
                          key={leave.id}
                          className="p-6 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="space-y-2 flex-1 min-w-[300px]">
                            {/* Header row */}
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <h3 className="text-base font-bold text-slate-900">
                                {leave.userName}
                              </h3>
                              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {leave.rollNumber}
                              </span>
                              <span className="text-xs text-slate-500">
                                {leave.department} ({leave.academicYearLabel || '3rd Year'})
                              </span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                {leave.leaveTypeLabel}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-brand-600">
                                #{leave.passCode}
                              </span>
                            </div>

                            {/* Schedule & Destination */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                              <div className="flex items-center space-x-1.5 text-slate-600">
                                <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Date: <strong>{leave.date}</strong></span>
                              </div>

                              <div className="flex items-center space-x-1.5 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Exit Time: <strong className="text-emerald-700">{leave.departureTime}</strong></span>
                              </div>

                              <div className="flex items-center space-x-1.5 text-slate-600 truncate">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="truncate">Heading To: <strong>{leave.destination}</strong></span>
                              </div>
                            </div>

                            {/* Reason for departure */}
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                              <strong className="text-slate-900">Student Reason: </strong>
                              {leave.reason}
                              {leave.expectedReturnTime && (
                                <span className="block text-[11px] text-slate-500 mt-1">
                                  Expected Return: <strong>{leave.expectedReturnTime}</strong>
                                </span>
                              )}
                            </p>

                            {/* Guardian & Contact Verification */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>Guardian Contact: <strong className="font-mono text-slate-700">{leave.parentPhone}</strong></span>
                                {leave.parentName && <span className="text-slate-400">({leave.parentName})</span>}
                              </span>

                              {leave.studentPhone && (
                                <span className="text-[11px]">
                                  Student: <strong className="font-mono text-slate-700">{leave.studentPhone}</strong>
                                </span>
                              )}
                            </div>

                            {/* Changes Note if requested */}
                            {leave.requestChangesNote && (
                              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                <strong>Faculty Request Note:</strong> {leave.requestChangesNote}
                              </p>
                            )}

                            {/* Rejection Note if rejected */}
                            {leave.rejectionReason && (
                              <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                <strong>Rejection Reason:</strong> {leave.rejectionReason}
                              </p>
                            )}

                            {/* Approved State Banner */}
                            {isApproved && (
                              <div className="bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 p-2.5 rounded-xl flex items-center justify-between">
                                <div>
                                  <span className="font-bold flex items-center gap-1 text-emerald-800">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Digitally Approved & QR Pass Code Issued</span>
                                  </span>
                                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                                    Approved by {leave.approvedByFacultyName || 'Faculty Authority'}
                                    {leave.approvalRemarks ? ` · "${leave.approvalRemarks}"` : ''}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setSelectedLeaveForQr(leave)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>View QR Pass</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Column */}
                          <div className="flex items-center space-x-2 shrink-0 pt-1">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedLeaveForApprove(leave);
                                    setApprovalRemarks('Approved. Permitted to exit campus.');
                                  }}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve Outpass</span>
                                </button>

                                <button
                                  onClick={() => setSelectedLeaveForChanges(leave)}
                                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
                                >
                                  <MessageSquare className="w-4 h-4 text-amber-600" />
                                  <span>Request Changes</span>
                                </button>

                                <button
                                  onClick={() => setSelectedLeaveForReject(leave)}
                                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
                                >
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400 italic">
                                Action Completed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Lab & Resource Bookings */}
          {activeTab === 'LAB_BOOKINGS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
              <div className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <div
                    key={b.id}
                    className="p-6 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-[280px]">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-slate-900">{b.resourceName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
                          #{b.bookingCode}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-slate-600">
                        Requested by student: <strong>{b.userName}</strong> ({b.userRole})
                      </p>
                      <p className="text-xs text-slate-500">
                        Location: {b.location} · Purpose: <strong>{b.purpose}</strong> · Date: {b.date} ({b.startTime} - {b.endTime})
                      </p>
                      {b.additionalItems && b.additionalItems.length > 0 && (
                        <p className="text-xs text-purple-700 bg-purple-50 p-2 rounded-xl border border-purple-100 inline-block">
                          <strong>Requested Equipment Dependencies:</strong> {b.additionalItems.join(', ')}
                        </p>
                      )}
                      {b.requestChangesNote && (
                        <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                          <strong>Faculty Note:</strong> {b.requestChangesNote}
                        </p>
                      )}
                      {b.rejectionReason && (
                        <p className="text-xs text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <strong>Rejection Reason:</strong> {b.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {b.status === 'PENDING' || b.status === 'CHANGES_REQUESTED' ? (
                        <>
                          <button
                            onClick={() => approveBooking(b.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => setSelectedBookingForChanges(b)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
                          >
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                            <span>Request Changes</span>
                          </button>

                          <button
                            onClick={() => rejectBooking(b.id, 'Schedule conflict with department class.')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl text-xs flex items-center space-x-1 transition-all"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">Action Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Approve Leave Outpass Modal */}
      {selectedLeaveForApprove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Approve Outpass & Issue QR Pass</span>
              </h3>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p>
                Student: <strong>{selectedLeaveForApprove.userName}</strong> ({selectedLeaveForApprove.rollNumber})
              </p>
              <p>
                Departure: <strong>{selectedLeaveForApprove.departureTime}</strong> on {selectedLeaveForApprove.date}
              </p>
              <p>
                Destination: <strong>{selectedLeaveForApprove.destination}</strong> ({selectedLeaveForApprove.leaveTypeLabel})
              </p>
            </div>

            <form onSubmit={handleConfirmApproveLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Faculty Approval Remarks / Clearance Note
                </label>
                <textarea
                  rows={2}
                  value={approvalRemarks}
                  onChange={e => setApprovalRemarks(e.target.value)}
                  placeholder="e.g. Approved. Student permitted to leave campus."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                A digitally signed <strong>QR Gate Access Pass (Code: {selectedLeaveForApprove.passCode})</strong> will be issued immediately to the student for gate security clearance.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForApprove(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Approval & Issue QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Changes for Leave Modal */}
      {selectedLeaveForChanges && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>Request Clarification from Student</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Leave application for <strong>{selectedLeaveForChanges.userName}</strong> (#{selectedLeaveForChanges.passCode})
            </p>

            <form onSubmit={handleConfirmRequestChangesLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Modifications / Clarification Note
                </label>
                <textarea
                  rows={3}
                  value={leaveChangeNote}
                  onChange={e => setLeaveChangeNote(e.target.value)}
                  placeholder="e.g. Please obtain parent verbal confirmation or leave after 2:30 PM class."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForChanges(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Send Clarification Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Leave Modal */}
      {selectedLeaveForReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Leave Application</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Leave application for <strong>{selectedLeaveForReject.userName}</strong> (#{selectedLeaveForReject.passCode})
            </p>

            <form onSubmit={handleConfirmRejectLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  value={leaveRejectReason}
                  onChange={e => setLeaveRejectReason(e.target.value)}
                  placeholder="e.g. Mandatory laboratory examination scheduled this afternoon."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForReject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Changes for Lab Booking Modal */}
      {selectedBookingForChanges && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>Request Changes from Student</span>
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Booking <strong>#{selectedBookingForChanges.bookingCode}</strong> ({selectedBookingForChanges.resourceName}) requested by {selectedBookingForChanges.userName}.
            </p>

            <form onSubmit={handleSendRequestChangesBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comments / Required Modifications
                </label>
                <textarea
                  rows={3}
                  value={changesComment}
                  onChange={e => setChangesComment(e.target.value)}
                  placeholder="e.g. Please reduce the booking duration to 3 hours or select Block B."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForChanges(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Send Request Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Gate Pass Modal for Faculty Inspection */}
      <QrGatePassModal
        isOpen={!!selectedLeaveForQr}
        onClose={() => setSelectedLeaveForQr(null)}
        leave={selectedLeaveForQr}
      />
    </div>
  );
}
