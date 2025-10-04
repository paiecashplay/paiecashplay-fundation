'use client';

import { create } from 'zustand';

interface StatsStore {
  refreshTrigger: number;
  refreshStats: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  refreshTrigger: 0,
  refreshStats: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));