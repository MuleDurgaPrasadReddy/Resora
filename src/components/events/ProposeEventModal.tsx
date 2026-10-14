'use client';

import React, { useState } from 'react';
import { CampusEvent, EventCategory, EventFormat } from '@/types';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Send,
  Building2,
  FileText
} from 'lucide-react';

interface ProposeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'registrationStatus' | 'isRegistered'>) => void;
}

export const ProposeEventModal: React.FC<ProposeEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [clubName, setClubName] = useState('Google Developer Groups (GDSC)');
  const [category, setCategory] = useState<EventCategory>('WORKSHOP');
  const [format, setFormat] = useState<EventFormat>('IN_PERSON');
  const [date, setDate] = useState('Nov 12, 2026');
  const [time, setTime] = useState('02:30 PM - 05:30 PM');
  const [venue, setVenue] = useState('Central Computing Lab 4');
  const [capacity, setCapacity] = useState(80);
  const [isOdApproved, setIsOdApproved] = useState(true);
  const [entryFee, setEntryFee] = useState<'FREE' | string>('FREE');
  const [eligibility, setEligibility] = useState('Open to All Engineering Students');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    onSubmit({
      title: title.trim(),
      tagline: tagline.trim() || 'Interactive Hands-on Campus Event',
      description: description.trim(),
      clubId: 'club_custom',
      clubName,
      category,
      categoryLabel: `${category.charAt(0) + category.slice(1).toLowerCase()} Event`,
      format,
      date,
      time,
      venue,
      capacity: Number(capacity) || 60,
      isOdApproved,
      odHours: isOdApproved ? 'Official Afternoon OD' : undefined,
      entryFee,
      eligibility,
      facultyCoordinator: {
        name: 'Dr. S. Rao',
        department: 'CSE Department',
      },
      studentCoordinators: [
        { name: 'Student Coordinator', role: 'Event Lead', phone: '+91 98765 11223' },
      ],
      perks: ['Certificate of Participation', 'OD Gate Pass Clearance'],
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/90 border border-purple-400/40 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-purple-100" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                  Campus Initiative Desk
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Propose a New Campus Event
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
          <p className="text-xs text-purple-200/90 mt-2">
            Submit your event concept for club sponsorship and faculty authorization. Approved events are published on the campus calendar.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Event Proposal Submitted!</h4>
            <p className="text-xs text-slate-500">
              Your proposal has been routed to the Faculty Advisory Committee and Club President for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Flutter Mobile App Development Bootcamp"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organizing Club / Society
                </label>
                <select
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                >
                  <option value="Google Developer Groups (GDSC)">Google Developer Groups (GDSC)</option>
                  <option value="Robotics & Automation Society (RAS)">Robotics & Automation Society (RAS)</option>
                  <option value="Algo & Competitive Coding Club (AC3)">Algo & Competitive Coding Club (AC3)</option>
                  <option value="E-Cell Resora">E-Cell Resora</option>
                  <option value="Crescendo Cultural Guild">Crescendo Cultural Guild</option>
                  <option value="PixelCraft Media Society">PixelCraft Media Society</option>
                  <option value="Student Council & Independent">Student Council & Independent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EventCategory)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                >
                  <option value="WORKSHOP">Workshop</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="TECHNICAL">Technical Masterclass</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="CULTURAL">Cultural Event</option>
                  <option value="SEMINAR">Seminar / Guest Talk</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Capacity
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requested Venue / Lab
              </label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Central Auditorium or Innovation Lab"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Description & Learning Outcomes *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what will happen, who will teach/mentor, and why this is valuable for students..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="odCheck"
                checked={isOdApproved}
                onChange={e => setIsOdApproved(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="odCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Request Official On-Duty (OD) Attendance Sanction for Attendees
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Proposal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
