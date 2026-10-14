/**
 * Resora Persistent Intervention Service
 * Phase 5B Step 3B-1
 *
 * Server-only service providing persistent operations using Prisma models
 * StudentIntervention and InterventionAuditLog.
 *
 * Enforces:
 * 1. Verified server authentication (Supabase session + trusted DB role).
 * 2. Strict authorization (Departmental scope for faculty, institutional for admin).
 * 3. Privacy boundaries (Students never receive confidential faculty notes or audit logs).
 * 4. State machine integrity (OPEN -> IN_PROGRESS -> COMPLETED with outcome notes).
 * 5. Append-only audit logging committed atomically via Prisma transactions.
 * 6. Graceful detection and error reporting when the database is unmigrated.
 */

import { prisma } from '@/lib/server/db';
import {
  requireServerAuth,
  verifyFacultyDepartmentScope,
} from '@/lib/server/auth/serverAuth';
import {
  CreateInterventionInput,
  UpdateInterventionInput,
  UpdateInterventionStatusInput,
  ArchiveInterventionInput,
  InterventionServiceResult,
  SafeStudentInterventionDTO,
  FacultyInterventionDTO,
  InterventionAuditLogDTO,
  InterventionStatus,
  isValidStatusTransition,
  MIN_OUTCOME_NOTE_LENGTH,
} from './types';

/**
 * Detects whether a Prisma error indicates that the StudentIntervention table
 * does not exist in the database yet (unmigrated state).
 */
export function isPrismaTableNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  if (e.code === 'P2021') return true;
  if (typeof e.message === 'string') {
    const msg = e.message.toLowerCase();
    return (
      (msg.includes('table') && msg.includes('does not exist')) ||
      msg.includes('relation "studentintervention" does not exist') ||
      msg.includes('relation "interventionauditlog" does not exist')
    );
  }
  return false;
}

/**
 * Converts unmigrated database errors into standard structured service error results.
 */
function handleServiceError<T>(error: unknown, fallbackMessage: string): InterventionServiceResult<T> {
  if (isPrismaTableNotFoundError(error)) {
    return {
      success: false,
      error:
        'DATABASE_NOT_MIGRATED: The StudentIntervention table does not exist in the database. Schema migrations must be applied before persistent operations can be executed.',
      errorCode: 'DATABASE_NOT_MIGRATED',
      isDatabaseMigrated: false,
    };
  }

  const errorMessage = error instanceof Error ? error.message : fallbackMessage;

  if (errorMessage.startsWith('UNAUTHORIZED')) {
    return { success: false, error: errorMessage, errorCode: 'UNAUTHORIZED' };
  }
  if (errorMessage.startsWith('FORBIDDEN')) {
    return { success: false, error: errorMessage, errorCode: 'FORBIDDEN' };
  }
  if (errorMessage.startsWith('NOT_FOUND')) {
    return { success: false, error: errorMessage, errorCode: 'NOT_FOUND' };
  }
  if (errorMessage.startsWith('VALIDATION_ERROR')) {
    return { success: false, error: errorMessage, errorCode: 'VALIDATION_ERROR' };
  }
  if (errorMessage.startsWith('INVALID_TRANSITION')) {
    return { success: false, error: errorMessage, errorCode: 'INVALID_TRANSITION' };
  }

  console.error(`[InterventionService Error] ${fallbackMessage}:`, error);
  return {
    success: false,
    error: errorMessage || fallbackMessage,
    errorCode: 'INTERNAL_ERROR',
  };
}

/**
 * Maps a full Prisma StudentIntervention model to the confidential FacultyInterventionDTO.
 */
function mapToFacultyDTO(intervention: any): FacultyInterventionDTO {
  return {
    id: intervention.id,
    studentId: intervention.studentId,
    studentName: intervention.student?.name || 'Unknown Student',
    studentRollNumber: intervention.student?.rollNumber || null,
    studentEmail: intervention.student?.email || '',
    departmentCode: intervention.department?.code || null,
    departmentName: intervention.department?.name || null,
    mentorId: intervention.mentorId || null,
    mentorName: intervention.mentor?.name || null,
    mentorEmail: intervention.mentor?.email || null,
    interventionType: intervention.interventionType,
    priority: intervention.priority,
    status: intervention.status,
    title: intervention.title,
    triggeredIndicator: intervention.triggeredIndicator,
    studentGuidance: intervention.studentGuidance,
    actionNotes: intervention.actionNotes,
    outcomeNotes: intervention.outcomeNotes || null,
    followUpDate: intervention.followUpDate ? intervention.followUpDate.toISOString() : null,
    isSynthetic: intervention.isSynthetic,
    isArchived: intervention.isArchived,
    createdById: intervention.createdById || null,
    updatedById: intervention.updatedById || null,
    createdAt: intervention.createdAt.toISOString(),
    updatedAt: intervention.updatedAt.toISOString(),
    auditLogs: (intervention.auditLogs || []).map((log: any): InterventionAuditLogDTO => ({
      id: log.id,
      interventionId: log.interventionId,
      actorId: log.actorId || null,
      actorName: log.actorName,
      action: log.action,
      previousStatus: log.previousStatus || null,
      newStatus: log.newStatus || null,
      note: log.note || null,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

/**
 * Maps a Prisma record or student intervention to the safe, non-confidential student DTO.
 * Explicitly redacts internal faculty notes, outcome notes, indicators, and audit logs.
 */
export function mapToSafeStudentDTO(intervention: any): SafeStudentInterventionDTO {
  return {
    id: intervention.id,
    title: intervention.title,
    interventionType: intervention.interventionType,
    priority: intervention.priority,
    status: intervention.status,
    studentGuidance: intervention.studentGuidance,
    followUpDate: intervention.followUpDate ? new Date(intervention.followUpDate).toISOString() : null,
    mentorName: intervention.mentor?.name || null,
    mentorEmail: intervention.mentor?.email || null,
    createdAt: new Date(intervention.createdAt).toISOString(),
    updatedAt: new Date(intervention.updatedAt).toISOString(),
  };
}

// ============================================================================
// 1. LIST FACULTY INTERVENTIONS
// ============================================================================
export async function listFacultyInterventions(options?: {
  departmentCode?: string;
  status?: InterventionStatus;
  includeArchived?: boolean;
  includeSynthetic?: boolean;
}): Promise<InterventionServiceResult<FacultyInterventionDTO[]>> {
  try {
    const auth = await requireServerAuth(['FACULTY', 'ADMIN']);

    const whereClause: any = {
      isArchived: options?.includeArchived ? undefined : false,
    };

    if (!options?.includeSynthetic) {
      whereClause.isSynthetic = false;
    }

    if (options?.status) {
      whereClause.status = options.status;
    }

    // Role-based departmental restriction
    if (auth.user.role === 'FACULTY') {
      const facultyDept = auth.user.department;
      if (!facultyDept) {
        return {
          success: false,
          error: 'FORBIDDEN: Authenticated faculty member has no registered department.',
          errorCode: 'FORBIDDEN',
        };
      }

      // Restrict faculty to interventions in their department OR where they are the assigned mentor
      whereClause.OR = [
        { department: { code: { equals: facultyDept, mode: 'insensitive' } } },
        { mentorId: auth.user.id },
      ];
    } else if (auth.user.role === 'ADMIN' && options?.departmentCode) {
      whereClause.department = { code: { equals: options.departmentCode, mode: 'insensitive' } };
    }

    const records = await prisma.studentIntervention.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, rollNumber: true, email: true } },
        mentor: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, code: true, name: true } },
        auditLogs: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: records.map(mapToFacultyDTO),
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<FacultyInterventionDTO[]>(error, 'Failed to list faculty interventions');
  }
}

// ============================================================================
// 2. LIST STUDENT SAFE INTERVENTIONS
// ============================================================================
export async function listStudentSafeInterventions(): Promise<
  InterventionServiceResult<SafeStudentInterventionDTO[]>
> {
  try {
    // Derive student identity strictly from the verified server session
    const auth = await requireServerAuth(['STUDENT']);

    // Query exclusively for the authenticated student's non-archived records
    const records = await prisma.studentIntervention.findMany({
      where: {
        studentId: auth.user.id,
        isArchived: false,
        isSynthetic: false,
      },
      select: {
        id: true,
        title: true,
        interventionType: true,
        priority: true,
        status: true,
        studentGuidance: true,
        followUpDate: true,
        createdAt: true,
        updatedAt: true,
        mentor: {
          select: {
            name: true,
            email: true,
          },
        },
        // Explicitly NEVER select: actionNotes, outcomeNotes, triggeredIndicator, auditLogs, createdById, updatedById
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeList: SafeStudentInterventionDTO[] = records.map((r) => ({
      id: r.id,
      title: r.title,
      interventionType: r.interventionType,
      priority: r.priority,
      status: r.status,
      studentGuidance: r.studentGuidance,
      followUpDate: r.followUpDate ? r.followUpDate.toISOString() : null,
      mentorName: r.mentor?.name || null,
      mentorEmail: r.mentor?.email || null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: safeList,
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<SafeStudentInterventionDTO[]>(error, 'Failed to list student safe interventions');
  }
}

// ============================================================================
// 3. CREATE INTERVENTION
// ============================================================================
export async function createIntervention(
  input: CreateInterventionInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  try {
    const auth = await requireServerAuth(['FACULTY', 'ADMIN']);

    // Basic input validation
    if (!input.title || input.title.trim().length < 3) {
      return {
        success: false,
        error: 'VALIDATION_ERROR: Intervention title must be at least 3 characters.',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    if (!input.studentGuidance || input.studentGuidance.trim().length < 3) {
      return {
        success: false,
        error: 'VALIDATION_ERROR: Student guidance must be provided (at least 3 characters).',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    if (!input.actionNotes || input.actionNotes.trim().length < 3) {
      return {
        success: false,
        error: 'VALIDATION_ERROR: Faculty action notes must be provided (at least 3 characters).',
        errorCode: 'VALIDATION_ERROR',
      };
    }

    // Verify target student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: input.studentId },
      include: { department: true },
    });

    if (!student) {
      return {
        success: false,
        error: 'NOT_FOUND: Target student account does not exist.',
        errorCode: 'NOT_FOUND',
      };
    }

    if (student.role !== 'STUDENT') {
      return {
        success: false,
        error: 'VALIDATION_ERROR: Interventions can only be created for student accounts.',
        errorCode: 'VALIDATION_ERROR',
      };
    }

    // Derive student's department code and verify faculty scope
    const studentDeptCode = student.department?.code || null;
    const scopeCheck = verifyFacultyDepartmentScope(auth.user, studentDeptCode);
    if (!scopeCheck.authorized) {
      return {
        success: false,
        error: scopeCheck.reason || 'FORBIDDEN: Department scope authorization failed.',
        errorCode: 'FORBIDDEN',
      };
    }

    // If mentorId is provided, validate that mentor exists and is faculty/admin
    let mentorIdToAssign = input.mentorId || (auth.user.role === 'FACULTY' ? auth.user.id : null);
    if (input.mentorId) {
      const mentorUser = await prisma.user.findUnique({
        where: { id: input.mentorId },
      });
      if (!mentorUser || !['FACULTY', 'ADMIN'].includes(mentorUser.role)) {
        return {
          success: false,
          error: 'VALIDATION_ERROR: Assigned mentor must be an authorized faculty or administrator account.',
          errorCode: 'VALIDATION_ERROR',
        };
      }
      mentorIdToAssign = mentorUser.id;
    }

    // Commit intervention and initial audit entry atomically inside a Prisma transaction
    const created = await prisma.$transaction(async (tx) => {
      const intervention = await tx.studentIntervention.create({
        data: {
          studentId: student.id,
          mentorId: mentorIdToAssign,
          departmentId: student.departmentId,
          interventionType: input.interventionType,
          priority: input.priority || 'MEDIUM',
          status: 'OPEN',
          title: input.title.trim(),
          triggeredIndicator: input.triggeredIndicator.trim(),
          studentGuidance: input.studentGuidance.trim(),
          actionNotes: input.actionNotes.trim(),
          followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
          isSynthetic: input.isSynthetic ?? false,
          createdById: auth.user.id,
          updatedById: auth.user.id,
          auditLogs: {
            create: {
              actorId: auth.user.id,
              actorName: auth.user.name,
              action: 'INTERVENTION_CREATED',
              previousStatus: null,
              newStatus: 'OPEN',
              note: `Initial plan created: ${input.title.trim()}`,
            },
          },
        },
        include: {
          student: { select: { id: true, name: true, rollNumber: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, code: true, name: true } },
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      return intervention;
    });

    return {
      success: true,
      data: mapToFacultyDTO(created),
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<FacultyInterventionDTO>(error, 'Failed to create intervention');
  }
}

// ============================================================================
// 4. UPDATE PERMITTED INTERVENTION FIELDS
// ============================================================================
export async function updateIntervention(
  input: UpdateInterventionInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  try {
    const auth = await requireServerAuth(['FACULTY', 'ADMIN']);

    const existing = await prisma.studentIntervention.findUnique({
      where: { id: input.id },
      include: {
        department: true,
        student: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'NOT_FOUND: Intervention record not found.',
        errorCode: 'NOT_FOUND',
      };
    }

    if (existing.isArchived) {
      return {
        success: false,
        error: 'FORBIDDEN: Archived interventions cannot be edited.',
        errorCode: 'FORBIDDEN',
      };
    }

    // Verify scope
    const scopeCheck = verifyFacultyDepartmentScope(auth.user, existing.department?.code);
    if (!scopeCheck.authorized) {
      return {
        success: false,
        error: scopeCheck.reason || 'FORBIDDEN: Unauthorized to update intervention for this department.',
        errorCode: 'FORBIDDEN',
      };
    }

    // If changing mentorId, validate
    if (input.mentorId !== undefined && input.mentorId !== null) {
      const mentorUser = await prisma.user.findUnique({
        where: { id: input.mentorId },
      });
      if (!mentorUser || !['FACULTY', 'ADMIN'].includes(mentorUser.role)) {
        return {
          success: false,
          error: 'VALIDATION_ERROR: Assigned mentor must be an authorized faculty or administrator account.',
          errorCode: 'VALIDATION_ERROR',
        };
      }
    }

    // Atomic update and audit logging
    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        updatedById: auth.user.id,
      };

      if (input.title !== undefined) updateData.title = input.title.trim();
      if (input.studentGuidance !== undefined) updateData.studentGuidance = input.studentGuidance.trim();
      if (input.actionNotes !== undefined) updateData.actionNotes = input.actionNotes.trim();
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.mentorId !== undefined) updateData.mentorId = input.mentorId;
      if (input.followUpDate !== undefined) {
        updateData.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
      }

      const rec = await tx.studentIntervention.update({
        where: { id: input.id },
        data: updateData,
        include: {
          student: { select: { id: true, name: true, rollNumber: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, code: true, name: true } },
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.interventionAuditLog.create({
        data: {
          interventionId: input.id,
          actorId: auth.user.id,
          actorName: auth.user.name,
          action: 'INTERVENTION_UPDATED',
          previousStatus: existing.status,
          newStatus: existing.status,
          note: input.auditNote?.trim() || 'Intervention details updated by staff.',
        },
      });

      return rec;
    });

    return {
      success: true,
      data: mapToFacultyDTO(updated),
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<FacultyInterventionDTO>(error, 'Failed to update intervention');
  }
}

// ============================================================================
// 5. UPDATE INTERVENTION STATUS (STATE MACHINE ENFORCEMENT)
// ============================================================================
export async function updateInterventionStatus(
  input: UpdateInterventionStatusInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  try {
    const auth = await requireServerAuth(['FACULTY', 'ADMIN']);

    const existing = await prisma.studentIntervention.findUnique({
      where: { id: input.id },
      include: {
        department: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'NOT_FOUND: Intervention record not found.',
        errorCode: 'NOT_FOUND',
      };
    }

    if (existing.isArchived) {
      return {
        success: false,
        error: 'FORBIDDEN: Cannot change status of an archived intervention.',
        errorCode: 'FORBIDDEN',
      };
    }

    // Verify scope
    const scopeCheck = verifyFacultyDepartmentScope(auth.user, existing.department?.code);
    if (!scopeCheck.authorized) {
      return {
        success: false,
        error: scopeCheck.reason || 'FORBIDDEN: Unauthorized to update status for this department.',
        errorCode: 'FORBIDDEN',
      };
    }

    // Validate state machine transition
    if (existing.status === 'COMPLETED') {
      return {
        success: false,
        error: 'INVALID_TRANSITION: Completed interventions are in a terminal state and cannot be reopened or regressed.',
        errorCode: 'INVALID_TRANSITION',
      };
    }

    if (!isValidStatusTransition(existing.status, input.newStatus)) {
      return {
        success: false,
        error: `INVALID_TRANSITION: Transition from '${existing.status}' to '${input.newStatus}' is not permitted.`,
        errorCode: 'INVALID_TRANSITION',
      };
    }

    // Require meaningful outcome note when marking COMPLETED
    if (input.newStatus === 'COMPLETED') {
      if (!input.outcomeNotes || input.outcomeNotes.trim().length < MIN_OUTCOME_NOTE_LENGTH) {
        return {
          success: false,
          error: `VALIDATION_ERROR: A detailed outcome note of at least ${MIN_OUTCOME_NOTE_LENGTH} characters is required when completing an intervention.`,
          errorCode: 'VALIDATION_ERROR',
        };
      }
    }

    // Commit atomic transition and audit log
    const updated = await prisma.$transaction(async (tx) => {
      const rec = await tx.studentIntervention.update({
        where: { id: input.id },
        data: {
          status: input.newStatus,
          outcomeNotes: input.newStatus === 'COMPLETED' ? input.outcomeNotes!.trim() : existing.outcomeNotes,
          updatedById: auth.user.id,
        },
        include: {
          student: { select: { id: true, name: true, rollNumber: true, email: true } },
          mentor: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, code: true, name: true } },
          auditLogs: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.interventionAuditLog.create({
        data: {
          interventionId: input.id,
          actorId: auth.user.id,
          actorName: auth.user.name,
          action: `STATUS_CHANGED_TO_${input.newStatus}`,
          previousStatus: existing.status,
          newStatus: input.newStatus,
          note:
            input.statusNote?.trim() ||
            (input.newStatus === 'COMPLETED'
              ? `Completed: ${input.outcomeNotes!.trim()}`
              : `Status transitioned from ${existing.status} to ${input.newStatus}`),
        },
      });

      return rec;
    });

    return {
      success: true,
      data: mapToFacultyDTO(updated),
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<FacultyInterventionDTO>(error, 'Failed to update intervention status');
  }
}

// ============================================================================
// 6. ARCHIVE INTERVENTION (PRESERVE AUDIT HISTORY WITHOUT HARD-DELETING)
// ============================================================================
export async function archiveIntervention(
  input: ArchiveInterventionInput
): Promise<InterventionServiceResult<{ id: string; isArchived: boolean }>> {
  try {
    const auth = await requireServerAuth(['FACULTY', 'ADMIN']);

    const existing = await prisma.studentIntervention.findUnique({
      where: { id: input.id },
      include: {
        department: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'NOT_FOUND: Intervention record not found.',
        errorCode: 'NOT_FOUND',
      };
    }

    // Verify scope
    const scopeCheck = verifyFacultyDepartmentScope(auth.user, existing.department?.code);
    if (!scopeCheck.authorized) {
      return {
        success: false,
        error: scopeCheck.reason || 'FORBIDDEN: Unauthorized to archive intervention for this department.',
        errorCode: 'FORBIDDEN',
      };
    }

    if (existing.isArchived) {
      return {
        success: true,
        data: { id: existing.id, isArchived: true },
        isDatabaseMigrated: true,
      };
    }

    // Commit archival and append audit log atomically
    await prisma.$transaction(async (tx) => {
      await tx.studentIntervention.update({
        where: { id: input.id },
        data: {
          isArchived: true,
          deletedAt: new Date(),
          updatedById: auth.user.id,
        },
      });

      await tx.interventionAuditLog.create({
        data: {
          interventionId: input.id,
          actorId: auth.user.id,
          actorName: auth.user.name,
          action: 'INTERVENTION_ARCHIVED',
          previousStatus: existing.status,
          newStatus: existing.status,
          note: input.reason?.trim() || 'Intervention archived by staff without deleting audit history.',
        },
      });
    });

    return {
      success: true,
      data: { id: input.id, isArchived: true },
      isDatabaseMigrated: true,
    };
  } catch (error) {
    return handleServiceError<{ id: string; isArchived: boolean }>(error, 'Failed to archive intervention');
  }
}
