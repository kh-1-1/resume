import { z } from "zod"

export const templateIdSchema = z.union([z.literal("classic"), z.literal("modern")])
export const certificateGroupIdSchema = z.union([
  z.literal("certificates"),
  z.literal("competition"),
  z.literal("graduate"),
  z.literal("undergraduate"),
  z.literal("other"),
])
export const experienceKindSchema = z.union([
  z.literal("internship"),
  z.literal("work"),
  z.literal("campus"),
  z.literal("volunteer"),
])

const stringArraySchema = z.array(z.string())

export const resumeDesignSchema = z.object({
  accentColor: z.string().default("#173b57"),
  fontScale: z.union([z.literal("compact"), z.literal("normal"), z.literal("large")]).default("normal"),
  sidebarFontScale: z.union([z.literal("compact"), z.literal("normal"), z.literal("large")]).default("normal"),
  contentFontScale: z.union([z.literal("compact"), z.literal("normal"), z.literal("large")]).default("normal"),
  baseFontSize: z.number().min(12).max(24).default(17),
  sidebarFontSize: z.number().min(12).max(24).default(17),
  contentFontSize: z.number().min(12).max(24).default(17),
  awardLineGap: z.number().min(0).max(1.2).default(0.18),
  density: z.union([z.literal("compact"), z.literal("comfortable")]).default("comfortable"),
  showPhoto: z.boolean().default(true),
  photoShape: z.union([z.literal("circle"), z.literal("rounded")]).default("circle"),
  photoFit: z.union([z.literal("contain"), z.literal("cover")]).default("contain"),
  photoPosition: z
    .union([z.literal("top"), z.literal("center"), z.literal("bottom")])
    .default("center"),
  photoRotate: z.number().min(-5).max(5).default(0),
})

const defaultResumeDesign = {
  accentColor: "#173b57",
  fontScale: "normal" as const,
  sidebarFontScale: "normal" as const,
  contentFontScale: "normal" as const,
  baseFontSize: 17,
  sidebarFontSize: 17,
  contentFontSize: 17,
  awardLineGap: 0.18,
  density: "comfortable" as const,
  showPhoto: true,
  photoShape: "circle" as const,
  photoFit: "contain" as const,
  photoPosition: "center" as const,
  photoRotate: 0,
}

const defaultSectionTitles = {
  profile: "个人资料",
  summary: "个人简介",
  skills: "专业技能",
  certificates: "荣誉证书",
  education: "教育经历",
  internship: "实习经历",
  work: "工作经历",
  professionalExperience: "实习 / 工作经历",
  projects: "项目经历",
  campus: "校园经历",
  volunteer: "志愿服务",
  campusVolunteer: "校园 / 志愿经历",
}

export const resumeSectionTitlesSchema = z.object({
  profile: z.string().default(defaultSectionTitles.profile),
  summary: z.string().default(defaultSectionTitles.summary),
  skills: z.string().default(defaultSectionTitles.skills),
  certificates: z.string().default(defaultSectionTitles.certificates),
  education: z.string().default(defaultSectionTitles.education),
  internship: z.string().default(defaultSectionTitles.internship),
  work: z.string().default(defaultSectionTitles.work),
  professionalExperience: z.string().default(defaultSectionTitles.professionalExperience),
  projects: z.string().default(defaultSectionTitles.projects),
  campus: z.string().default(defaultSectionTitles.campus),
  volunteer: z.string().default(defaultSectionTitles.volunteer),
  campusVolunteer: z.string().default(defaultSectionTitles.campusVolunteer),
})

export const basicInfoSchema = z.object({
  photo: z.string().default(""),
  name: z.string(),
  jobTitle: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  politicalStatus: z.string().default(""),
  website: z.string(),
  github: z.string(),
  linkedin: z.string(),
})

export const educationSchema = z.object({
  id: z.string().min(1),
  school: z.string(),
  degree: z.string(),
  major: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  highlights: stringArraySchema,
})

export const experienceSchema = z.object({
  id: z.string().min(1),
  kind: experienceKindSchema.default("internship"),
  company: z.string(),
  position: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  dateLabel: z.string().default(""),
  highlights: stringArraySchema,
})

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  role: z.string(),
  url: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  techStack: stringArraySchema,
  highlights: stringArraySchema,
})

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  skills: stringArraySchema,
})

export const certificateSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  displayName: z.string().default(""),
  count: z.number().min(1).max(20).default(1),
  groupId: certificateGroupIdSchema.default("other"),
  featured: z.boolean().default(false),
  issuer: z.string(),
  date: z.string(),
  url: z.string(),
})

export const resumeSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  templateId: templateIdSchema,
  design: resumeDesignSchema.default(defaultResumeDesign),
  classicDesign: resumeDesignSchema.default(defaultResumeDesign),
  sectionTitles: resumeSectionTitlesSchema.default(defaultSectionTitles),
  basics: basicInfoSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillGroupSchema),
  certificates: z.array(certificateSchema),
  summary: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const resumeBackupSchema = z.object({
  app: z.literal("resume-maker"),
  version: z.literal(1),
  exportedAt: z.string(),
  resumes: z.array(resumeSchema),
})
