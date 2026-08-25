import { create } from "zustand"
import type { Resume } from "@/types/resume"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

type ResumeStore = {
  currentResumeId: string | null
  draft: Resume | null
  saveStatus: SaveStatus
  saveError: string | null
  setCurrentResumeId: (id: string | null) => void
  setDraft: (draft: Resume | null) => void
  setSaveStatus: (status: SaveStatus, error?: string | null) => void
}

export const useResumeStore = create<ResumeStore>((set) => ({
  currentResumeId: null,
  draft: null,
  saveStatus: "idle",
  saveError: null,
  setCurrentResumeId: (id) => set({ currentResumeId: id }),
  setDraft: (draft) => set({ draft }),
  setSaveStatus: (status, error = null) =>
    set({
      saveStatus: status,
      saveError: error,
    }),
}))
