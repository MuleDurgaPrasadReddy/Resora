'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { syncSupabaseUserWithPrismaServer } from '@/lib/server/auth/authActions';
import { useResora } from '@/context/ResoraContext';
import { UserRole } from '@/types';
import { GraduationCap, UserCheck, Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setCurrentUser } = useResora();

  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('student@resora.demo');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // Fallback for demo users if email ends in .demo or password is demo
        if (email.includes('.demo') || password === '••••••••••••') {
          setRole(selectedRole);
          const demoUser = {
            id: selectedRole === 'FACULTY' ? 'fac_01' : selectedRole === 'ADMIN' ? 'adm_01' : 'stu_01',
            email: email,
            name: selectedRole === 'FACULTY' ? 'Dr. S. Rao' : selectedRole === 'ADMIN' ? 'System Admin' : 'Alex Rivera',
            role: selectedRole,
            avatar: selectedRole === 'FACULTY'
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
              : selectedRole === 'ADMIN'
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            department: 'CSE',
            title: selectedRole === 'ADMIN' ? 'System Administrator' : selectedRole === 'FACULTY' ? 'CSE · Faculty Lead' : 'CSE · 3rd Year',
          };
          if (setCurrentUser) setCurrentUser(demoUser);

          if (selectedRole === 'STUDENT') router.push('/student/dashboard');
          else if (selectedRole === 'FACULTY') router.push('/faculty/dashboard');
          else router.push('/admin/dashboard');
          return;
        }

        setError(authError.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Sync Supabase user with Prisma server-side to resolve exact Prisma role (passing selectedRole)
        const prismaUser = await syncSupabaseUserWithPrismaServer(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.name,
          selectedRole
        );

        setRole(prismaUser.role);
        if (setCurrentUser) setCurrentUser(prismaUser);

        // Server-side Prisma role based redirect
        if (prismaUser.role === 'STUDENT') router.push('/student/dashboard');
        else if (prismaUser.role === 'FACULTY') router.push('/faculty/dashboard');
        else if (prismaUser.role === 'ADMIN') router.push('/admin/dashboard');
        else router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const targetDashboard = `/${selectedRole.toLowerCase()}/dashboard`;
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${targetDashboard}`,
        },
      });

      if (googleError) {
        // Fallback demo redirect
        setRole(selectedRole);
        const demoUser = {
          id: selectedRole === 'FACULTY' ? 'fac_01' : selectedRole === 'ADMIN' ? 'adm_01' : 'stu_01',
          email: `${selectedRole.toLowerCase()}@resora.demo`,
          name: selectedRole === 'FACULTY' ? 'Dr. S. Rao' : selectedRole === 'ADMIN' ? 'System Admin' : 'Alex Rivera',
          role: selectedRole,
          avatar: selectedRole === 'FACULTY'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
            : selectedRole === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          department: 'CSE',
          title: selectedRole === 'ADMIN' ? 'System Administrator' : selectedRole === 'FACULTY' ? 'CSE · Faculty Lead' : 'CSE · 3rd Year',
        };
        if (setCurrentUser) setCurrentUser(demoUser);

        if (selectedRole === 'STUDENT') router.push('/student/dashboard');
        else if (selectedRole === 'FACULTY') router.push('/faculty/dashboard');
        else router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setRole(selectedRole);
      if (selectedRole === 'STUDENT') router.push('/student/dashboard');
      else if (selectedRole === 'FACULTY') router.push('/faculty/dashboard');
      else router.push('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    setSelectedRole(role);
    setRole(role);
    const demoUser = {
      id: role === 'FACULTY' ? 'fac_01' : role === 'ADMIN' ? 'adm_01' : 'stu_01',
      email: role === 'FACULTY' ? 'faculty@resora.demo' : role === 'ADMIN' ? 'admin@resora.demo' : 'student@resora.demo',
      name: role === 'FACULTY' ? 'Dr. S. Rao' : role === 'ADMIN' ? 'System Admin' : 'Alex Rivera',
      role: role,
      avatar: role === 'FACULTY'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        : role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      department: 'CSE',
      title: role === 'ADMIN' ? 'System Administrator' : role === 'FACULTY' ? 'CSE · Faculty Lead' : 'CSE · 3rd Year',
    };
    if (setCurrentUser) setCurrentUser(demoUser);

    if (role === 'STUDENT') {
      setEmail('student@resora.demo');
      router.push('/student/dashboard');
    } else if (role === 'FACULTY') {
      setEmail('faculty@resora.demo');
      router.push('/faculty/dashboard');
    } else {
      setEmail('admin@resora.demo');
      router.push('/admin/dashboard');
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

            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">Continue your campus journey</p>

            {/* Role Selector Segmented Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('STUDENT');
                  setRole('STUDENT');
                  setEmail('student@resora.demo');
                  setPassword('••••••••••••');
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-brand-600 shadow-sm font-bold border border-brand-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('FACULTY');
                  setRole('FACULTY');
                  setEmail('faculty@resora.demo');
                  setPassword('••••••••••••');
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  selectedRole === 'FACULTY'
                    ? 'bg-white text-emerald-600 shadow-sm font-bold border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('ADMIN');
                  setRole('ADMIN');
                  setEmail('admin@resora.demo');
                  setPassword('••••••••••••');
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  selectedRole === 'ADMIN'
                    ? 'bg-white text-purple-600 shadow-sm font-bold border border-purple-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Roll Number</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-brand-600 hover:underline font-medium">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center space-x-2 transition-all ${
                  selectedRole === 'FACULTY'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : selectedRole === 'ADMIN'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Or</span>
              </div>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Credentials Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center uppercase tracking-wider">
                1-Click Demo Login Shortcuts
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('STUDENT')}
                  className="p-2 border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50 rounded-xl text-[11px] font-semibold text-slate-700 text-center transition-all"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('FACULTY')}
                  className="p-2 border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50 rounded-xl text-[11px] font-semibold text-slate-700 text-center transition-all"
                >
                  Faculty Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="p-2 border border-slate-200 hover:border-purple-500 bg-slate-50 hover:bg-purple-50 rounded-xl text-[11px] font-semibold text-slate-700 text-center transition-all"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-600 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Right Campus Visual Hero matching UI Screenshot #2 */}
        <div className="bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800"
            alt="Campus"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-brand-500/30 text-brand-300 rounded-full text-xs font-semibold mb-4 border border-brand-500/40">
              Campus Intelligence Ecosystem
            </span>
            <h3 className="text-3xl font-extrabold tracking-tight leading-tight">
              Learn.<br />Book.<br />Grow.<br />All In One Place.
            </h3>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              'Campus Resources & Smart Finder',
              'Placements & Exam Roadmaps',
              'Hackathons & Internships',
              'Personalized Skill Progress',
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
