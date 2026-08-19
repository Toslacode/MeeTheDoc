import type { StoreState } from "./reducer";

const STORAGE_KEY = "meethedoc:store";

/**
 * Bump this when StoreState's shape changes in a way old persisted data
 * can't satisfy. A mismatched version is treated as "nothing persisted"
 * (falls back to the seed) rather than crashing on stale data.
 */
const STORE_VERSION = 1;

interface PersistedEnvelope {
  version: number;
  state: StoreState;
}

function hasLocalStorage(): boolean {
  // Guards both SSR (no `window`) and environments where localStorage
  // throws just by being accessed (some private-browsing modes).
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadPersistedState(): StoreState | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedEnvelope;
    if (parsed.version !== STORE_VERSION || !parsed.state) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

export function savePersistedState(state: StoreState): void {
  if (!hasLocalStorage()) return;
  try {
    const envelope: PersistedEnvelope = { version: STORE_VERSION, state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Demo-data persistence is a nice-to-have, not critical (quota
    // exceeded, storage disabled, etc.) — fail silently rather than
    // breaking the booking/publish flow that triggered the save.
  }
}

export function clearPersistedState(): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
