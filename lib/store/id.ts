/**
 * Id generator for records created at runtime (e.g. a new booking).
 *
 * Uses crypto.randomUUID() rather than an incrementing counter on purpose:
 * a counter is only collision-free within one in-memory session, but the
 * ids it produces get persisted to localStorage (lib/store/persistence.ts)
 * and outlive that session. A fresh page load resets the counter to 0
 * while the persisted data still has, say, "slot-1" — the next record
 * created after that reload collides with it, and callers that look a
 * record up by id (e.g. lib/store/api.ts's createBooking) can silently
 * find the wrong one. A UUID suffix can't collide with previously
 * persisted ids regardless of how many reloads happen in between.
 */
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
