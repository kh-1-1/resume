import { resumeRepo } from "@/db/resumeRepo"
import { resumeBackupSchema } from "@/schemas/resumeSchema"
import type { Resume } from "@/types/resume"

function hasText(value: string | undefined) {
  return Boolean(value?.trim())
}

function hasMeaningfulContent(resume: Resume) {
  const hasRealTitle = hasText(resume.title) && resume.title.trim() !== "未命名简历"

  return Boolean(
    hasRealTitle ||
      hasText(resume.summary) ||
      Object.entries(resume.basics).some(([key, value]) => key !== "photo" && hasText(value)) ||
      resume.education.some((item) =>
        [item.school, item.degree, item.major, item.location, item.startDate, item.endDate, ...item.highlights].some(hasText),
      ) ||
      resume.experience.some((item) =>
        [item.company, item.position, item.location, item.startDate, item.endDate, item.dateLabel, ...item.highlights].some(hasText),
      ) ||
      resume.projects.some((item) =>
        [item.name, item.role, item.url, item.startDate, item.endDate, ...item.techStack, ...item.highlights].some(hasText),
      ) ||
      resume.skills.some((item) => [item.name, ...item.skills].some(hasText)) ||
      resume.certificates.some((item) =>
        [item.name, item.displayName, item.issuer, item.date, item.url].some(hasText),
      ),
  )
}

function isPlaceholderShell(resume: Resume) {
  return resume.title.trim() === "未命名简历" && !hasText(resume.basics.name)
}

export async function seedLocalPrivateResumes() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_PRIVATE_RESUME_SEED !== "true") {
    return { restored: 0, total: 0 }
  }

  try {
    const response = await fetch("/private-resume-import.json")

    if (!response.ok) {
      return { restored: 0, total: 0 }
    }

    const backup = resumeBackupSchema.parse(await response.json())
    const missing = []

    for (const resume of backup.resumes) {
      const existing = await resumeRepo.get(resume.id)

      if (!existing || isPlaceholderShell(existing) || !hasMeaningfulContent(existing)) {
        missing.push(resume)
      }
    }

    if (missing.length) {
      await resumeRepo.saveMany(missing)
    }

    return { restored: missing.length, total: backup.resumes.length }
  } catch (error) {
    console.warn("本机私有简历恢复失败", error)
    throw error
  }
}
