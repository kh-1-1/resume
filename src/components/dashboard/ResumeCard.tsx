import { useState } from "react"
import { CalendarClock, Copy, Download, FileText, Gauge, MoreHorizontal, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDropdownMenu } from "@/components/ui/useDropdownMenu"
import { ResumeThumbnail } from "@/components/dashboard/ResumeThumbnail"
import { getTemplateName } from "@/constants/templates"
import type { Resume } from "@/types/resume"
import { formatDateTime } from "@/utils/date"
import { analyzeResume } from "@/utils/resumeAnalysis"

type ResumeCardProps = {
  resume: Resume
  onOpen: (resume: Resume) => void
  onDelete: (resume: Resume) => void
  onDuplicate: (resume: Resume) => void
  onExport: (resume: Resume) => void
}

type ResumeCardMenuProps = {
  resume: Resume
  onDelete: (resume: Resume) => void
  onDuplicate: (resume: Resume) => void
  onExport: (resume: Resume) => void
}

function ResumeCardMenu({ resume, onDelete, onDuplicate, onExport }: ResumeCardMenuProps) {
  const [open, setOpen] = useState(false)
  const { containerRef, triggerRef, handleKeyDown } = useDropdownMenu(open, setOpen)

  function run(action: (resume: Resume) => void) {
    setOpen(false)
    action(resume)
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation()
        handleKeyDown(event)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="更多操作"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.35rem)] z-20 w-40 overflow-hidden rounded-md border border-border bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => run(onExport)}
          >
            <Download className="size-4" />
            导出 JSON
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => run(onDuplicate)}
          >
            <Copy className="size-4" />
            复制简历
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-destructive hover:bg-secondary"
            onClick={() => run(onDelete)}
          >
            <Trash2 className="size-4" />
            删除
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ResumeCard({ resume, onOpen, onDelete, onDuplicate, onExport }: ResumeCardProps) {
  const displayName = resume.basics.name || resume.title || "未命名简历"
  const analysis = analyzeResume(resume)
  const openResume = () => onOpen(resume)

  return (
    <Card
      className="group relative overflow-visible rounded-md border-[#d7e0e7] shadow-[0_3px_14px_rgba(20,39,57,0.06)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#9db2c2] hover:shadow-[0_12px_28px_rgba(20,39,57,0.11)] focus-within:border-[#2b706a]"
      data-resume-id={resume.id}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-md"
        style={{ backgroundColor: resume.templateId === "classic" ? resume.classicDesign.accentColor : resume.design.accentColor }}
      />
      <button
        type="button"
        className="flex min-h-48 w-full gap-5 p-5 pr-14 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`编辑简历：${resume.title || displayName}`}
        onClick={openResume}
      >
        <ResumeThumbnail resume={resume} />
        <span className="flex min-w-0 flex-1 flex-col py-0.5">
          <span className="min-w-0 truncate text-lg font-semibold leading-tight text-[#10263a]">
            {resume.title || "未命名简历"}
          </span>
          <span className="mt-1.5 truncate text-sm text-[#657483]">
            {displayName}
            {resume.basics.jobTitle ? ` · ${resume.basics.jobTitle}` : ""}
          </span>
          <span className="mt-3 flex items-center gap-2">
            <Badge className="border-[#d7e0e7] bg-[#eef3f6] text-[#31475a]">
              {getTemplateName(resume.templateId)}模板
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-[#657483]">
              <FileText className="size-3.5" />
              {analysis.estimatedPages} 页
            </span>
          </span>
          <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-[#73818e]">
            <CalendarClock className="size-3.5" />
            更新于 {formatDateTime(resume.updatedAt)}
          </span>
          <span className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
            <span className="h-1.5 overflow-hidden rounded-full bg-[#e3e9ee]">
              <span
                className="block h-full rounded-full bg-[#2b706a]"
                style={{ width: `${analysis.completion}%` }}
              />
            </span>
            <span className="text-xs font-medium text-[#31475a]">完整度 {analysis.completion}%</span>
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#657483]">
            <Gauge className="size-3.5" />
            内容检查 {analysis.score}
          </span>
        </span>
      </button>
      <div className="absolute right-3 top-4 z-20">
        <ResumeCardMenu
          resume={resume}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onExport={onExport}
        />
      </div>
    </Card>
  )
}
