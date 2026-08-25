import { useState } from "react"
import { Copy, Download, FileText, MoreHorizontal, Trash2 } from "lucide-react"
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
      className="relative overflow-visible transition-colors hover:border-primary/50 hover:bg-white focus-within:border-primary/50"
      data-resume-id={resume.id}
    >
      <button
        type="button"
        className="flex w-full gap-4 p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label={`编辑简历：${resume.title || displayName}`}
        onClick={openResume}
      >
        <ResumeThumbnail resume={resume} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="min-w-0 truncate text-base font-semibold text-foreground">
            {resume.title || "未命名简历"}
          </span>
          <span className="mt-1 truncate text-sm text-muted-foreground">
            {displayName}
            {resume.basics.jobTitle ? ` · ${resume.basics.jobTitle}` : ""}
          </span>
          <span className="mt-2">
            <Badge variant="secondary">{getTemplateName(resume.templateId)}</Badge>
          </span>
          <span className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            更新于 {formatDateTime(resume.updatedAt)}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline">完整度 {analysis.completion}%</Badge>
            <Badge variant="outline">检查 {analysis.score}</Badge>
            <Badge variant="outline">{analysis.estimatedPages} 页</Badge>
          </span>
        </span>
      </button>
      <div className="absolute right-3 top-3 z-20">
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
