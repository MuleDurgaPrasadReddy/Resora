'use client';

import React from 'react';
import { CampusClub, ClubRecruitment } from '@/types';
import {
  X,
  Users,
  Award,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Send,
  Star
} from 'lucide-react';

interface ClubDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: CampusClub | null;
  onJoinToggle: (clubId: string) => void;
  onApplyRole: (recruitment: ClubRecruitment) => void;
}

export const ClubDetailsModal: React.FC<ClubDetailsModalProps> = ({
  isOpen,
  onClose,
  club,
  onJoinToggle,
  onApplyRole,
}) => {
  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Hero Header with Club Gradient */}
        <div className={`bg-gradient-to-r ${club.bannerGradient} text-white p-6 relative overflow-hidden`}>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider">
                  {club.categoryLabel}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/30 border border-amber-300/40 text-amber-200 text-[10px] font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{club.rating} · Tier 1 Official</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {club.name}
              </h2>
              <p className="text-xs text-white/90 font-medium">
                &quot;{club.tagline}&quot;
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-white/20 text-xs text-white/90">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4" />
              <span><strong>{club.memberCount}</strong> Active Members</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>Est. {club.foundedYear}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* About Club */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              About the Community
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {club.description}
            </p>
          </div>

          {/* Regular Meetup & Schedule */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Regular Meetups & Lab Sessions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] block">Timing</span>
                <strong className="text-slate-800">{club.regularMeetup.frequency} ({club.regularMeetup.time})</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Location</span>
                <strong className="text-slate-800">{club.regularMeetup.location}</strong>
              </div>
            </div>
          </div>

          {/* Key Achievements */}
          {club.achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Recent Major Achievements</span>
              </h3>
              <div className="space-y-1.5">
                {club.achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Recruitment Drives */}
          {club.activeRecruitments && club.activeRecruitments.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Active Core Team Recruitments</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  {club.activeRecruitments.length} Roles Open
                </span>
              </div>

              <div className="space-y-2.5">
                {club.activeRecruitments.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-bold text-purple-950">{rec.roleTitle}</strong>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-md">
                          {rec.openings} Openings
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800 line-clamp-1">{rec.description}</p>
                      <span className="text-[10px] text-slate-500 block">
                        Eligibility: {rec.eligibility} · Deadline: <strong>{rec.deadline}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => onApplyRole(rec)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Apply for Role
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leadership & Faculty Mentorship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Faculty Mentor</span>
              <strong className="text-slate-800 text-xs block">{club.facultyMentor.name}</strong>
              <p className="text-[11px] text-slate-500">{club.facultyMentor.designation} · {club.facultyMentor.department}</p>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Student President</span>
              <strong className="text-slate-800 text-xs block">{club.president.name} ({club.president.year})</strong>
              <p className="text-[11px] text-slate-500 font-mono">{club.president.email}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            {club.isJoined ? (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{club.userRole || 'Joined as Member'}</span>
              </span>
            ) : (
              <span className="text-slate-400">Open for campus student membership</span>
            )}
          </div>

          <button
            onClick={() => onJoinToggle(club.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              club.isJoined
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {club.isJoined ? 'Leave Club' : 'Join as Active Member'}
          </button>
        </div>
      </div>
    </div>
  );
};
