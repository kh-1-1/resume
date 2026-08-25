import * as React from "react"
import { ClassicTemplate } from "@/components/templates/ClassicTemplate"
import { ModernTemplate } from "@/components/templates/ModernTemplate"
import type { Resume } from "@/types/resume"

type ResumePreviewProps = {
  resume: Resume
  screenScale?: number
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}

const a4WidthPx = (210 / 25.4) * 96
const a4HeightPx = (297 / 25.4) * 96
const screenPageGapPx = 18

const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({
  resume,
  screenScale = 1,
  editable = false,
  onEdit,
}, ref) => {
  const Template = resume.templateId === "modern" ? ModernTemplate : ClassicTemplate
  const pageRef = React.useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = React.useState(1)

  React.useImperativeHandle(ref, () => pageRef.current as HTMLDivElement)

  React.useLayoutEffect(() => {
    const element = pageRef.current

    if (!element) {
      return
    }

    const updatePageCount = () => {
      const width = element.getBoundingClientRect().width
      const pageHeight = width * (297 / 210)
      const contentElement = element.querySelector<HTMLElement>("[data-resume-content]")
      const contentHeight = contentElement
        ? Math.max(contentElement.scrollHeight, contentElement.getBoundingClientRect().height)
        : pageHeight
      const nextPageCount = Math.max(1, Math.ceil((Math.max(contentHeight, pageHeight) - 1) / pageHeight))

      setPageCount(nextPageCount)
    }

    const observer = new ResizeObserver(updatePageCount)
    const contentElement = element.querySelector<HTMLElement>("[data-resume-content]")

    updatePageCount()
    observer.observe(element)
    if (contentElement) {
      observer.observe(contentElement)
    }

    return () => observer.disconnect()
  }, [resume])

  return (
    <>
      <div ref={pageRef} className="resume-page resume-print-source print-preserve-color overflow-visible">
        <Template resume={resume} />
      </div>

      <div
        className="resume-screen-stage no-print"
        style={{
          width: `${a4WidthPx * screenScale}px`,
          height: `${(a4HeightPx * pageCount + screenPageGapPx * (pageCount - 1)) * screenScale}px`,
        }}
      >
        <div
          className={`resume-screen-pages ${editable ? "resume-preview-editing" : ""}`}
          data-screen-scale={screenScale}
          style={{ transform: `scale(${screenScale})` }}
          aria-label={`简历预览，共 ${pageCount} 页`}
        >
          {Array.from({ length: pageCount }).map((_, index) => (
            <div key={index} className="resume-page resume-screen-page print-preserve-color">
              <div className="resume-page-slice" style={{ transform: `translateY(-${index * 297}mm)` }}>
                <Template resume={resume} editable={editable} onEdit={onEdit} />
              </div>
              <div className="preview-page-count" aria-hidden="true">
                第 {index + 1} / {pageCount} 页
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
})
ResumePreview.displayName = "ResumePreview"

export { ResumePreview }
