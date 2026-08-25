import { nanoid } from "nanoid"
import type {
  Certificate,
  Education,
  Experience,
  Project,
  Resume,
  ResumeDesign,
  ResumeSectionTitles,
  SkillGroup,
} from "@/types/resume"
import { normalizeCertificate } from "@/constants/certificateGroups"
import { nowIso } from "@/utils/date"
import { normalizeExperience } from "@/utils/experience"

export function createEmptyEducation(): Education {
  return {
    id: nanoid(),
    school: "",
    degree: "",
    major: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    highlights: [],
  }
}

export function createEmptyExperience(): Experience {
  return {
    id: nanoid(),
    kind: "internship",
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    dateLabel: "",
    highlights: [],
  }
}

export function createEmptyProject(): Project {
  return {
    id: nanoid(),
    name: "",
    role: "",
    url: "",
    startDate: "",
    endDate: "",
    techStack: [],
    highlights: [],
  }
}

export function createEmptySkillGroup(): SkillGroup {
  return {
    id: nanoid(),
    name: "",
    skills: [],
  }
}

export function createEmptyCertificate(): Certificate {
  return {
    id: nanoid(),
    name: "",
    displayName: "",
    count: 1,
    groupId: "other",
    featured: false,
    issuer: "",
    date: "",
    url: "",
  }
}

export function createDefaultDesign(): ResumeDesign {
  return {
    accentColor: "#173b57",
    fontScale: "normal",
    sidebarFontScale: "normal",
    contentFontScale: "normal",
    baseFontSize: 17,
    sidebarFontSize: 17,
    contentFontSize: 17,
    awardLineGap: 0.18,
    density: "comfortable",
    showPhoto: true,
    photoShape: "circle",
    photoFit: "contain",
    photoPosition: "center",
    photoRotate: 0,
  }
}

export function createClassicDefaultDesign(): ResumeDesign {
  return {
    ...createDefaultDesign(),
    baseFontSize: 17.68,
    density: "compact",
    photoShape: "rounded",
  }
}

export function createDefaultSectionTitles(): ResumeSectionTitles {
  return {
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
}

export function createEmptyResume(title = "未命名简历"): Resume {
  const timestamp = nowIso()

  return {
    id: nanoid(),
    title,
    templateId: "classic",
    design: createDefaultDesign(),
    classicDesign: createClassicDefaultDesign(),
    sectionTitles: createDefaultSectionTitles(),
    basics: {
      photo: "",
      name: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      politicalStatus: "",
      website: "",
      github: "",
      linkedin: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certificates: [],
    summary: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createSampleResume() {
  const resume = createEmptyResume("我的默认简历")

  return {
    ...resume,
    templateId: "modern",
    design: {
      accentColor: "#173b57",
      fontScale: "normal",
      sidebarFontScale: "normal",
      contentFontScale: "normal",
      baseFontSize: 17,
      sidebarFontSize: 17,
      contentFontSize: 17,
      awardLineGap: 0.18,
      density: "comfortable",
      showPhoto: true,
      photoShape: "circle",
      photoFit: "contain",
      photoPosition: "center",
      photoRotate: 0,
    },
    basics: {
      ...resume.basics,
      name: "你的姓名",
      jobTitle: "目标岗位 / 求职方向",
      email: "yourname@example.com",
      phone: "138 0000 0000",
      location: "城市",
      politicalStatus: "",
      website: "https://your-portfolio.com",
      github: "github.com/yourname",
      linkedin: "linkedin.com/in/yourname",
    },
    summary:
      "把这里改成 2 到 4 句个人简介：说明你的经验年限、核心方向、擅长领域，以及最能证明能力的结果。尽量写具体成果，例如性能提升、业务转化、用户规模或交付效率。",
    experience: [
      {
        id: nanoid(),
        kind: "work",
        company: "公司名称",
        position: "职位名称",
        location: "城市",
        startDate: "2023-01",
        endDate: "",
        current: true,
        dateLabel: "",
        highlights: [
          "负责核心业务模块的设计与开发，推动功能从需求评审到上线交付",
          "优化关键页面体验或性能，把加载时间、转化率、稳定性等指标写成可量化结果",
          "沉淀组件、流程或文档，让团队协作效率提升",
        ],
      },
    ],
    projects: [
      {
        id: nanoid(),
        name: "代表项目名称",
        role: "项目角色",
        url: "",
        startDate: "2024-01",
        endDate: "2024-06",
        techStack: ["React", "TypeScript", "Tailwind CSS"],
        highlights: [
          "说明项目解决了什么问题，以及你负责的关键部分",
          "写清楚技术方案、业务价值和最终结果，避免只罗列职责",
        ],
      },
    ],
    education: [
      {
        id: nanoid(),
        school: "学校名称",
        degree: "学历",
        major: "专业",
        location: "城市",
        startDate: "2018-09",
        endDate: "2022-06",
        current: false,
        highlights: [],
      },
    ],
    skills: [
      {
        id: nanoid(),
        name: "核心技能",
        skills: ["技能 1", "技能 2", "技能 3"],
      },
      {
        id: nanoid(),
        name: "工具 / 方法",
        skills: ["工具 1", "工具 2", "方法 1"],
      },
    ],
    certificates: [],
  } satisfies Resume
}

export function normalizeResume(resume: Resume): Resume {
  const empty = createEmptyResume(resume.title || "未命名简历")
  const storedClassicDesign = (resume as Resume & { classicDesign?: ResumeDesign }).classicDesign
  const storedSectionTitles = (resume as Resume & { sectionTitles?: Partial<ResumeSectionTitles> }).sectionTitles
  const legacyClassicDesign = resume.templateId === "classic" ? resume.design : undefined
  const inferredPoliticalStatus =
    resume.basics.politicalStatus ||
    ([
      resume.summary,
      ...resume.education.flatMap((item) => item.highlights),
      ...resume.experience.flatMap((item) => item.highlights),
      ...resume.projects.flatMap((item) => item.highlights),
    ].some((item) => item.includes("中共党员"))
      ? "中共党员"
      : "")

  return {
    ...empty,
    ...resume,
    design: {
      ...empty.design,
      ...resume.design,
    },
    classicDesign: {
      ...empty.classicDesign,
      ...(storedClassicDesign ?? legacyClassicDesign),
    },
    sectionTitles: {
      ...empty.sectionTitles,
      ...storedSectionTitles,
    },
    basics: {
      ...empty.basics,
      ...resume.basics,
      politicalStatus: inferredPoliticalStatus,
    },
    experience: resume.experience.map((item) => normalizeExperience(item)),
    certificates: resume.certificates.map((item) => normalizeCertificate(item)),
  }
}

export function cloneResume(resume: Resume, titleSuffix = "副本"): Resume {
  const normalized = normalizeResume(resume)
  const timestamp = nowIso()

  return {
    ...normalized,
    id: nanoid(),
    title: `${normalized.title || normalized.basics.name || "未命名简历"} ${titleSuffix}`,
    education: normalized.education.map((item) => ({ ...item, id: nanoid() })),
    experience: normalized.experience.map((item) => ({ ...item, id: nanoid() })),
    projects: normalized.projects.map((item) => ({ ...item, id: nanoid() })),
    skills: normalized.skills.map((item) => ({ ...item, id: nanoid() })),
    certificates: normalized.certificates.map((item) => ({ ...item, id: nanoid() })),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
