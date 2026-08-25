export type TemplateId = "classic" | "modern"
export type CertificateGroupId = "certificates" | "competition" | "graduate" | "undergraduate" | "other"
export type ExperienceKind = "internship" | "work" | "campus" | "volunteer"

export type ResumeDesign = {
  accentColor: string
  fontScale: "compact" | "normal" | "large"
  sidebarFontScale: "compact" | "normal" | "large"
  contentFontScale: "compact" | "normal" | "large"
  baseFontSize: number
  sidebarFontSize: number
  contentFontSize: number
  awardLineGap: number
  density: "compact" | "comfortable"
  showPhoto: boolean
  photoShape: "circle" | "rounded"
  photoFit: "contain" | "cover"
  photoPosition: "top" | "center" | "bottom"
  photoRotate: number
}

export type ResumeSectionTitles = {
  profile: string
  summary: string
  skills: string
  certificates: string
  education: string
  internship: string
  work: string
  professionalExperience: string
  projects: string
  campus: string
  volunteer: string
  campusVolunteer: string
}

export type Resume = {
  id: string
  title: string
  templateId: TemplateId
  design: ResumeDesign
  classicDesign: ResumeDesign
  sectionTitles: ResumeSectionTitles
  basics: BasicInfo
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: SkillGroup[]
  certificates: Certificate[]
  summary: string
  createdAt: string
  updatedAt: string
}

export type BasicInfo = {
  photo: string
  name: string
  jobTitle: string
  email: string
  phone: string
  location: string
  politicalStatus: string
  website: string
  github: string
  linkedin: string
}

export type Education = {
  id: string
  school: string
  degree: string
  major: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  highlights: string[]
}

export type Experience = {
  id: string
  kind: ExperienceKind
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  dateLabel: string
  highlights: string[]
}

export type Project = {
  id: string
  name: string
  role: string
  url: string
  startDate: string
  endDate: string
  techStack: string[]
  highlights: string[]
}

export type SkillGroup = {
  id: string
  name: string
  skills: string[]
}

export type Certificate = {
  id: string
  name: string
  displayName: string
  count: number
  groupId: CertificateGroupId
  featured: boolean
  issuer: string
  date: string
  url: string
}

export type ResumeBackup = {
  app: "resume-maker"
  version: 1
  exportedAt: string
  resumes: Resume[]
}
