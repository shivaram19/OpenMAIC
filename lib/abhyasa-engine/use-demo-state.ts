'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { DemoState, AssignedSet } from './types';
import { createInitialDemoState, DEMO_STORAGE_KEY } from './mock-data';

function readStoredState(): DemoState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useDemoState() {
  const [state, setState] = useState<DemoState | null>(readStoredState);
  const hydrated = useHydrated();

  useEffect(() => {
    if (state) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const seed = useCallback(() => {
    const initial = createInitialDemoState();
    setState(initial);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setState(null);
  }, []);

  const assignSet = useCallback((set: Omit<AssignedSet, 'id' | 'assignedAt'>) => {
    setState((prev) => {
      if (!prev) return prev;
      const newSet: AssignedSet = {
        ...set,
        id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        assignedAt: new Date().toISOString(),
      };
      return { ...prev, assignedSets: [...prev.assignedSets, newSet] };
    });
  }, []);

  const updateSetStatus = useCallback((setId: string, status: AssignedSet['status']) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        assignedSets: prev.assignedSets.map((s) => (s.id === setId ? { ...s, status } : s)),
      };
    });
  }, []);

  return {
    state,
    hydrated,
    seed,
    reset,
    assignSet,
    updateSetStatus,
  };
}
