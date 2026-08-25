import { ClassicTemplate } from "@/components/templates/ClassicTemplate"
import { ModernTemplate } from "@/components/templates/ModernTemplate"
import type { Resume } from "@/types/resume"

type ResumeThumbnailProps = {
  resume: Resume
}

const thumbnailWidth = 102
const a4WidthPx = (210 / 25.4) * 96
const thumbnailScale = thumbnailWidth / a4WidthPx

export function ResumeThumbnail({ resume }: ResumeThumbnailProps) {
  const Template = resume.templateId === "modern" ? ModernTemplate : ClassicTemplate

  return (
    <div
      className="h-[144px] w-[102px] shrink-0 overflow-hidden border border-[#cbd6df] bg-white shadow-[0_4px_12px_rgba(25,43,60,0.1)]"
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
