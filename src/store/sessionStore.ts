import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WorksheetEntry {
  draftContent: string
  isComplete: boolean
}

interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

interface SessionState {
  activeWorksheetIndex: number
  worksheets: Record<number, WorksheetEntry>
  completedAnswers: Record<string, string>
  chatMessages: Record<string, StoredMessage[]>
  // Enhancement state
  hasCompletedRitual: boolean
  emotionalCheckins: Record<string, number> // slug -> 1-5
  aspirationalScores: string | null // JSON of aspirational wheel scores
  // Actions
  setActiveWorksheet: (index: number) => void
  markComplete: (index: number) => void
  updateDraft: (index: number, content: string) => void
  saveCompletedAnswer: (worksheetSlug: string, summary: string) => void
  getCompletedAnswers: () => Record<string, string>
  saveChatMessages: (worksheetSlug: string, messages: StoredMessage[]) => void
  getChatMessages: (worksheetSlug: string) => StoredMessage[]
  setRitualComplete: () => void
  setEmotionalCheckin: (slug: string, value: number) => void
  saveAspirationalScores: (scores: string) => void
}

const EMPTY_MESSAGES: StoredMessage[] = []

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      activeWorksheetIndex: 0,
      worksheets: {},
      completedAnswers: {},
      chatMessages: {},
      hasCompletedRitual: false,
      emotionalCheckins: {},
      aspirationalScores: null,
      setActiveWorksheet: (index) => set({ activeWorksheetIndex: index }),
      markComplete: (index) =>
        set((state) => ({
          worksheets: {
            ...state.worksheets,
            [index]: { ...(state.worksheets[index] ?? { draftContent: '' }), isComplete: true },
          },
        })),
      updateDraft: (index, content) =>
        set((state) => ({
          worksheets: {
            ...state.worksheets,
            [index]: { ...(state.worksheets[index] ?? { isComplete: false }), draftContent: content },
          },
        })),
      saveCompletedAnswer: (worksheetSlug, summary) =>
        set((state) => ({
          completedAnswers: {
            ...state.completedAnswers,
            [worksheetSlug]: summary,
          },
        })),
      getCompletedAnswers: () => get().completedAnswers,
      saveChatMessages: (worksheetSlug, messages) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [worksheetSlug]: messages,
          },
        })),
      getChatMessages: (worksheetSlug) => get().chatMessages[worksheetSlug] ?? EMPTY_MESSAGES,
      setRitualComplete: () => set({ hasCompletedRitual: true }),
      setEmotionalCheckin: (slug, value) =>
        set((state) => ({
          emotionalCheckins: { ...state.emotionalCheckins, [slug]: value },
        })),
      saveAspirationalScores: (scores) => set({ aspirationalScores: scores }),
    }),
    {
      name: 'freedom-blueprint-session',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>
        if (!version || version < 2) {
          return {
            activeWorksheetIndex: state.activeWorksheetIndex ?? 0,
            worksheets: state.worksheets ?? {},
            completedAnswers: state.completedAnswers ?? {},
            chatMessages: state.chatMessages ?? {},
            hasCompletedRitual: state.hasCompletedRitual ?? false,
            emotionalCheckins: state.emotionalCheckins ?? {},
            aspirationalScores: state.aspirationalScores ?? null,
          } as SessionState
        }
        return persisted as SessionState
      },
    }
  )
)
