import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  run: boolean;
  stepIndex: number;
  hasSeenTour: boolean;
  setRun: (run: boolean) => void;
  setStepIndex: (index: number) => void;
  completeTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      run: false,
      stepIndex: 0,
      hasSeenTour: false,
      setRun: (run) => set({ run }),
      setStepIndex: (stepIndex) => set({ stepIndex }),
      completeTour: () => set({ run: false, hasSeenTour: true }),
    }),
    {
      name: 'tour-storage',
      // We only want to persist 'hasSeenTour' so it doesn't run every time they reload.
      partialize: (state) => ({ hasSeenTour: state.hasSeenTour }),
    }
  )
);
