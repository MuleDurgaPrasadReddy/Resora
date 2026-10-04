'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useResora } from '@/context/ResoraContext';
import { StatusBadge } from '@/components/common/Badge';
import { MultiStepBookingModal } from '@/components/booking/MultiStepBookingModal';
import { CalendarCheck, QrCode, Building2, Plus } from 'lucide-react';

export default function StudentBookingsPage() {
  const { bookings } = useResora();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Reservation History</span>
              <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
                My Bookings & Access Passes
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                View status, approval progress, and QR code access passes
              </p>
            </div>

            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="divide-y divide-slate-100">
              {bookings.map(b => (
                <div key={b.id} className="p-5 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4 flex-1 min-w-[280px]">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{b.resourceName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
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
                        <span>View Pass</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MultiStepBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
