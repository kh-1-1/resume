import type { Resume, ResumeBackup } from "@/types/resume"
import { nowIso } from "@/utils/date"
import { downloadBlob } from "@/utils/download"

export function createResumeBackup(resumes: Resume[]): ResumeBackup {
  return {
    app: "resume-maker",
    version: 1,
    exportedAt: nowIso(),
    resumes,
  }
}

export function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")

  return cleaned || "resume"
}

export function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  })

  downloadBlob(blob, fileName)
}
