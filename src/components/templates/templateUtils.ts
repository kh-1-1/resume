import type { Resume } from "@/types/resume"
import { createDefaultDesign } from "@/utils/createEmptyResume"

export function hasText(value: string) {
  return value.trim().length > 0
}

export function compact(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

export function contactItems(resume: Resume) {
  return compact([
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.website,
    resume.basics.github,
    resume.basics.linkedin,
  ])
}

export function getResumeDesign(resume: Resume) {
  const templateDesign = resume.templateId === "classic" ? resume.classicDesign : resume.design

  return {
    ...createDefaultDesign(),
    ...templateDesign,
  }
}

export function resumeFontSize(design: ReturnType<typeof getResumeDesign>) {
  return fontSizeCss(design.baseFontSize, design.fontScale)
}

export function resumeSidebarFontSize(design: ReturnType<typeof getResumeDesign>) {
  return fontSizeCss(design.sidebarFontSize, design.sidebarFontScale ?? design.fontScale)
}

export function resumeContentFontSize(design: ReturnType<typeof getResumeDesign>) {
  return fontSizeCss(design.contentFontSize, design.contentFontScale ?? design.fontScale)
}

function fontSizeCss(value: number, fallbackScale: "compact" | "normal" | "large") {
  const fallback = fontSizeFromScale(fallbackScale)
  const size = Number.isFinite(value) ? value : fallback
  const clamped = Math.max(12, Math.min(24, size))

  return `${clamped}px`
}

function fontSizeFromScale(scale: "compact" | "normal" | "large") {
  if (scale === "compact") {
    return 15.8
  }

  if (scale === "large") {
    return 18
  }

  return 17
}

export function photoObjectStyle(design: ReturnType<typeof getResumeDesign>) {
  const rotate = Number.isFinite(design.photoRotate)
    ? Math.max(-5, Math.min(5, design.photoRotate))
    : 0
  const objectPosition =
    design.photoPosition === "top"
      ? "center top"
      : design.photoPosition === "bottom"
        ? "center bottom"
        : "center center"

  return {
    objectFit: design.photoFit === "cover" ? "cover" : "contain",
    objectPosition,
    transform: `rotate(${rotate}deg) scale(${rotate === 0 ? 1 : 1.03})`,
    transformOrigin: "center center",
  } as const
}

export function getInitials(name: string) {
  const trimmed = name.trim()

  if (!trimmed) {
    return "简"
  }

  if (/^[a-z\s]+$/i.test(trimmed)) {
    return trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }

  return trimmed.slice(0, 1)
}

export function alphaColor(hex: string, alphaHex = "14") {
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return `${hex}${alphaHex}`
  }

  return `#173b57${alphaHex}`
}

export function hasResumeContent(resume: Resume) {
  return Boolean(
    hasText(resume.summary) ||
      resume.education.length ||
      resume.experience.length ||
      resume.projects.length ||
      resume.skills.length ||
      resume.certificates.length,
  )
}
