let counter = 0;

/**
 * Deterministic, collision-free id generator for records created at
 * runtime (e.g. a new booking). Not cryptographically random — fine for
 * mock data; a real backend assigns its own ids.
 */
export function createId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
