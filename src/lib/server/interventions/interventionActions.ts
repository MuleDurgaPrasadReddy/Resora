'use server';

/**
 * Resora Persistent Intervention Server Actions
 * Phase 5B Step 3B-1
 *
 * Next.js App Router Server Actions exposing persistent intervention operations.
 * Always executes on the server, enforcing Supabase SSR authentication and Prisma persistence.
 */

import {
  listFacultyInterventions,
  listStudentSafeInterventions,
  createIntervention,
  updateIntervention,
  updateInterventionStatus,
  archiveIntervention,
} from './interventionService';
import {
  CreateInterventionInput,
  UpdateInterventionInput,
  UpdateInterventionStatusInput,
  ArchiveInterventionInput,
  FacultyInterventionDTO,
  SafeStudentInterventionDTO,
  InterventionServiceResult,
  InterventionStatus,
} from './types';

/**
 * Server action: List faculty interventions for the authorized department.
 */
export async function listFacultyInterventionsAction(options?: {
  departmentCode?: string;
  status?: InterventionStatus;
  includeArchived?: boolean;
  includeSynthetic?: boolean;
}): Promise<InterventionServiceResult<FacultyInterventionDTO[]>> {
  return await listFacultyInterventions(options);
}

/**
 * Server action: List safe, non-confidential interventions for the authenticated student.
 */
export async function listStudentSafeInterventionsAction(): Promise<
  InterventionServiceResult<SafeStudentInterventionDTO[]>
> {
  return await listStudentSafeInterventions();
}

/**
 * Server action: Create an intervention with atomic audit log.
 */
export async function createInterventionAction(
  input: CreateInterventionInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  return await createIntervention(input);
}

/**
 * Server action: Update permitted fields of an intervention.
 */
export async function updateInterventionAction(
  input: UpdateInterventionInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  return await updateIntervention(input);
}

/**
 * Server action: Advance or complete intervention status with outcome note.
 */
export async function updateInterventionStatusAction(
  input: UpdateInterventionStatusInput
): Promise<InterventionServiceResult<FacultyInterventionDTO>> {
  return await updateInterventionStatus(input);
}

/**
 * Server action: Archive an intervention without deleting audit history.
 */
export async function archiveInterventionAction(
  input: ArchiveInterventionInput
): Promise<InterventionServiceResult<{ id: string; isArchived: boolean }>> {
  return await archiveIntervention(input);
}
