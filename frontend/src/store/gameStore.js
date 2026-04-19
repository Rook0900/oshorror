import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  currentStage: 1,
  horrorActive: false,
  horrorType: null,
  openWindows: [],
  centralDownloaded: false,
  centralSolved: false,
  prog02Activated: false,
  moonFileUnlocked: false,

  setCentralDownloaded: () => set({ centralDownloaded: true }),
  setCentralSolved: () => set({ centralSolved: true }),
  activateProg02: () => set({ prog02Activated: true }),
  unlockMoonFile: () => set({ moonFileUnlocked: true }),

  stages: {
    1: {
      NOTE_01: { opened: false },
      FILE_01: { opened: false, solved: false },
      PROG_01: { unlocked: false, executed: false },
      PROG_02: { unlocked: false, executed: false },
    },
    2: {
      NOTE_01: { opened: false },
      FILE_01: { opened: false, solved: false },
      PROG_01: { unlocked: false, executed: false },
    },
    3: {
      NOTE_01: { opened: false },
      FILE_01: { opened: false, solved: false },
      PROG_01: { unlocked: false, executed: false },
      PROG_02: { unlocked: false, executed: false },
    },
  },

  monitoringX: null,
  setMonitoringX: (x) => set({ monitoringX: x }),

  noticeUnlocked: false,
  unlockNotice: () => set({ noticeUnlocked: true }),

  circuitBoxes: [0, 0, 0],
  setCircuitBoxes: (boxes) => set({ circuitBoxes: boxes }),

  openWindow: (windowId) =>
    set((state) => ({
      openWindows: state.openWindows.includes(windowId)
        ? state.openWindows
        : [...state.openWindows, windowId],
    })),

  closeWindow: (windowId) =>
    set((state) => ({
      openWindows: state.openWindows.filter((id) => id !== windowId),
    })),

  focusWindow: (windowId) =>
    set((state) => ({
      openWindows: [
        ...state.openWindows.filter((id) => id !== windowId),
        windowId,
      ],
    })),

  solvePuzzle: (stageId, fileId) =>
    set((state) => {
      const stage = state.stages[stageId]
      const allSolved = Object.entries(stage)
        .filter(([k]) => k.startsWith('FILE_'))
        .every(([k, v]) => k === fileId || v.solved)

      return {
        stages: {
          ...state.stages,
          [stageId]: {
            ...stage,
            [fileId]: { ...stage[fileId], solved: true },
            PROG_01: { ...stage.PROG_01, unlocked: allSolved },
          },
        },
      }
    }),

  isUnlocked: (stageId, progId) =>
    get().stages[stageId]?.[progId]?.unlocked ?? false,

  triggerHorror: (type) => set({ horrorActive: true, horrorType: type }),
  clearHorror: () => set({ horrorActive: false, horrorType: null }),

  nextStage: () =>
    set((state) => ({
      currentStage: state.currentStage + 1,
      openWindows: [],
      centralDownloaded: false,
      centralSolved: false,
    })),

  jumpToStage: (stageId) =>
    set({
      currentStage: stageId,
      openWindows: [],
      centralDownloaded: false,
      centralSolved: false,
      prog02Activated: false,
      moonFileUnlocked: false,
      noticeUnlocked: false,
      horrorActive: false,
      horrorType: null,
      circuitBoxes: [0, 0, 0],
      monitoringX: null,
      stages: {
        1: {
          NOTE_01: { opened: false },
          FILE_01: { opened: false, solved: false },
          PROG_01: { unlocked: false, executed: false },
          PROG_02: { unlocked: false, executed: false },
        },
        2: {
          NOTE_01: { opened: false },
          FILE_01: { opened: false, solved: false },
          PROG_01: { unlocked: false, executed: false },
        },
        3: {
          NOTE_01: { opened: false },
          FILE_01: { opened: false, solved: false },
          PROG_01: { unlocked: false, executed: false },
          PROG_02: { unlocked: false, executed: false },
        },
      },
    }),
}))
