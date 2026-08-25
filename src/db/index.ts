import Dexie, { type Table } from "dexie"
import type { Resume } from "@/types/resume"

class ResumeMakerDatabase extends Dexie {
  resumes!: Table<Resume, string>

  constructor() {
    super("resume_maker_db")

    this.version(1).stores({
      resumes: "id, title, templateId, createdAt, updatedAt",
    })
  }
}

export const db = new ResumeMakerDatabase()
