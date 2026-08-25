import type { Resume } from "@/types/resume"
import { getCertificateDisplayName } from "@/constants/certificateGroups"
import { formatDateRange, formatMonth } from "@/utils/date"
import { compact } from "@/components/templates/templateUtils"
import { experienceKindOptions, getExperienceDateLabel } from "@/utils/experience"
import { downloadBlob } from "@/utils/download"

function section(title: string, content: string[]) {
  const lines = content.filter(Boolean)

  if (!lines.length) {
    return ""
  }

  return [`## ${title}`, ...lines].join("\n")
}

function bullets(items: string[]) {
  return compact(items).map((item) => `- ${item}`)
}

export function resumeToMarkdown(resume: Resume) {
  const contact = compact([
    resume.basics.politicalStatus,
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.website,
    resume.basics.github,
    resume.basics.linkedin,
  ])
  const parts = [
    `# ${resume.basics.name || resume.title || "简历"}`,
    resume.basics.jobTitle ? `**${resume.basics.jobTitle}**` : "",
    contact.length ? contact.join(" · ") : "",
    section("个人总结", [resume.summary]),
    ...experienceKindOptions.map(({ value, label }) =>
      section(
        label,
        resume.experience
          .filter((item) => item.kind === value)
          .flatMap((item) => [
            `### ${item.company || "单位"} · ${item.position || "职位"}`,
            compact([item.location, getExperienceDateLabel(item)]).join(" · "),
            ...bullets(item.highlights),
          ]),
      ),
    ),
    section(
      "项目经历",
      resume.projects.flatMap((item) => [
        `### ${item.name || "项目"}${item.role ? ` · ${item.role}` : ""}`,
        compact([item.url, formatDateRange(item.startDate, item.endDate)]).join(" · "),
        compact(item.techStack).length ? `技术栈：${compact(item.techStack).join(" / ")}` : "",
        ...bullets(item.highlights),
      ]),
    ),
    section(
      "教育经历",
      resume.education.flatMap((item) => [
        `### ${item.school || "学校"}`,
        compact([
          item.degree,
          item.major,
          item.location,
          formatDateRange(item.startDate, item.endDate, item.current),
        ]).join(" · "),
        ...bullets(item.highlights),
      ]),
    ),
    section(
      "技能",
      resume.skills.map((group) => `${group.name || "技能"}：${compact(group.skills).join(" / ")}`),
    ),
    section(
      "证书与奖项",
      resume.certificates.map((item) =>
        compact([getCertificateDisplayName(item), item.issuer, formatMonth(item.date), item.url]).join(" · "),
      ),
    ),
  ]

  return parts.filter(Boolean).join("\n\n")
}

export function resumeToPlainText(resume: Resume) {
  return resumeToMarkdown(resume)
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/\*\*/g, "")
}

export function downloadTextFile(content: string, fileName: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType })

  downloadBlob(blob, fileName)
}
