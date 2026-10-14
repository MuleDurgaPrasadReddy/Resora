'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, User, Resource, Booking, MaintenanceIssue, AuditLog, Opportunity, OpportunityRecommendation, StudentProject, BookingStatus, IssueStatus, LeavePermission, LeaveType, CampusEvent, CampusClub, EventRegistration, ClubMembershipApplication } from '@/types';
import { DEMO_USERS, MOCK_RESOURCES, INITIAL_BOOKINGS, INITIAL_ISSUES, MOCK_OPPORTUNITIES, STUDENT_PROJECTS_LIST, INITIAL_PROGRESS, INITIAL_AUDIT_LOGS, INITIAL_LEAVE_PERMISSIONS, INITIAL_CAMPUS_CLUBS, INITIAL_CAMPUS_EVENTS, INITIAL_EVENT_REGISTRATIONS } from '@/lib/mockData';

interface SmartMatchResult {
  resource: Resource;
  matchScore: number;
  reasons: string[];
  isAvailable: boolean;
  conflictReason?: string;
}

interface BookingRequestInput {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: 'Class' | 'Project' | 'Research' | 'Hackathon' | 'Other';
  additionalItems?: string[];
  numberOfStudents?: number;
}

interface BookingEngineResult {
  success: boolean;
  booking?: Booking;
  error?: string;
  alternatives?: Resource[];
}

import { createClient } from '@/lib/supabase/client';

export interface ApplyForLeaveInput {
  leaveType: LeaveType;
  leaveTypeLabel: string;
  reason: string;
  destination: string;
  date: string;
  departureTime: string;
  expectedReturnTime?: string;
  isFullDayOrAfternoon: 'AFTERNOON' | 'EARLY_EXIT' | 'FULL_DAY';
  parentPhone: string;
  parentName?: string;
  studentPhone?: string;
}

interface ResoraContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  resources: Resource[];
  bookings: Booking[];
  leavePermissions: LeavePermission[];
  issues: MaintenanceIssue[];
  auditLogs: AuditLog[];
  opportunities: Opportunity[];
  projects: StudentProject[];
  campusEvents: CampusEvent[];
  campusClubs: CampusClub[];
  eventRegistrations: EventRegistration[];
  clubApplications: ClubMembershipApplication[];
  progress: typeof INITIAL_PROGRESS;
  notifications: { id: string; title: string; message: string; date: string; read: boolean }[];

  // Actions
  createBooking: (input: BookingRequestInput) => BookingEngineResult;
  approveBooking: (bookingId: string, notes?: string) => void;
  rejectBooking: (bookingId: string, reason?: string) => void;
  requestChangesBooking: (bookingId: string, commentNote: string) => void;
  checkInBooking: (bookingCode: string) => { success: boolean; message: string; booking?: Booking };
  applyForLeave: (input: ApplyForLeaveInput) => { success: boolean; message: string; leave?: LeavePermission };
  approveLeavePermission: (leaveId: string, remarks?: string) => void;
  rejectLeavePermission: (leaveId: string, reason: string) => void;
  requestChangesLeavePermission: (leaveId: string, note: string) => void;
  registerForEvent: (eventId: string) => { success: boolean; message: string; registration?: EventRegistration };
  cancelEventRegistration: (registrationId: string) => void;
  joinClub: (clubId: string) => void;
  applyForClubRole: (input: { clubId: string; roleApplied: string; statementOfPurpose: string; pastExperience?: string; portfolioOrGithub?: string }) => { success: boolean; message: string };
  proposeNewEvent: (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'registrationStatus' | 'isRegistered'>) => void;
  proposeNewClub: (clubData: Omit<CampusClub, 'id' | 'memberCount' | 'rating' | 'tier' | 'isJoined'>) => void;
  toggleMaintenance: (resourceId: string, reason?: string) => void;
  resolveIssue: (issueId: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  enableResourceSharing: (resourceId: string, targetDepartments: string[]) => void;
  toggleSaveOpportunity: (oppId: string) => void;
  applyToOpportunity: (oppId: string) => void;
  addOpportunity: (oppData: Omit<Opportunity, 'id'>) => void;
  updateOpportunity: (oppId: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (oppId: string) => void;
  recommendOpportunity: (oppId: string, customMessage?: string) => { success: boolean; message: string };
  removeRecommendation: (oppId: string) => void;
  updateRecommendationMessage: (oppId: string, newMessage: string) => void;
  addProject: (projectData: Omit<StudentProject, 'id'>) => void;
  deleteProject: (projectId: string) => void;
  parseSmartQuery: (queryText: string) => {
    extractedRequirements: { people: number; durationHours: number; wifi: boolean; arduino: boolean; projector: boolean };
    matches: SmartMatchResult[];
  };
}

const ResoraContext = createContext<ResoraContextType | undefined>(undefined);

const STORAGE_KEY = 'resora_campus_mvp_state_v3';

export const ResoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.STUDENT);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [leavePermissions, setLeavePermissions] = useState<LeavePermission[]>(INITIAL_LEAVE_PERMISSIONS);
  const [issues, setIssues] = useState<MaintenanceIssue[]>(INITIAL_ISSUES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [projects, setProjects] = useState<StudentProject[]>(STUDENT_PROJECTS_LIST);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>(INITIAL_CAMPUS_EVENTS);
  const [campusClubs, setCampusClubs] = useState<CampusClub[]>(INITIAL_CAMPUS_CLUBS);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(INITIAL_EVENT_REGISTRATIONS);
  const [clubApplications, setClubApplications] = useState<ClubMembershipApplication[]>([]);
  const [progress] = useState(INITIAL_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Booking Approved',
      message: 'Your request for Innovation Lab today 2 PM - 6 PM is approved!',
      date: '10 mins ago',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Hackathon Deadline',
      message: 'Smart India Hackathon registrations close in 3 days.',
      date: '2 hours ago',
      read: true,
    },
  ]);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.resources) setResources(parsed.resources);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.leavePermissions && Array.isArray(parsed.leavePermissions)) {
          const storedIds = new Set(parsed.leavePermissions.map((l: LeavePermission) => l.id));
          const missingDefaults = INITIAL_LEAVE_PERMISSIONS.filter(d => !storedIds.has(d.id));
          setLeavePermissions([...parsed.leavePermissions, ...missingDefaults]);
        }
        if (parsed.issues) setIssues(parsed.issues);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.projects && Array.isArray(parsed.projects)) setProjects(parsed.projects);
        if (parsed.opportunities && Array.isArray(parsed.opportunities)) {
          const storedMap = new Map<string, Opportunity>(parsed.opportunities.map((o: Opportunity) => [o.id, o]));
          const merged = MOCK_OPPORTUNITIES.map(mock => {
            const stored = storedMap.get(mock.id);
            if (stored) {
              return {
                ...mock,
                saved: stored.saved ?? mock.saved,
                applied: stored.applied ?? mock.applied,
                recommendations: (stored.recommendations && stored.recommendations.length > 0)
                  ? stored.recommendations
                  : mock.recommendations,
              };
            }
            return mock;
          });
          const mockIds = new Set(MOCK_OPPORTUNITIES.map(m => m.id));
          const extraUserOpps = parsed.opportunities.filter((o: Opportunity) => !mockIds.has(o.id));
          setOpportunities([...merged, ...extraUserOpps]);
        }
      }
    } catch (e) {
      console.error('Failed to load state from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist state to localStorage on state changes (debounced to avoid blocking UI thread on clicks)
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            resources,
            bookings,
            leavePermissions,
            issues,
            auditLogs,
            opportunities,
            projects,
          })
        );
      } catch (e) {
        console.error('Failed to save state to storage', e);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [resources, bookings, leavePermissions, issues, auditLogs, opportunities, isLoaded]);

  // Real-time Cross-Tab & Window State Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.resources) setResources(parsed.resources);
          if (parsed.bookings) setBookings(parsed.bookings);
          if (parsed.leavePermissions) setLeavePermissions(parsed.leavePermissions);
          if (parsed.issues) setIssues(parsed.issues);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
          if (parsed.projects && Array.isArray(parsed.projects)) setProjects(parsed.projects);
          if (parsed.opportunities && Array.isArray(parsed.opportunities)) setOpportunities(parsed.opportunities);
        } catch (err) {
          console.error('Failed to sync state from storage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setRole = (role: UserRole | string) => {
    const normalizedRole = (role ? role.toString().toUpperCase() : 'STUDENT') as UserRole;
    setCurrentRole(normalizedRole);
    const demoUser = DEMO_USERS[normalizedRole] || DEMO_USERS.STUDENT;
    setCurrentUser(demoUser);
  };

  const safeSetCurrentUser = (user: User) => {
    if (!user) {
      setCurrentUser(DEMO_USERS.STUDENT);
      return;
    }
    const safeRole = (user.role ? (user.role as string).toUpperCase() : 'STUDENT') as UserRole;
    const fallbackUser = DEMO_USERS[safeRole] || DEMO_USERS.STUDENT;
    setCurrentUser({
      ...fallbackUser,
      ...user,
      role: safeRole,
    });
    setCurrentRole(safeRole);
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentRole('STUDENT');
    setCurrentUser(DEMO_USERS.STUDENT);
  };

  // Helper to log audit actions
  const logAudit = (action: string, resource: string, status: string, details?: string) => {
    const activeUser = currentUser || DEMO_USERS.STUDENT;
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: activeUser.name,
      role: activeUser.role,
      action,
      resource,
      status,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Deterministic Booking Engine with Dependency Graph Verification
  const createBooking = (input: BookingRequestInput): BookingEngineResult => {
    const targetResource = resources.find(r => r.id === input.resourceId);

    if (!targetResource) {
      return { success: false, error: 'Resource not found in campus database.' };
    }

    // 1. Maintenance Check
    if (targetResource.status === 'MAINTENANCE') {
      return {
        success: false,
        error: `${targetResource.name} is currently under maintenance and cannot be reserved.`,
        alternatives: resources.filter(r => r.type === targetResource.type && r.status === 'AVAILABLE' && r.id !== targetResource.id),
      };
    }

    // 2. Capacity Check
    if (input.numberOfStudents && input.numberOfStudents > targetResource.capacity) {
      return {
        success: false,
        error: `Requested capacity (${input.numberOfStudents}) exceeds ${targetResource.name} limit of ${targetResource.capacity}.`,
      };
    }

    // 3. Time Conflict & Overlap Check
    const overlapping = bookings.find(b => {
      if (b.resourceId !== input.resourceId) return false;
      if (b.date !== input.date) return false;
      if (['REJECTED', 'CANCELLED', 'NO_SHOW'].includes(b.status)) return false;

      // Check time overlap: (StartA < EndB) AND (EndA > StartB)
      return input.startTime < b.endTime && input.endTime > b.startTime;
    });

    if (overlapping) {
      const alternatives = resources.filter(
        r => r.type === targetResource.type && r.id !== targetResource.id && r.status === 'AVAILABLE'
      );
      return {
        success: false,
        error: `Resource unavailable for this time window. Overlaps with an existing reservation (${overlapping.startTime} - ${overlapping.endTime}).`,
        alternatives,
      };
    }

    // 4. Dependency Check
    if (targetResource.requiredDependencies && targetResource.requiredDependencies.length > 0) {
      for (const depName of targetResource.requiredDependencies) {
        const depRes = resources.find(r => r.name.toLowerCase().includes(depName.toLowerCase()));
        if (depRes && depRes.status === 'MAINTENANCE') {
          const alternatives = resources.filter(r => r.type === targetResource.type && r.status === 'AVAILABLE' && r.id !== targetResource.id);
          return {
            success: false,
            error: `Required dependency item "${depRes.name}" is currently under maintenance.`,
            alternatives,
          };
        }
      }
    }

    // Success! Generate Booking
    const bookingCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `bkg_${Date.now()}`,
      bookingCode,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      resourceId: targetResource.id,
      resourceName: targetResource.name,
      resourceType: targetResource.type,
      location: `${targetResource.building} · ${targetResource.floor}`,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      purpose: input.purpose,
      status: currentUser.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
      additionalItems: input.additionalItems,
      qrCodeUrl: `${bookingCode}-${currentUser.role}-${targetResource.name.replace(/\s+/g, '-').toUpperCase()}`,
      approvalStep: currentUser.role === 'ADMIN' ? 'Approved' : 'Faculty',
    };

    setBookings(prev => [newBooking, ...prev]);

    logAudit(
      `Requested Booking #${bookingCode}`,
      targetResource.name,
      currentUser.role === 'ADMIN' ? 'Approved' : 'Pending',
      `Date: ${input.date}, Time: ${input.startTime}-${input.endTime}`
    );

    return { success: true, booking: newBooking };
  };

  const approveBooking = (bookingId: string, notes?: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          logAudit(`Approved Booking #${b.bookingCode}`, b.resourceName, 'Approved', notes || 'Approved by faculty');

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: 'Booking Approved ✓',
              message: `Your booking #${b.bookingCode} for ${b.resourceName} has been approved!`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return { ...b, status: 'APPROVED' as BookingStatus, approvalStep: 'Approved' };
        }
        return b;
      })
    );
  };

  const rejectBooking = (bookingId: string, reason?: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          logAudit(`Rejected Booking #${b.bookingCode}`, b.resourceName, 'Rejected', reason || 'Slot conflict');

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: 'Booking Rejected ✗',
              message: `Your booking #${b.bookingCode} for ${b.resourceName} was rejected: ${reason || 'Not approved by department.'}`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return { ...b, status: 'REJECTED' as BookingStatus, rejectionReason: reason || 'Not approved by department.' };
        }
        return b;
      })
    );
  };

  const requestChangesBooking = (bookingId: string, commentNote: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          logAudit(`Requested Changes for #${b.bookingCode}`, b.resourceName, 'Changes Requested', commentNote);

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: 'Changes Requested ⚠️',
              message: `Faculty requested modifications for booking #${b.bookingCode} (${b.resourceName}): "${commentNote}"`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return { ...b, status: 'CHANGES_REQUESTED' as BookingStatus, requestChangesNote: commentNote };
        }
        return b;
      })
    );
  };

  const checkInBooking = (bookingCode: string) => {
    const cleanCode = bookingCode.trim().toUpperCase();
    const booking = bookings.find(b => b.bookingCode.toUpperCase() === cleanCode || b.qrCodeUrl?.includes(cleanCode));

    if (!booking) {
      return { success: false, message: 'Invalid or unknown QR Booking Pass Code.' };
    }

    if (booking.status === 'CHECKED_IN') {
      return { success: true, message: `User already checked in for ${booking.resourceName}. Access Pass active!`, booking };
    }

    if (booking.status !== 'APPROVED') {
      return { success: false, message: `Booking status is currently "${booking.status}". Only APPROVED bookings can check in.` };
    }

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings(prev =>
      prev.map(b => (b.id === booking.id ? { ...b, checkedInAt: checkInTime, status: 'CHECKED_IN' as BookingStatus } : b))
    );

    setResources(prev =>
      prev.map(r => (r.id === booking.resourceId ? { ...r, status: 'IN_USE' } : r))
    );

    logAudit(`Checked in via QR Scanner`, booking.resourceName, 'Checked-In', `Booking #${booking.bookingCode} by ${booking.userName}`);

    return {
      success: true,
      message: `Check-in Verified! ${booking.userName} checked into ${booking.resourceName} successfully.`,
      booking,
    };
  };

  const applyForLeave = (input: ApplyForLeaveInput) => {
    const passCode = `OUT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLeave: LeavePermission = {
      id: `leave_${Date.now()}`,
      passCode,
      userId: currentUser.id,
      userName: currentUser.name,
      rollNumber: currentUser.rollNumber || 'CSE-2023-042',
      department: currentUser.department || 'CSE',
      academicYear: currentUser.academicYear || 3,
      academicYearLabel: currentUser.academicYearLabel || '3rd Year',
      studentPhone: input.studentPhone || '+91 98765 11223',
      parentPhone: input.parentPhone,
      parentName: input.parentName,
      leaveType: input.leaveType,
      leaveTypeLabel: input.leaveTypeLabel,
      reason: input.reason,
      destination: input.destination,
      date: input.date,
      departureTime: input.departureTime,
      expectedReturnTime: input.expectedReturnTime || 'Not Returning (Going Home)',
      isFullDayOrAfternoon: input.isFullDayOrAfternoon,
      status: 'PENDING',
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
    };

    setLeavePermissions(prev => [newLeave, ...prev]);

    logAudit(
      `Requested Leave Permission #${passCode}`,
      `Campus Outpass (${input.leaveTypeLabel})`,
      'Pending',
      `Date: ${input.date}, Departure: ${input.departureTime}, Reason: ${input.reason}`
    );

    return {
      success: true,
      message: `Leave permission application #${passCode} submitted successfully to faculty advisor for review.`,
      leave: newLeave,
    };
  };

  const approveLeavePermission = (leaveId: string, remarks?: string) => {
    setLeavePermissions(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          const approvedRemarks = remarks || 'Approved for campus departure.';
          const qrPass = `PASS-RESORA-${l.passCode}-SEC`;
          logAudit(`Approved Leave Outpass #${l.passCode}`, `Gate Pass (${l.userName})`, 'Approved', approvedRemarks);

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: `Leave Outpass #${l.passCode} Approved!`,
              message: `Your permission to leave campus at ${l.departureTime} has been approved by ${currentUser.name}. Your digital QR gate pass is ready.`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return {
            ...l,
            status: 'APPROVED' as const,
            approvedByFacultyId: currentUser.id,
            approvedByFacultyName: currentUser.name,
            approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
            approvalRemarks: approvedRemarks,
            qrPassCode: qrPass,
            qrIssuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
            validGate: 'Campus Main Gate & Gate 2',
          };
        }
        return l;
      })
    );
  };

  const rejectLeavePermission = (leaveId: string, reason: string) => {
    setLeavePermissions(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          logAudit(`Rejected Leave Outpass #${l.passCode}`, `Gate Pass (${l.userName})`, 'Rejected', reason);

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: `Leave Outpass #${l.passCode} Rejected`,
              message: `Reason: ${reason}`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return {
            ...l,
            status: 'REJECTED' as const,
            rejectionReason: reason,
          };
        }
        return l;
      })
    );
  };

  const requestChangesLeavePermission = (leaveId: string, note: string) => {
    setLeavePermissions(prev =>
      prev.map(l => {
        if (l.id === leaveId) {
          logAudit(`Requested Clarification for Leave #${l.passCode}`, `Gate Pass (${l.userName})`, 'Changes Requested', note);

          setNotifications(n => [
            {
              id: `notif_${Date.now()}`,
              title: `Action Required: Leave Outpass #${l.passCode}`,
              message: `Faculty Note: ${note}`,
              date: 'Just now',
              read: false,
            },
            ...n,
          ]);

          return {
            ...l,
            status: 'CHANGES_REQUESTED' as const,
            requestChangesNote: note,
          };
        }
        return l;
      })
    );
  };

  const registerForEvent = (eventId: string) => {
    const event = campusEvents.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    const existing = eventRegistrations.find(r => r.eventId === eventId && r.rollNumber === (currentUser.rollNumber || 'CSE-2023-042'));
    if (existing) {
      return { success: false, message: 'You have already registered for this event!' };
    }

    const ticketCode = `TKT-${event.clubName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg: EventRegistration = {
      id: `reg_${Date.now()}`,
      ticketCode,
      eventId: event.id,
      eventTitle: event.title,
      clubName: event.clubName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber || 'CSE-2023-042',
      department: `${currentUser.department || 'CSE'} (${currentUser.academicYearLabel || '3rd Year'})`,
      registeredAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Just now',
      isOdApproved: event.isOdApproved,
      status: 'CONFIRMED',
      qrPayload: `RESORA-EVENT-${ticketCode}-${currentUser.rollNumber || 'CSE-2023-042'}`,
    };

    setEventRegistrations(prev => [newReg, ...prev]);
    setCampusEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? {
              ...e,
              registeredCount: e.registeredCount + 1,
              isRegistered: true,
              userTicketId: ticketCode,
            }
          : e
      )
    );

    setNotifications(n => [
      {
        id: `notif_${Date.now()}`,
        title: 'Event Ticket Confirmed 🎟️',
        message: `You are registered for "${event.title}". Ticket #${ticketCode} is ready with entry QR pass!`,
        date: 'Just now',
        read: false,
      },
      ...n,
    ]);

    logAudit(`Registered for Event #${ticketCode}`, event.title, 'Confirmed', `Attendee: ${currentUser.name}`);

    return { success: true, message: `Registration confirmed! Your entry ticket #${ticketCode} is ready.`, registration: newReg };
  };

  const cancelEventRegistration = (registrationId: string) => {
    const reg = eventRegistrations.find(r => r.id === registrationId);
    if (!reg) return;

    setEventRegistrations(prev => prev.filter(r => r.id !== registrationId));
    setCampusEvents(prev =>
      prev.map(e =>
        e.id === reg.eventId
          ? {
              ...e,
              registeredCount: Math.max(0, e.registeredCount - 1),
              isRegistered: false,
              userTicketId: undefined,
            }
          : e
      )
    );

    setNotifications(n => [
      {
        id: `notif_${Date.now()}`,
        title: 'Event Registration Cancelled',
        message: `Your ticket for "${reg.eventTitle}" has been cancelled.`,
        date: 'Just now',
        read: false,
      },
      ...n,
    ]);
  };

  const joinClub = (clubId: string) => {
    setCampusClubs(prev =>
      prev.map(c => {
        if (c.id === clubId) {
          const newJoined = !c.isJoined;
          return {
            ...c,
            isJoined: newJoined,
            memberCount: newJoined ? c.memberCount + 1 : Math.max(1, c.memberCount - 1),
            userRole: newJoined ? 'Active Member' : undefined,
          };
        }
        return c;
      })
    );
  };

  const applyForClubRole = (input: { clubId: string; roleApplied: string; statementOfPurpose: string; pastExperience?: string; portfolioOrGithub?: string }) => {
    const club = campusClubs.find(c => c.id === input.clubId);
    if (!club) return { success: false, message: 'Club not found' };

    const newApp: ClubMembershipApplication = {
      id: `app_${Date.now()}`,
      clubId: input.clubId,
      clubName: club.name,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber || 'CSE-2023-042',
      academicYear: currentUser.academicYearLabel || '3rd Year',
      department: currentUser.department || 'CSE',
      roleApplied: input.roleApplied,
      statementOfPurpose: input.statementOfPurpose,
      pastExperience: input.pastExperience,
      portfolioOrGithub: input.portfolioOrGithub,
      submittedAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'SUBMITTED',
    };

    setClubApplications(prev => [newApp, ...prev]);
    setCampusClubs(prev =>
      prev.map(c =>
        c.id === input.clubId ? { ...c, isJoined: true, userRole: `Applicant: ${input.roleApplied}` } : c
      )
    );

    setNotifications(n => [
      {
        id: `notif_${Date.now()}`,
        title: 'Club Application Submitted 📝',
        message: `Your application for "${input.roleApplied}" at ${club.shortCode} has been submitted for review.`,
        date: 'Just now',
        read: false,
      },
      ...n,
    ]);

    return { success: true, message: `Application submitted successfully to ${club.name}!` };
  };

  const proposeNewEvent = (eventData: Omit<CampusEvent, 'id' | 'registeredCount' | 'registrationStatus' | 'isRegistered'>) => {
    const newEvent: CampusEvent = {
      ...eventData,
      id: `evt_${Date.now()}`,
      registeredCount: 0,
      registrationStatus: 'OPEN',
      isRegistered: false,
    };
    setCampusEvents(prev => [newEvent, ...prev]);
    logAudit(`Proposed Campus Event`, newEvent.title, 'Proposed', `Organizer: ${currentUser.name}`);
  };

  const proposeNewClub = (clubData: Omit<CampusClub, 'id' | 'memberCount' | 'rating' | 'tier' | 'isJoined'>) => {
    const newClub: CampusClub = {
      ...clubData,
      id: `club_${Date.now()}`,
      memberCount: 1,
      rating: 5.0,
      tier: 'STUDENT_INITIATIVE',
      isJoined: true,
      userRole: 'Founder / President',
    };
    setCampusClubs(prev => [newClub, ...prev]);
    logAudit(`Proposed New Student Club`, newClub.name, 'Proposed', `Founder: ${currentUser.name}`);
  };

  const toggleMaintenance = (resourceId: string, reason?: string) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id === resourceId) {
          const newStatus = r.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
          logAudit(
            newStatus === 'MAINTENANCE' ? `Placed under maintenance` : `Restored to service`,
            r.name,
            newStatus,
            reason || 'Routine inspection'
          );

          if (newStatus === 'MAINTENANCE') {
            setIssues(iss => [
              {
                id: `iss_${Date.now()}`,
                resourceId: r.id,
                resourceName: r.name,
                resourceType: r.type,
                reportedBy: currentUser.name,
                issueDescription: reason || 'System maintenance & hardware repair',
                priority: 'HIGH',
                status: 'IN_REPAIR',
                reportedDate: new Date().toISOString().split('T')[0],
              },
              ...iss,
            ]);
          }

          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const resolveIssue = (issueId: string) => {
    setIssues(prev =>
      prev.map(i => {
        if (i.id === issueId) {
          setResources(res => res.map(r => r.id === i.resourceId ? { ...r, status: 'AVAILABLE' } : r));
          logAudit(`Issue resolved`, i.resourceName, 'Resolved', `Repaired issue: ${i.issueDescription}`);
          return { ...i, status: 'RESOLVED' as IssueStatus };
        }
        return i;
      })
    );
  };

  const addResource = (newResInput: Omit<Resource, 'id'>) => {
    const newRes: Resource = {
      ...newResInput,
      id: `res_${Date.now()}`,
      resourceCode: newResInput.resourceCode || `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setResources(prev => [newRes, ...prev]);
    logAudit('Created new campus resource', newRes.name, 'Available', `Location: ${newRes.building}`);
  };

  const updateResource = (resourceId: string, updates: Partial<Resource>) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id === resourceId) {
          logAudit('Updated resource configuration', r.name, 'Updated', `Fields updated: ${Object.keys(updates).join(', ')}`);
          return { ...r, ...updates };
        }
        return r;
      })
    );
  };

  const enableResourceSharing = (resourceId: string, targetDepartments: string[]) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id === resourceId) {
          logAudit('Enabled cross-department sharing', r.name, 'Shared', `Shared with: ${targetDepartments.join(', ')}`);
          return { ...r, isShared: true, sharedWith: targetDepartments };
        }
        return r;
      })
    );
  };

  const toggleSaveOpportunity = (oppId: string) => {
    setOpportunities(prev =>
      prev.map(o => (o.id === oppId ? { ...o, saved: !o.saved } : o))
    );
  };

  const applyToOpportunity = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev =>
      prev.map(o => (o.id === oppId ? { ...o, applied: true } : o))
    );
    logAudit(
      'APPLICATION_LINK_OPENED',
      opp?.title || oppId,
      'Opened Link',
      `Student ${currentUser.name} (${currentUser.id}) opened application link for ${opp?.type || 'opportunity'}: ${opp?.applicationUrl || 'External Link'}`
    );
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id'>) => {
    const newOpp: Opportunity = {
      ...oppData,
      id: `opp_${Date.now()}`,
      saved: false,
      applied: false,
      createdAt: new Date().toISOString(),
    };
    setOpportunities(prev => [newOpp, ...prev]);
    logAudit('Created Opportunity', newOpp.title, 'Published', `Created ${newOpp.type}: ${newOpp.title}`);
  };

  const updateOpportunity = (oppId: string, updates: Partial<Opportunity>) => {
    setOpportunities(prev =>
      prev.map(o => (o.id === oppId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o))
    );
    logAudit('Updated Opportunity', oppId, 'Updated', `Updated opportunity ${oppId}`);
  };

  const deleteOpportunity = (oppId: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== oppId));
    logAudit('Deleted Opportunity', oppId, 'Deleted', `Deleted opportunity ${oppId}`);
  };

  const recommendOpportunity = (oppId: string, customMessage?: string): { success: boolean; message: string } => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return { success: false, message: 'Opportunity not found.' };

    const targetYear = currentUser.teachingYear || currentUser.academicYear || 3;
    const yearLabel = `${targetYear}${targetYear === 1 ? 'st' : targetYear === 2 ? 'nd' : targetYear === 3 ? 'rd' : 'th'} Year`;

    // Duplicate Prevention Check (Requirement #13)
    const existingRecs = opp.recommendations || [];
    const alreadyRecommended = existingRecs.some(
      r => r.facultyId === currentUser.id && r.targetYear === targetYear && r.isActive
    );

    if (alreadyRecommended) {
      return { success: false, message: `Already recommended to ${yearLabel} students.` };
    }

    const newRecommendation: OpportunityRecommendation = {
      id: `rec_${Date.now()}`,
      opportunityId: oppId,
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      targetYear,
      targetYearLabel: `${yearLabel} Students`,
      message: customMessage || `Recommended for students interested in emerging technologies and career growth.`,
      recommendedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isActive: true,
    };

    setOpportunities(prev =>
      prev.map(o => {
        if (o.id === oppId) {
          const updatedRecs = [...(o.recommendations || []), newRecommendation];
          return {
            ...o,
            visibility: 'RECOMMENDED',
            recommendations: updatedRecs,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );

    // Notification for all students in target academic year (Requirement #14 & #15)
    setNotifications(n => [
      {
        id: `notif_${Date.now()}`,
        title: '🎯 New Opportunity Recommended',
        message: `${currentUser.name} recommended "${opp.title}" for ${yearLabel} students.`,
        date: 'Just now',
        read: false,
      },
      ...n,
    ]);

    logAudit(
      'RECOMMEND_OPPORTUNITY',
      opp.title,
      'Recommended',
      `Faculty ${currentUser.name} recommended opportunity to ${yearLabel} students`
    );

    return { success: true, message: `Recommended to all ${yearLabel} students.` };
  };

  const removeRecommendation = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    setOpportunities(prev =>
      prev.map(o => {
        if (o.id === oppId) {
          const remainingRecs = (o.recommendations || []).filter(r => r.facultyId !== currentUser.id);
          const nextVisibility = remainingRecs.length > 0 ? 'RECOMMENDED' : 'FACULTY_ONLY';
          return {
            ...o,
            visibility: nextVisibility,
            recommendations: remainingRecs,
          };
        }
        return o;
      })
    );
    if (opp) {
      logAudit('REMOVE_RECOMMENDATION', opp.title, 'Removed', `Faculty ${currentUser.name} removed recommendation`);
    }
  };

  const updateRecommendationMessage = (oppId: string, newMessage: string) => {
    setOpportunities(prev =>
      prev.map(o => {
        if (o.id === oppId) {
          const updatedRecs = (o.recommendations || []).map(r => {
            if (r.facultyId === currentUser.id) {
              return { ...r, message: newMessage };
            }
            return r;
          });
          return { ...o, recommendations: updatedRecs };
        }
        return o;
      })
    );
  };

  const addProject = (projectData: Omit<StudentProject, 'id'>) => {
    const newProject: StudentProject = {
      ...projectData,
      id: `proj_${Date.now()}`,
    };
    setProjects(prev => [newProject, ...prev]);
    logAudit('Created Student Project', newProject.title, 'Active', `Mentor: ${newProject.mentor}`);
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    logAudit('Deleted Student Project', projectId, 'Deleted');
  };

  // AI Smart Resource Finder NLP Engine (Requirement #7)
  const parseSmartQuery = (queryText: string) => {
    const text = queryText.toLowerCase();

    // Extract people count
    let people = 8;
    const peopleMatch = text.match(/(\d+)\s*(students|people|members|users|seats)/);
    if (peopleMatch) people = parseInt(peopleMatch[1], 10);

    // Extract duration
    let durationHours = 4;
    const durMatch = text.match(/(\d+)\s*(hours|hrs|hr)/);
    if (durMatch) durationHours = parseInt(durMatch[1], 10);

    // Extract feature flags
    const wifi = text.includes('wi-fi') || text.includes('wifi') || text.includes('internet');
    const arduino = text.includes('arduino') || text.includes('microcontroller') || text.includes('kit');
    const projector = text.includes('projector') || text.includes('screen') || text.includes('display');

    const extractedRequirements = { people, durationHours, wifi, arduino, projector };

    // Match algorithm over resources
    const matches: SmartMatchResult[] = resources.map(res => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Capacity match
      if (res.capacity >= people) {
        score += 25;
        reasons.push(`Capacity of ${res.capacity} comfortably accommodates ${people} people.`);
      } else {
        score -= 20;
        reasons.push(`Capacity of ${res.capacity} is less than ${people} requested.`);
      }

      // Feature matching
      const hasWifi = res.features.some(f => f.toLowerCase().includes('wi-fi') || f.toLowerCase().includes('wifi'));
      const hasArduino = res.features.some(f => f.toLowerCase().includes('arduino') || f.toLowerCase().includes('raspberry'));
      const hasProjector = res.features.some(f => f.toLowerCase().includes('projector'));

      if (wifi && hasWifi) {
        score += 15;
        reasons.push('High-speed Wi-Fi network available.');
      }
      if (arduino && hasArduino) {
        score += 15;
        reasons.push('Equipped with Arduino & IoT hardware prototyping kits.');
      }
      if (projector && hasProjector) {
        score += 15;
        reasons.push('Features 4K Projector & presentation screen.');
      }

      if (res.status === 'MAINTENANCE') {
        score = 0;
        reasons.push('Currently UNDER MAINTENANCE - unavailable for booking.');
      }

      const isAvailable = res.status === 'AVAILABLE';

      return {
        resource: res,
        matchScore: Math.min(Math.max(score, 10), 98),
        reasons,
        isAvailable,
        conflictReason: res.status === 'MAINTENANCE' ? 'Under Repair' : undefined,
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return { extractedRequirements, matches };
  };

  const contextValue = React.useMemo<ResoraContextType>(() => ({
    currentUser: currentUser || DEMO_USERS.STUDENT,
    setCurrentUser: safeSetCurrentUser,
    setRole,
    logout,
    resources,
    bookings,
    leavePermissions,
    issues,
    auditLogs,
    opportunities,
    projects,
    campusEvents,
    campusClubs,
    eventRegistrations,
    clubApplications,
    progress,
    notifications,
    createBooking,
    approveBooking,
    rejectBooking,
    requestChangesBooking,
    checkInBooking,
    applyForLeave,
    approveLeavePermission,
    rejectLeavePermission,
    requestChangesLeavePermission,
    registerForEvent,
    cancelEventRegistration,
    joinClub,
    applyForClubRole,
    proposeNewEvent,
    proposeNewClub,
    toggleMaintenance,
    resolveIssue,
    addResource,
    updateResource,
    enableResourceSharing,
    toggleSaveOpportunity,
    applyToOpportunity,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    recommendOpportunity,
    removeRecommendation,
    updateRecommendationMessage,
    addProject,
    deleteProject,
    parseSmartQuery,
  }), [
    currentUser,
    resources,
    bookings,
    leavePermissions,
    issues,
    auditLogs,
    opportunities,
    projects,
    campusEvents,
    campusClubs,
    eventRegistrations,
    clubApplications,
    progress,
    notifications,
  ]);

  return (
    <ResoraContext.Provider value={contextValue}>
      {children}
    </ResoraContext.Provider>
  );
};

export const useResora = () => {
  const context = useContext(ResoraContext);
  if (!context) {
    throw new Error('useResora must be used within a ResoraProvider');
  }
  return context;
};
