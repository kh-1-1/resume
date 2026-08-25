import type { TemplateId } from "@/types/resume"

type TemplateMeta = {
  id: TemplateId
  name: string
  description: string
}

export const templates: TemplateMeta[] = [
  {
    id: "classic",
    name: "经典",
    description: "清晰单栏，适合投递和 ATS 解析",
  },
  {
    id: "modern",
    name: "现代",
    description: "信息层级更强，适合作品集和产品技术岗位",
  },
]

export function getTemplateName(templateId: TemplateId) {
  return templates.find((template) => template.id === templateId)?.name ?? "经典"
}
