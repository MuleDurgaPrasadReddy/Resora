'use server';

import { prisma } from '@/lib/server/db';
import { User, UserRole } from '@/types';
import { requireServerAuth } from './serverAuth';

/**
 * Synchronize authenticated Supabase session user with persistent Prisma database.
 * 
 * SECURITY RULES:
 * 1. Self-service synchronization assigns STUDENT role ONLY for new users.
 * 2. Existing database roles are NEVER overwritten by login or client requests.
 * 3. Client input cannot specify or elevate roles.
 * 4. Email strings (e.g., 'admin@...') never grant elevated roles automatically.
 */
export async function syncSupabaseUserWithPrismaServer(
  supabaseUserId: string,
  email: string,
  name?: string
): Promise<User> {
  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if Prisma User exists by email or id
    let prismaUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { id: supabaseUserId }],
      },
      include: {
        department: true,
      },
    });

    // 2. If user exists in Prisma: RETURN THEIR AUTHORIZED DATABASE ROLE UNCHANGED
    if (prismaUser) {
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

      return {
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        role: mappedRole,
        avatar: prismaUser.avatar || (
          mappedRole === 'FACULTY'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
            : mappedRole === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        ),
        rollNumber: prismaUser.rollNumber || undefined,
        department: deptCode,
        title: title,
        academicYear: mappedRole === 'STUDENT' ? 3 : undefined,
        academicYearLabel: yearLabel,
      };
    }

    // 3. If user does NOT exist in Prisma yet:
    // STRICT RULE: All self-service accounts are provisioned as STUDENT only.
    const initialRole: UserRole = 'STUDENT';

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

    const newUserName = name || cleanEmail.split('@')[0];
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    const createdUser = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email: cleanEmail,
        name: newUserName,
        role: initialRole, // Strictly STUDENT
        departmentId: dept.id,
        avatar: defaultAvatar,
      },
      include: {
        department: true,
      },
    });

    const deptCode = createdUser.department?.code || 'CSE';
    const title = `${deptCode} · Student`;

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: initialRole,
      avatar: createdUser.avatar || defaultAvatar,
      department: deptCode,
      title: title,
      academicYear: 1,
      academicYearLabel: '1st Year',
    };
  } catch (error) {
    console.error('Error syncing Supabase user with Prisma:', error);
    // Secure fallback: strictly STUDENT
    return {
      id: supabaseUserId,
      email: email,
      name: name || email.split('@')[0],
      role: 'STUDENT',
      department: 'CSE',
      title: 'CSE · Student',
    };
  }
}

/**
 * Server-Authorized Role Elevation Action
 * Strictly restricted to verified administrators via requireServerAuth(['ADMIN']).
 */
export async function assignUserRoleServer(
  targetUserId: string,
  newRole: UserRole
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // 1. Enforce that the CALLER is a verified administrator on the server
    const auth = await requireServerAuth(['ADMIN']);

    // 2. Locate target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { department: true },
    });

    if (!targetUser) {
      return { success: false, error: 'Target user not found in database.' };
    }

    // 3. Update role
    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      include: { department: true },
    });

    // 4. Record audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        userName: auth.user.name,
        action: 'USER_ROLE_ASSIGNED',
        resource: `User:${targetUserId}`,
        status: 'SUCCESS',
        details: `Administrator ${auth.user.email} updated role of ${targetUser.email} from ${targetUser.role} to ${newRole}`,
      },
    });

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role as UserRole,
        department: updated.department?.code || 'CSE',
        title: `${updated.department?.code || 'CSE'} · ${newRole}`,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
