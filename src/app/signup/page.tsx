'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { syncSupabaseUserWithPrismaServer } from '@/lib/server/auth/authActions';
import { useResora } from '@/context/ResoraContext';
import { UserRole } from '@/types';
import { GraduationCap, UserCheck, Shield, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { setRole, setCurrentUser } = useResora();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setSuccessMsg(null);

    // Validation checks
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'STUDENT' },
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Sync new user with Prisma (secure self-service provisioning as STUDENT)
        const prismaUser = await syncSupabaseUserWithPrismaServer(
          data.user.id,
          data.user.email!,
          name
        );

        setRole('STUDENT');
        if (setCurrentUser) setCurrentUser(prismaUser);

        setSuccessMsg(`Account created successfully as Student! Redirecting to dashboard...`);
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 min-h-[620px]">
        {/* Left Form Section */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo Header */}
            <Link href="/" className="inline-flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold font-heading text-2xl shadow-glow">
                R
              </div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">RESORA</span>
            </Link>

            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-xs text-slate-500 mt-1">Join the smart campus intelligence ecosystem</p>

            {/* Student Account Role Badge */}
            <div className="mt-6 p-3 bg-brand-50 border border-brand-200/70 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-900">Student Account</div>
                  <div className="text-[11px] text-brand-700/80">Self-service registration provisions standard student access</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-200/60 text-brand-800 rounded-md">
                Standard
              </span>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSignup} className="mt-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Aryan Reddy"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@resora.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Right Campus Visual Hero */}
        <div className="bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
            alt="Campus Registration"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-brand-500/30 text-brand-300 rounded-full text-xs font-semibold mb-4 border border-brand-500/40">
              Student Registration
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight leading-tight">
              Join Your Campus.<br />Access Resources.<br />Unlock Potential.
            </h3>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              'Instant Access to Labs & Compute',
              'Real-Time Space Reservation & QR Pass',
              'Placement Readiness & Milestones',
              'Mentorship & Capstone Project Tools',
            ].map(item => (
              <div key={item} className="flex items-center space-x-2 text-xs font-medium text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 text-[11px] text-slate-400">
            © 2026 RESORA · Smart Campus Platform
          </div>
        </div>
      </div>
    </div>
  );
}
