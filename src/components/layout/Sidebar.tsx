'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { DEMO_USERS } from '@/lib/mockData';
import { UserRole } from '@/types';
import {
  LayoutGrid,
  GraduationCap,
  CalendarCheck2,
  Ticket,
  QrCode,
  Rocket,
  BrainCircuit,
  MonitorPlay,
  LineChart,
  Sparkles,
  MessageSquareHeart,
  BookOpen,
  Users2,
  FolderGit2,
  Compass,
  BarChart3,
  AlertTriangle,
  CheckSquare,
  Building2,
  Users,
  Wrench,
  ShieldAlert,
  Share2,
  FileText,
  Settings,
  LogOut,
  ChevronUp,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useResora();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const inferredRole: UserRole = pathname?.startsWith('/admin')
    ? 'ADMIN'
    : pathname?.startsWith('/faculty')
      ? 'FACULTY'
      : 'STUDENT';

  const role: UserRole = currentUser?.role || inferredRole;
  const user = currentUser || DEMO_USERS[role] || DEMO_USERS.STUDENT;

  interface SidebarNavLink {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    color?: string;
  }

  const studentLinks: SidebarNavLink[] = [
    {
      label: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutGrid,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-400/40',
    },
    {
      label: 'Academics',
      href: '/student/academics',
      icon: GraduationCap,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 group-hover:border-sky-400/40',
    },
    {
      label: 'Attendance',
      href: '/student/attendance',
      icon: CalendarCheck2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-400/40',
    },
    {
      label: 'Bookings & Permissions',
      href: '/student/resources',
      icon: Ticket,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/40',
    },
    {
      label: 'My Bookings & Passes',
      href: '/student/bookings',
      icon: QrCode,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 group-hover:border-teal-400/40',
    },
    {
      label: 'Opportunities',
      href: '/student/opportunities',
      icon: Rocket,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-400/40',
    },
    {
      label: 'Preparation',
      href: '/student/preparation',
      icon: BrainCircuit,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-400/40',
    },
    {
      label: 'LMS',
      href: '/student/lms',
      icon: MonitorPlay,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/40',
    },
    {
      label: 'My Progress',
      href: '/student/progress',
      icon: LineChart,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-400/40',
    },
    {
      label: 'Projects',
      href: '/student/projects',
      icon: FolderGit2,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 group-hover:border-teal-400/40',
    },
    {
      label: 'Career Roadmap',
      href: '/student/roadmap',
      icon: Compass,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/40',
    },
    {
      label: 'Events & Clubs',
      href: '/student/events-clubs',
      icon: Sparkles,
      color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20 group-hover:border-fuchsia-400/40',
    },
    {
      label: 'Feedback',
      href: '/student/feedback',
      icon: MessageSquareHeart,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/40',
    },
  ];

  const facultyLinks: SidebarNavLink[] = [
    {
      label: 'Dashboard',
      href: '/faculty/dashboard',
      icon: LayoutGrid,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-400/40',
    },
    {
      label: 'Approvals',
      href: '/faculty/approvals',
      icon: CheckSquare,
      badge: '7',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/40',
    },
    {
      label: 'My Classes',
      href: '/faculty/classes',
      icon: BookOpen,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 group-hover:border-sky-400/40',
    },
    {
      label: 'Student Mentoring',
      href: '/faculty/students',
      icon: Users2,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-400/40',
    },
    {
      label: 'Student Feedback',
      href: '/faculty/feedback',
      icon: MessageSquareHeart,
      badge: '4.8 ★',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-400/40',
    },
    {
      label: 'Opportunities',
      href: '/faculty/opportunities',
      icon: Rocket,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-400/40',
    },
    {
      label: 'LMS',
      href: '/student/lms',
      icon: MonitorPlay,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/40',
    },
    {
      label: 'Department Analytics',
      href: '/faculty/analytics',
      icon: BarChart3,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-400/40',
    },
    {
      label: 'Issues',
      href: '/faculty/issues',
      icon: AlertTriangle,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-400/40',
    },
  ];

  const adminLinks: SidebarNavLink[] = [
    {
      label: 'Command Center',
      href: '/admin/dashboard',
      icon: LayoutGrid,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-400/40',
    },
    {
      label: 'Resource Management',
      href: '/admin/resources',
      icon: Building2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-400/40',
    },
    {
      label: 'Bookings & Approvals',
      href: '/admin/bookings',
      icon: CalendarCheck2,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 group-hover:border-teal-400/40',
    },
    {
      label: 'Users & Access',
      href: '/admin/users',
      icon: Users,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20 group-hover:border-sky-400/40',
    },
    {
      label: 'Maintenance',
      href: '/admin/maintenance',
      icon: Wrench,
      badge: 'Issues',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:border-orange-400/40',
    },
    {
      label: 'Opportunities',
      href: '/admin/opportunities',
      icon: Rocket,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-400/40',
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-400/40',
    },
    {
      label: 'Policies & Rules',
      href: '/admin/policies',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-400/40',
    },
    {
      label: 'Resource Sharing',
      href: '/admin/sharing',
      icon: Share2,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-400/40',
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-400/40',
    },
    {
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20 group-hover:border-slate-400/40',
    },
  ];

  const links = React.useMemo(() => {
    return role === 'ADMIN' ? adminLinks : role === 'FACULTY' ? facultyLinks : studentLinks;
  }, [role]);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    if (logout) await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full min-h-screen shrink-0 select-none relative">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" prefetch={true} className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold font-heading text-xl shadow-glow">
            R
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight group-hover:text-brand-400 transition-colors">
              RESORA
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              {role} Workspace
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>

        {links.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/25 font-semibold border border-brand-400/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all duration-200 border shrink-0 ${
                    isActive
                      ? 'bg-white/20 border-white/30 text-white shadow-sm'
                      : item.color
                        ? `${item.color} group-hover:scale-105 shadow-sm`
                        : 'bg-slate-800/80 border-slate-750 text-slate-400 group-hover:text-white group-hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" strokeWidth={2} />
                </div>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'AI'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-brand-500/20 text-brand-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card at Bottom with Logout Popup */}
      <div className="p-3 m-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 relative">
        {/* Profile Popup Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-850 border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-1 py-1 border-b border-slate-700/60 pb-2">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/80 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Profile Card Click Target */}
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={user.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.title || `${role} · Resora`}</p>
          </div>
          <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </aside>
  );
};

