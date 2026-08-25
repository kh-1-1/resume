import { db } from "@/db"
import type { Resume } from "@/types/resume"
import { normalizeResume } from "@/utils/createEmptyResume"

export const resumeRepo = {
  async list() {
    const resumes = await db.resumes.orderBy("updatedAt").reverse().toArray()

    return resumes.map(normalizeResume)
  },

  async get(id: string) {
    const resume = await db.resumes.get(id)

    return resume ? normalizeResume(resume) : undefined
  },

  async save(resume: Resume) {
    return db.resumes.put(normalizeResume(resume))
  },

  async saveMany(resumes: Resume[]) {
    return db.resumes.bulkPut(resumes.map(normalizeResume))
  },

  async remove(id: string) {
    return db.resumes.delete(id)
  },
}
