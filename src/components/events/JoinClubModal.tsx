'use client';

import React, { useState } from 'react';
import { CampusClub, ClubRecruitment } from '@/types';
import {
  X,
  Sparkles,
  Send,
  User,
  FileText,
  Briefcase,
  Github,
  Globe,
  CheckCircle2
} from 'lucide-react';

interface JoinClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: CampusClub | null;
  recruitment: ClubRecruitment | null;
  onSubmit: (input: {
    clubId: string;
    roleApplied: string;
    statementOfPurpose: string;
    pastExperience?: string;
    portfolioOrGithub?: string;
  }) => void;
}

export const JoinClubModal: React.FC<JoinClubModalProps> = ({
  isOpen,
  onClose,
  club,
  recruitment,
  onSubmit,
}) => {
  const [statement, setStatement] = useState(
    'I have built full-stack projects and want to contribute actively to the club by mentoring juniors, organizing hackathons, and managing technical infra.'
  );
  const [experience, setExperience] = useState('2 years of React & Node.js, built 3 hackathon projects, familiar with Git & cloud.');
  const [links, setLinks] = useState('https://github.com/aryan-reddy · https://linkedin.com/in/aryan-reddy');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !club) return null;

  const roleName = recruitment?.roleTitle || 'Core Team Member';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    setSubmitting(true);
    onSubmit({
      clubId: club.id,
      roleApplied: roleName,
      statementOfPurpose: statement.trim(),
      pastExperience: experience.trim(),
      portfolioOrGithub: links.trim(),
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 block">
                Club Recruitment Application
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Apply for {roleName}
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                {club.name} ({club.shortCode})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              The club lead and faculty mentor will review your application. You will be notified regarding the interview round.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role Applied For
              </label>
              <input
                type="text"
                value={roleName}
                disabled
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Statement of Purpose / Why do you want to join? *
              </label>
              <textarea
                rows={3}
                value={statement}
                onChange={e => setStatement(e.target.value)}
                placeholder="Share your motivation, goals, and how you will contribute to the club..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Relevant Past Experience / Projects
              </label>
              <textarea
                rows={2}
                value={experience}
                onChange={e => setExperience(e.target.value)}
                placeholder="Mention hackathons, projects, design portfolios, or past club involvement..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Portfolio, GitHub or LinkedIn Links
              </label>
              <input
                type="text"
                value={links}
                onChange={e => setLinks(e.target.value)}
                placeholder="https://github.com/... or https://linkedin.com/..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
              />
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
