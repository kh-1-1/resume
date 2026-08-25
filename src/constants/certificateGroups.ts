import type { Certificate, CertificateGroupId } from "@/types/resume"

export type CertificateGroup = {
  id: CertificateGroupId
  title: string
}

export const certificateGroups: CertificateGroup[] = [
  {
    id: "certificates",
    title: "证书成果",
  },
  {
    id: "competition",
    title: "竞赛奖项",
  },
  {
    id: "graduate",
    title: "研究生荣誉",
  },
  {
    id: "undergraduate",
    title: "本科荣誉",
  },
  {
    id: "other",
    title: "其他",
  },
]
const validGroupIds = new Set<CertificateGroupId>(certificateGroups.map((group) => group.id))

function parseCount(value: string) {
  const countMatch = value.match(/[（(](\d+)次[）)]/)

  return countMatch ? Number(countMatch[1]) : undefined
}

export function getCertificateGroupId(item: Partial<Certificate>) {
  const groupId = item.groupId

  if (!groupId || !validGroupIds.has(groupId)) {
    return "other"
  }

  return groupId
}

export function getCertificateDisplayName(item: Partial<Certificate>) {
  return item.displayName?.trim() || item.name || "证书/奖项"
}

export function getCertificateCount(item: Partial<Certificate>) {
  const value = Number(item.count)

  if (Number.isFinite(value) && value >= 1) {
    return Math.round(value)
  }

  return parseCount(getCertificateDisplayName(item)) || parseCount(item.name || "") || 1
}

export function getCertificateGroupCount(items: Partial<Certificate>[]) {
  return items.reduce((total, item) => total + getCertificateCount(item), 0)
}

export function shouldHighlightCertificate(item: Partial<Certificate>) {
  return Boolean(item.featured)
}

export function normalizeCertificate(item: Partial<Certificate>): Certificate {
  const displayName = getCertificateDisplayName(item)
  const featured = shouldHighlightCertificate({ ...item, displayName })

  return {
    id: item.id || "",
    name: item.name || "",
    displayName,
    count: getCertificateCount({ ...item, displayName }),
    groupId: getCertificateGroupId(item),
    featured,
    issuer: item.issuer || "",
    date: item.date || "",
    url: item.url || "",
  }
}
