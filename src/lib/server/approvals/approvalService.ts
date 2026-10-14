import { Booking } from '@/types';
import { updateBookingStatus } from '../bookings/bookingService';
import { requireServerAuth } from '../auth/serverAuth';

export async function approveBookingAction(bookingId: string, notes?: string): Promise<Booking | undefined> {
  const auth = await requireServerAuth(['FACULTY', 'ADMIN']);
  return updateBookingStatus(bookingId, 'APPROVED', notes, auth.user);
}

export async function rejectBookingAction(bookingId: string, reason?: string): Promise<Booking | undefined> {
  const auth = await requireServerAuth(['FACULTY', 'ADMIN']);
  return updateBookingStatus(bookingId, 'REJECTED', reason, auth.user);
}

export async function requestChangesBookingAction(bookingId: string, commentNote: string): Promise<Booking | undefined> {
  const auth = await requireServerAuth(['FACULTY', 'ADMIN']);
  return updateBookingStatus(bookingId, 'CHANGES_REQUESTED', commentNote, auth.user);
}
