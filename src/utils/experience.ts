import type { Experience, ExperienceKind } from "@/types/resume"
import { formatDateRange } from "@/utils/date"

export const experienceKindOptions: Array<{ value: ExperienceKind; label: string }> = [
  { value: "internship", label: "实习经历" },
  { value: "work", label: "工作经历" },
  { value: "campus", label: "校园经历" },
  { value: "volunteer", label: "志愿服务" },
]

export const experienceKindLabels: Record<ExperienceKind, string> = {
  internship: "实习",
  work: "工作",
  campus: "校园",
  volunteer: "志愿",
}

type LegacyExperience = Partial<Experience> & Pick<Experience, "id" | "company" | "position">

export function inferExperienceKind(item: LegacyExperience): ExperienceKind {
  if (
    item.kind === "internship" ||
    item.kind === "work" ||
    item.kind === "campus" ||
    item.kind === "volunteer"
  ) {
    return item.kind
  }

  if (
    item.id.includes("student") ||
    item.id.includes("branch") ||
    item.id.includes("party") ||
    item.position.includes("学生") ||
    item.position.includes("党总支") ||
    item.company.includes("大学")
  ) {
    return "campus"
  }

  return "internship"
}

export function normalizeExperience(item: Experience): Experience {
  return {
    ...item,
    kind: inferExperienceKind(item),
    dateLabel:
      item.dateLabel ??
      (item.id === "exp-branch-class-combined" ? "2020.09 - 2024.06 / 2025.10 - 至今" : ""),
  }
}

export function getExperienceDateLabel(item: Experience) {
  return item.dateLabel.trim() || formatDateRange(item.startDate, item.endDate, item.current)
}
