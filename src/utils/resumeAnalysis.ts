import type { Resume } from "@/types/resume"
import { compact, getResumeDesign } from "@/components/templates/templateUtils"

export type ResumeCheckLevel = "good" | "warning" | "danger"

export type ResumeCheck = {
  id: string
  label: string
  detail: string
  level: ResumeCheckLevel
}

export type ResumeAnalysis = {
  score: number
  completion: number
  completedFields: number
  totalFields: number
  wordCount: number
  lineCount: number
  estimatedPages: number
  checks: ResumeCheck[]
  strengths: string[]
  nextActions: string[]
}

function hasText(value: string) {
  return value.trim().length > 0
}

function countTruthy(values: boolean[]) {
  return values.filter(Boolean).length
}

function textItems(resume: Resume) {
  const basics = resume.basics

  return [
    resume.title,
    resume.summary,
    basics.name,
    basics.jobTitle,
    basics.email,
    basics.phone,
    basics.location,
    basics.politicalStatus,
    basics.website,
    basics.github,
    basics.linkedin,
    ...resume.education.flatMap((item) => [
      item.school,
      item.degree,
      item.major,
      item.location,
      ...item.highlights,
    ]),
    ...resume.experience.flatMap((item) => [
      item.company,
      item.position,
      item.location,
      ...item.highlights,
    ]),
    ...resume.projects.flatMap((item) => [
      item.name,
      item.role,
      item.url,
      ...item.techStack,
      ...item.highlights,
    ]),
    ...resume.skills.flatMap((item) => [item.name, ...item.skills]),
    ...resume.certificates.flatMap((item) => [item.name, item.issuer, item.url]),
  ]
}

function addCheck(
  checks: ResumeCheck[],
  id: string,
  label: string,
  passed: boolean,
  goodDetail: string,
  badDetail: string,
  level: ResumeCheckLevel = "warning",
) {
  checks.push({
    id,
    label,
    detail: passed ? goodDetail : badDetail,
    level: passed ? "good" : level,
  })
}

export function analyzeResume(resume: Resume): ResumeAnalysis {
  const design = getResumeDesign(resume)
  const contactCount = countTruthy([
    hasText(resume.basics.email),
    hasText(resume.basics.phone),
    hasText(resume.basics.location),
    hasText(resume.basics.website),
    hasText(resume.basics.github),
    hasText(resume.basics.linkedin),
  ])
  const experienceHighlights = resume.experience.flatMap((item) => compact(item.highlights))
  const projectHighlights = resume.projects.flatMap((item) => compact(item.highlights))
  const skillCount = resume.skills.reduce((total, group) => total + compact(group.skills).length, 0)
  const hasQuantifiedImpact = [...experienceHighlights, ...projectHighlights].some((item) =>
    /\d|%|倍|万|千|百|提升|降低|增长|减少|节省|覆盖|用户|转化/.test(item),
  )
  const hasDates = [
    ...resume.experience.map((item) => hasText(item.startDate) && (hasText(item.endDate) || item.current)),
    ...resume.education.map((item) => hasText(item.startDate) && (hasText(item.endDate) || item.current)),
  ].some(Boolean)
  const checks: ResumeCheck[] = []

  addCheck(
    checks,
    "basics-name",
    "姓名",
    hasText(resume.basics.name),
    "姓名已填写。",
    "缺少姓名，招聘方第一眼会不明确。",
    "danger",
  )
  addCheck(
    checks,
    "contact",
    "联系方式",
    contactCount >= 2,
    "联系方式足够，建议保留邮箱和电话。",
    "至少填写邮箱和电话，避免无法联系。",
    "danger",
  )
  addCheck(
    checks,
    "summary",
    "个人总结",
    !hasText(resume.summary) || resume.summary.trim().length >= 40,
    hasText(resume.summary) ? "个人总结有基本信息量。" : "个人总结未填写，当前按可选项处理。",
    "总结偏短；如果保留这一栏，建议写 2 到 4 句。",
  )
  addCheck(
    checks,
    "experience",
    "工作经历",
    resume.experience.length > 0 && experienceHighlights.length >= resume.experience.length,
    "工作经历有可读亮点。",
    "工作经历缺少亮点，每段经历至少写 1 到 3 条成果。",
  )
  addCheck(
    checks,
    "projects",
    "项目经历",
    resume.projects.length > 0 && projectHighlights.length >= resume.projects.length,
    "项目经历有可读亮点。",
    "项目经历可以补充代表项目，突出技术方案和业务结果。",
  )
  addCheck(
    checks,
    "skills",
    "技能",
    skillCount >= 4,
    "技能信息较完整。",
    "技能偏少，建议按类别写核心技能、工具和方法。",
  )
  addCheck(
    checks,
    "dates",
    "时间线",
    hasDates,
    "经历或教育包含时间线。",
    "缺少时间线，建议填写年月，方便招聘方判断经验连续性。",
  )
  addCheck(
    checks,
    "impact",
    "量化结果",
    hasQuantifiedImpact,
    "已经出现量化或结果描述。",
    "亮点里缺少量化结果，建议写提升、降低、覆盖、转化、规模等指标。",
  )
  addCheck(
    checks,
    "ats",
    "ATS 友好",
    resume.templateId === "classic" || !resume.design.showPhoto,
    "当前设置更偏 ATS 友好。",
    "双栏或照片模板更适合人工阅读；正式网投可另存一份 Classic 无照片版本。",
  )

  const requiredFields = [
    hasText(resume.basics.name),
    hasText(resume.basics.email),
    hasText(resume.basics.phone),
    resume.experience.length > 0,
    experienceHighlights.length > 0,
    resume.projects.length > 0,
    projectHighlights.length > 0,
    resume.education.length > 0,
    skillCount > 0,
    hasDates,
  ]
  const completedFields = countTruthy(requiredFields)
  const totalFields = requiredFields.length
  const completion = Math.round((completedFields / totalFields) * 100)
  const goodCount = checks.filter((check) => check.level === "good").length
  const score = Math.round((goodCount / checks.length) * 100)
  const text = textItems(resume).join("\n")
  const wordCount = compact(text.split(/[\s,，。；;、/|]+/)).length
  const lineCount =
    8 +
    resume.summary.split(/\n/).filter(Boolean).length +
    resume.experience.length * 3 +
    experienceHighlights.length +
    resume.projects.length * 3 +
    projectHighlights.length +
    resume.education.length * 2 +
    resume.skills.length * 2 +
    Math.ceil(resume.certificates.length / 3)
  const pageCapacity =
    resume.templateId === "modern"
      ? design.density === "compact"
        ? 86
        : 66
      : design.density === "compact"
        ? 46
        : 39
  const estimatedPages = Math.max(1, Math.ceil(lineCount / pageCapacity))
  const nextActions = checks
    .filter((check) => check.level !== "good")
    .slice(0, 4)
    .map((check) => check.detail)

  return {
    score,
    completion,
    completedFields,
    totalFields,
    wordCount,
    lineCount,
    estimatedPages,
    checks,
    strengths: checks.filter((check) => check.level === "good").map((check) => check.label),
    nextActions,
  }
}
