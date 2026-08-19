import { createInitialState } from "@/lib/mock-data";

import { storeReducer, type StoreAction, type StoreState } from "./reducer";
import { clearPersistedState, loadPersistedState, savePersistedState } from "./persistence";

/**
 * The live application state, as a plain (non-React) external store:
 * `getState`/`dispatch`/`subscribe`, with `dispatch` running state through
 * `storeReducer`. lib/store/context.tsx exposes this to React via
 * `useSyncExternalStore`, and lib/store/api.ts is the only thing allowed
 * to call `dispatch` — see the comment there for why the API module (not
 * React state) owns every mutation.
 *
 * SSR safety: `SERVER_SNAPSHOT` is a separate, frozen, never-mutated seed
 * used only by `getServerSnapshot` (what React calls while rendering on
 * the server). The mutable `state` below is only ever written to by
 * client-triggered `dispatch` calls — nothing on the server ever calls
 * dispatch — so this module-level singleton never leaks state between
 * concurrent server requests/users, even though it lives for the lifetime
 * of the Node process there.
 */

const SERVER_SNAPSHOT: StoreState = createInitialState();

let state: StoreState = createInitialState();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function getState(): StoreState {
  return state;
}

function getServerSnapshot(): StoreState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dispatch(action: StoreAction): StoreState {
  state = storeReducer(state, action);
  savePersistedState(state);
  notify();
  return state;
}

/**
 * Reads whatever was persisted from a previous session (if anything) and,
 * if present, replaces the in-memory state with it. Called once from a
 * `useEffect` in StoreProvider — i.e. after the first client render — so
 * that render matches the server-rendered HTML exactly and there's no
 * hydration mismatch; the persisted data (if any) then appears in a
 * second, immediate re-render.
 */
function hydrateFromStorage(): void {
  const persisted = loadPersistedState();
  if (persisted) {
    state = persisted;
    notify();
  }
}

/** Discards all persisted + in-memory data and starts over from the seed. */
function reset(): StoreState {
  state = createInitialState();
  clearPersistedState();
  notify();
  return state;
}

export const store = {
  getState,
  getServerSnapshot,
  subscribe,
  dispatch,
  hydrateFromStorage,
  reset,
};
