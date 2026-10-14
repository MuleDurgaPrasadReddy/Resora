/**
 * Resora Persistent Intervention Engine — Type Definitions
 * Phase 5B Step 3B-1
 *
 * Enforces strict typing, privacy boundaries, role scopes, and state machine transitions.
 */

import {
  InterventionType,
  InterventionStatus,
  Priority,
  Role,
} from '@prisma/client';

export { InterventionType, InterventionStatus, Priority };

/**
 * Valid state machine transitions for interventions.
 * Terminal state (COMPLETED) cannot be reopened or regressed.
 */
export const VALID_STATUS_TRANSITIONS: Record<InterventionStatus, InterventionStatus[]> = {
  OPEN: ['IN_PROGRESS', 'COMPLETED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [], // Immutable terminal state
};

/**
 * Validates whether a status transition is permitted by the state machine.
 */
export function isValidStatusTransition(
  currentStatus: InterventionStatus,
  nextStatus: InterventionStatus
): boolean {
  if (currentStatus === nextStatus) return false;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

/**
 * Minimum outcome note length required when marking an intervention COMPLETED.
 */
export const MIN_OUTCOME_NOTE_LENGTH = 10;

/**
 * Safe Student DTO: Excludes confidential faculty notes, internal risk indicators,
 * audit history, and creator/updater identifiers.
 */
export interface SafeStudentInterventionDTO {
  id: string;
  title: string;
  interventionType: InterventionType;
  priority: Priority;
  status: InterventionStatus;
  studentGuidance: string;
  followUpDate: string | null; // ISO string
  mentorName: string | null;
  mentorEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Faculty/Admin Intervention DTO: Full intervention view with audit history.
 */
export interface FacultyInterventionDTO {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string | null;
  studentEmail: string;
  departmentCode: string | null;
  departmentName: string | null;
  mentorId: string | null;
  mentorName: string | null;
  mentorEmail: string | null;
  interventionType: InterventionType;
  priority: Priority;
  status: InterventionStatus;
  title: string;
  triggeredIndicator: string;
  studentGuidance: string;
  actionNotes: string;
  outcomeNotes: string | null;
  followUpDate: string | null;
  isSynthetic: boolean;
  isArchived: boolean;
  createdById: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs: InterventionAuditLogDTO[];
}

/**
 * Audit Log DTO
 */
export interface InterventionAuditLogDTO {
  id: string;
  interventionId: string;
  actorId: string | null;
  actorName: string;
  action: string;
  previousStatus: InterventionStatus | null;
  newStatus: InterventionStatus | null;
  note: string | null;
  createdAt: string;
}

/**
 * Input for creating a new intervention
 */
export interface CreateInterventionInput {
  studentId: string;
  mentorId?: string | null;
  interventionType: InterventionType;
  priority?: Priority;
  title: string;
  triggeredIndicator: string;
  studentGuidance: string;
  actionNotes: string;
  followUpDate?: string | Date | null;
  isSynthetic?: boolean;
}

/**
 * Input for updating editable intervention fields (excluding status changes)
 */
export interface UpdateInterventionInput {
  id: string;
  title?: string;
  studentGuidance?: string;
  actionNotes?: string;
  priority?: Priority;
  mentorId?: string | null;
  followUpDate?: string | Date | null;
  auditNote?: string;
}

/**
 * Input for updating intervention status
 */
export interface UpdateInterventionStatusInput {
  id: string;
  newStatus: InterventionStatus;
  statusNote?: string;
  outcomeNotes?: string; // Required if newStatus === 'COMPLETED'
}

/**
 * Input for archiving an intervention
 */
export interface ArchiveInterventionInput {
  id: string;
  reason?: string;
}

/**
 * Standard Service Result envelope
 */
export interface InterventionServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INVALID_TRANSITION' | 'DATABASE_NOT_MIGRATED' | 'INTERNAL_ERROR';
  isDatabaseMigrated?: boolean;
}
