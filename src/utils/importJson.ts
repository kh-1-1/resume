import { nanoid } from "nanoid"
import { resumeBackupSchema, resumeSchema } from "@/schemas/resumeSchema"
import type { Resume } from "@/types/resume"
import { nowIso } from "@/utils/date"
import { normalizeResume } from "@/utils/createEmptyResume"

const maxBackupSize = 20 * 1024 * 1024

function readJsonFile(file: File) {
  return new Promise<unknown>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch {
        reject(new Error("JSON 文件格式不正确"))
      }
    }
    reader.onerror = () => reject(new Error("读取文件失败"))
    reader.readAsText(file, "utf-8")
  })
}

function parseResumePayload(payload: unknown) {
  const backup = resumeBackupSchema.safeParse(payload)

  if (backup.success) {
    return backup.data.resumes
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => resumeSchema.parse(item))
  }

  return [resumeSchema.parse(payload)]
}

function cloneResumeForImport(resume: Resume): Resume {
  const timestamp = nowIso()
  const normalized = normalizeResume(resume)

  return {
    ...normalized,
    id: nanoid(),
    title: `${normalized.title || "导入简历"} 副本`,
    education: normalized.education.map((item) => ({ ...item, id: nanoid() })),
    experience: normalized.experience.map((item) => ({ ...item, id: nanoid() })),
    projects: normalized.projects.map((item) => ({ ...item, id: nanoid() })),
    skills: normalized.skills.map((item) => ({ ...item, id: nanoid() })),
    certificates: normalized.certificates.map((item) => ({ ...item, id: nanoid() })),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export async function importResumesFromFile(file: File) {
  if (file.size > maxBackupSize) {
    throw new Error("JSON 备份不能超过 20MB")
  }

  const payload = await readJsonFile(file)
  let resumes: Resume[]

  try {
    resumes = parseResumePayload(payload)
  } catch {
    throw new Error("JSON 内容不是有效的简历备份")
  }

  if (!resumes.length) {
    throw new Error("JSON 备份中没有简历数据")
  }

  return resumes.map(cloneResumeForImport)
}
