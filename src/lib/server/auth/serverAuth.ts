/**
 * Resora Server-Side Authentication & Authorization Helpers
 * Next.js 14 App Router Server-Only Security Module
 *
 * Rules:
 * 1. Cryptographically verified Supabase Auth session via cookies.
 * 2. True application identity and role resolved strictly from PostgreSQL via Prisma.
 * 3. Never trust client-supplied userId, userRole, or localStorage claims.
 * 4. Explicit rejection of unauthenticated and unauthorized requests.
 * 5. In demo mode (NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true'), demo interface switching
 *    does not grant real server mutation privileges.
 */

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/server/db';
import { User, UserRole } from '@/types';

export interface ServerAuthResult {
  user: User;
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
}

/**
 * Check if hackathon demo mode is explicitly enabled
 */
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true';
}

/**
 * Retrieve the verified authenticated user from the server session and Prisma database.
 * Returns null if unauthenticated.
 */
export async function getAuthenticatedServerUser(): Promise<ServerAuthResult | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser || !supabaseUser.email) {
      return null;
    }

    const cleanEmail = supabaseUser.email.toLowerCase().trim();

    // Query Prisma user by Supabase UUID or clean email
    let prismaUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: supabaseUser.id }, { email: cleanEmail }],
      },
      include: {
        department: true,
      },
    });

    // If user does not exist in Prisma, provision as STUDENT by default
    if (!prismaUser) {
      let dept = await prisma.department.findFirst({ where: { code: 'CSE' } });
      if (!dept) {
        dept = await prisma.department.create({
          data: {
            id: 'dept_cse',
            code: 'CSE',
            name: 'Computer Science & Engineering',
          },
        });
      }

      const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
      prismaUser = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: cleanEmail,
          name: supabaseUser.user_metadata?.name || cleanEmail.split('@')[0],
          role: 'STUDENT', // Hardcoded default role: strictly STUDENT
          departmentId: dept.id,
          avatar: defaultAvatar,
        },
        include: {
          department: true,
        },
      });
    }

    const mappedRole = (prismaUser.role as UserRole) || 'STUDENT';
    const deptCode = prismaUser.department?.code || 'CSE';

    let yearLabel = '3rd Year';
    let title = `${deptCode} · ${yearLabel}`;
    if (mappedRole === 'FACULTY') {
      yearLabel = 'Faculty Lead';
      title = `${deptCode} · Faculty Lead / Professor`;
    } else if (mappedRole === 'ADMIN') {
      yearLabel = 'System Administrator';
      title = 'System Administrator · Dean of Academic Affairs';
    }

    const applicationUser: User = {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: mappedRole,
      avatar: prismaUser.avatar || undefined,
      rollNumber: prismaUser.rollNumber || undefined,
      department: deptCode,
      title,
      academicYear: mappedRole === 'STUDENT' ? 3 : undefined,
      academicYearLabel: yearLabel,
    };

    return {
      user: applicationUser,
      supabaseUser: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        user_metadata: supabaseUser.user_metadata,
      },
    };
  } catch (err) {
    console.error('Server auth verification failed:', err);
    return null;
  }
}

/**
 * Enforce authentication and role permissions on the server.
 * Throws an Error with 401/403 status message if unauthorized.
 */
export async function requireServerAuth(allowedRoles?: UserRole[]): Promise<ServerAuthResult> {
  const auth = await getAuthenticatedServerUser();

  if (!auth) {
    throw new Error('UNAUTHORIZED: Authentication session is required for this operation.');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(auth.user.role)) {
      throw new Error(
        `FORBIDDEN: User role '${auth.user.role}' is unauthorized. Required role(s): ${allowedRoles.join(', ')}.`
      );
    }
  }

  return auth;
}

/**
 * Enforce student ownership: Students can only read/mutate their own records.
 * Faculty and Admins are permitted broader scope.
 */
export function verifyStudentOwnership(
  caller: User,
  targetStudentIdentifier: string
): { authorized: boolean; reason?: string } {
  if (caller.role === 'ADMIN' || caller.role === 'FACULTY') {
    return { authorized: true };
  }

  if (caller.role === 'STUDENT') {
    const target = targetStudentIdentifier.toLowerCase().trim();
    const callerId = caller.id.toLowerCase().trim();
    const callerRoll = (caller.rollNumber || '').toLowerCase().trim();

    if (callerId === target || (callerRoll && callerRoll === target)) {
      return { authorized: true };
    }

    return {
      authorized: false,
      reason: 'FORBIDDEN: Students are strictly restricted to their own academic records.',
    };
  }

  return { authorized: false, reason: 'FORBIDDEN: Unknown role.' };
}

/**
 * Enforce faculty departmental scope: Faculty can only access or mutate
 * student records belonging to their verified academic department.
 * Administrators retain institutional cross-departmental scope.
 */
export function verifyFacultyDepartmentScope(
  caller: User,
  targetDepartmentCodeOrId?: string | null
): { authorized: boolean; reason?: string } {
  if (caller.role === 'ADMIN') {
    return { authorized: true };
  }

  if (caller.role === 'FACULTY') {
    if (!targetDepartmentCodeOrId) {
      return {
        authorized: false,
        reason: 'FORBIDDEN: Target student has no assigned academic department.',
      };
    }

    const callerDept = (caller.department || '').toUpperCase().trim();
    const targetDept = targetDepartmentCodeOrId.toUpperCase().trim();

    if (callerDept && callerDept === targetDept) {
      return { authorized: true };
    }

    return {
      authorized: false,
      reason: `FORBIDDEN: Faculty in department '${callerDept}' cannot manage students in department '${targetDept}'.`,
    };
  }

  return {
    authorized: false,
    reason: 'FORBIDDEN: Only faculty and administrators can access departmental student queues.',
  };
}
