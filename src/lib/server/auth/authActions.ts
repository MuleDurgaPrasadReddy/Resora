'use server';

import { prisma } from '@/lib/server/db';
import { User, UserRole } from '@/types';

export async function syncSupabaseUserWithPrismaServer(
  supabaseUserId: string,
  email: string,
  name?: string,
  requestedRole?: UserRole
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

    // 2. If user exists in Prisma, return mapped user with server-side Prisma role
    if (prismaUser) {
      // If requestedRole is explicitly passed (e.g. user selected Faculty or Admin tab), sync Prisma role
      if (requestedRole && prismaUser.role !== requestedRole) {
        prismaUser = await prisma.user.update({
          where: { id: prismaUser.id },
          data: { role: requestedRole },
          include: { department: true },
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
    // Determine initial role based on requestedRole, email pattern, or default to STUDENT
    let initialRole: UserRole = requestedRole || 'STUDENT';
    if (!requestedRole) {
      if (cleanEmail.includes('faculty') || cleanEmail.includes('prof')) {
        initialRole = 'FACULTY';
      } else if (cleanEmail.includes('admin')) {
        initialRole = 'ADMIN';
      }
    }

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

    const newUserName = name || (
      initialRole === 'FACULTY'
        ? 'Dr. S. Rao'
        : initialRole === 'ADMIN'
        ? 'Admin User'
        : cleanEmail.split('@')[0]
    );

    const defaultAvatar = initialRole === 'FACULTY'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
      : initialRole === 'ADMIN'
      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    const createdUser = await prisma.user.create({
      data: {
        id: supabaseUserId,
        email: cleanEmail,
        name: newUserName,
        role: initialRole,
        departmentId: dept.id,
        avatar: defaultAvatar,
      },
      include: {
        department: true,
      },
    });

    const deptCode = createdUser.department?.code || 'CSE';
    let title = `${deptCode} · Student`;
    if (initialRole === 'FACULTY') title = `${deptCode} · Faculty Lead / Professor`;
    if (initialRole === 'ADMIN') title = 'System Administrator · Dean of Academic Affairs';

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: initialRole,
      avatar: createdUser.avatar || defaultAvatar,
      department: deptCode,
      title: title,
      academicYear: initialRole === 'STUDENT' ? 1 : undefined,
      academicYearLabel: initialRole === 'STUDENT' ? '1st Year' : initialRole === 'FACULTY' ? 'Faculty Lead' : 'System Admin',
    };
  } catch (error) {
    console.error('Error syncing Supabase user with Prisma:', error);
    let role: UserRole = 'STUDENT';
    if (email.toLowerCase().includes('faculty')) role = 'FACULTY';
    if (email.toLowerCase().includes('admin')) role = 'ADMIN';

    return {
      id: supabaseUserId,
      email: email,
      name: name || email.split('@')[0],
      role: role,
      department: 'CSE',
      title: role === 'ADMIN' ? 'System Administrator' : role === 'FACULTY' ? 'CSE · Faculty Lead' : 'CSE · Student',
    };
  }
}
