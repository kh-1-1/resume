import { ClassicTemplate } from "@/components/templates/ClassicTemplate"
import { ModernTemplate } from "@/components/templates/ModernTemplate"
import type { Resume } from "@/types/resume"

type ResumeThumbnailProps = {
  resume: Resume
}

const thumbnailWidth = 82
const a4WidthPx = (210 / 25.4) * 96
const thumbnailScale = thumbnailWidth / a4WidthPx

export function ResumeThumbnail({ resume }: ResumeThumbnailProps) {
  const Template = resume.templateId === "modern" ? ModernTemplate : ClassicTemplate

  return (
    <div
      className="h-[116px] w-[82px] shrink-0 overflow-hidden border border-border bg-white shadow-sm"
      aria-hidden="true"
      inert
    >
      <div
        style={{
          width: "210mm",
          transform: `scale(${thumbnailScale})`,
          transformOrigin: "left top",
        }}
      >
        <Template resume={resume} />
      </div>
    </div>
  )
}
