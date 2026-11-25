import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY } from '../config/site';
import { VALID_ENDING_IDS } from '../data/endings';
import { VALID_SLOT_IDS } from '../data/saveSlots';
import type { ChapterNumber, PersistedAppState } from '../types/tracker';
import { DEFAULT_APP_STATE, validatePersistedState } from '../utils/syncCodec';

function readInitialState(): PersistedAppState {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_STATE;
    }
    const parsed: unknown = JSON.parse(raw);
    const result = validatePersistedState(parsed);
    return result.ok ? result.state : DEFAULT_APP_STATE;
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function usePersistedState() {
  const [state, setState] = useState<PersistedAppState>(readInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota or private browsing write failures cleanly.
    }
  }, [state]);

  const toggleSlot = useCallback((slotId: string) => {
    if (!VALID_SLOT_IDS.has(slotId)) {
      return;
    }
    setState((prev) => {
      const exists = prev.checkedSlots.includes(slotId);
      const checkedSlots = exists
        ? prev.checkedSlots.filter((id) => id !== slotId)
        : [...prev.checkedSlots, slotId];
      return { ...prev, checkedSlots };
    });
  }, []);

  const toggleEnding = useCallback((endingId: string) => {
    if (!VALID_ENDING_IDS.has(endingId)) {
      return;
    }
    setState((prev) => {
      const exists = prev.completedEndings.includes(endingId);
      const completedEndings = exists
        ? prev.completedEndings.filter((id) => id !== endingId)
        : [...prev.completedEndings, endingId];
      return { ...prev, completedEndings };
    });
  }, []);

  const setCurrentChapter = useCallback((chapter: ChapterNumber) => {
    setState((prev) =>
      prev.currentChapter === chapter ? prev : { ...prev, currentChapter: chapter }
    );
  }, []);

  const replaceState = useCallback((nextState: PersistedAppState) => {
    const check = validatePersistedState(nextState);
    if (check.ok) {
      setState(check.state);
    }
  }, []);

  const resetState = useCallback(() => {
    setState(DEFAULT_APP_STATE);
  }, []);

  return {
    state,
    toggleSlot,
    toggleEnding,
    setCurrentChapter,
    replaceState,
    resetState,
  };
}
