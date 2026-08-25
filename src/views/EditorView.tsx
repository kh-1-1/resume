import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLiveQuery } from "dexie-react-hooks"
import {
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Pencil,
  Printer,
  Save,
  SquareSplitHorizontal,
} from "lucide-react"
import { FormProvider, useForm, useWatch, type FieldPath, type Resolver } from "react-hook-form"
import { useReactToPrint } from "react-to-print"
import { BasicsForm } from "@/components/editor/BasicsForm"
import { CertificatesForm } from "@/components/editor/CertificatesForm"
import { EducationForm } from "@/components/editor/EducationForm"
import { ExperienceForm } from "@/components/editor/ExperienceForm"
import { ProjectsForm } from "@/components/editor/ProjectsForm"
import { ResumeHealthPanel } from "@/components/editor/ResumeHealthPanel"
import { SkillsForm } from "@/components/editor/SkillsForm"
import { ResumePreview } from "@/components/preview/ResumePreview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDropdownMenu } from "@/components/ui/useDropdownMenu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { templates } from "@/constants/templates"
import { resumeRepo } from "@/db/resumeRepo"
import { resumeSchema } from "@/schemas/resumeSchema"
import { useResumeStore } from "@/store/resumeStore"
import type { Resume, TemplateId } from "@/types/resume"
import { createEmptyResume, normalizeResume } from "@/utils/createEmptyResume"
import { cn } from "@/utils/cn"
import { nowIso } from "@/utils/date"
import { createResumeBackup, downloadJson, safeFileName } from "@/utils/exportJson"
import { downloadTextFile, resumeToMarkdown, resumeToPlainText } from "@/utils/exportText"
import { analyzeResume } from "@/utils/resumeAnalysis"

type EditorViewProps = {
  resumeId: string
}

type EditorTab = "basics" | "career" | "extras" | "check"
type ViewMode = "edit" | "split" | "preview"
type PreviewZoom = "fit" | "75" | "100"

const a4WidthPx = (210 / 25.4) * 96

const viewModes: Array<{
  id: ViewMode
  label: string
  icon: typeof Pencil
}> = [
  { id: "edit", label: "编辑", icon: Pencil },
  { id: "split", label: "对照", icon: SquareSplitHorizontal },
  { id: "preview", label: "预览", icon: Eye },
]

function goDashboard() {
  window.location.hash = "/"
}

function resumeContentKey(resume: Resume) {
  return JSON.stringify({
    ...resume,
    updatedAt: "",
  })
}

function statusLabel(status: string, error: string | null) {
  if (status === "saving") {
    return "保存中"
  }

  if (status === "saved") {
    return "已保存"
  }

  if (status === "error") {
    return error || "保存失败"
  }

  return "待编辑"
}

function hasText(value: string | undefined) {
  return Boolean(value?.trim())
}

function countDone(items: boolean[]) {
  return items.filter(Boolean).length
}

function hasDateRange(item: { startDate: string; endDate: string; current?: boolean }) {
  return hasText(item.startDate) && (hasText(item.endDate) || Boolean(item.current))
}

function tabStats(resume: Resume, score: number) {
  const basics = [
    hasText(resume.basics.name),
    hasText(resume.basics.email),
    hasText(resume.basics.phone),
    hasText(resume.basics.location),
    hasText(resume.basics.photo),
  ]
  const hasCampusExperience = resume.experience.some(
    (item) => item.kind === "campus" || item.kind === "volunteer",
  )
  const career = [
    resume.education.length > 0,
    resume.experience.length > 0,
    resume.projects.length > 0,
    hasCampusExperience,
    [...resume.education, ...resume.experience, ...resume.projects].some(hasDateRange),
  ]
  const extras = [resume.skills.length > 0, resume.certificates.length > 0]

  return {
    basics: `${countDone(basics)}/${basics.length}`,
    career: `${countDone(career)}/${career.length}`,
    extras: `${countDone(extras)}/${extras.length}`,
    check: String(score),
  }
}

type ExportMenuProps = {
  onExportJson: () => void
  onExportText: () => void
  onExportMarkdown: () => void
}

function ExportMenu({ onExportJson, onExportText, onExportMarkdown }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const { containerRef, triggerRef, handleKeyDown } = useDropdownMenu(open, setOpen)

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        className="w-9 bg-white px-0 sm:w-auto sm:px-3"
        aria-label="导出简历"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Download />
        <span className="hidden sm:inline">导出</span>
        <ChevronDown className={cn("hidden transition-transform sm:block", open ? "rotate-180" : "")} />
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.45rem)] z-30 w-48 overflow-hidden rounded-md border border-border bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => run(onExportJson)}
          >
            <Download className="size-4" />
            JSON 备份
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => run(onExportText)}
          >
            <FileText className="size-4" />
            TXT 文本
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            onClick={() => run(onExportMarkdown)}
          >
            <FileText className="size-4" />
            Markdown
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function EditorView({ resumeId }: EditorViewProps) {
  const storedResume = useLiveQuery(() => resumeRepo.get(resumeId), [resumeId], null)
  const defaultResume = useMemo(() => createEmptyResume(), [])
  const printRef = useRef<HTMLDivElement>(null)
  const previewPaneRef = useRef<HTMLElement>(null)
  const [actualPages, setActualPages] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<EditorTab>("basics")
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [previewZoom, setPreviewZoom] = useState<PreviewZoom>("fit")
  const [fitScale, setFitScale] = useState(1)
  const lastContentKeyRef = useRef("")
  const pendingPreviewEditsRef = useRef(new Map<string, string>())
  const previewEditTimerRef = useRef<number | undefined>(undefined)
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const hydratedRef = useRef(false)
  const saveStatus = useResumeStore((state) => state.saveStatus)
  const saveError = useResumeStore((state) => state.saveError)
  const setCurrentResumeId = useResumeStore((state) => state.setCurrentResumeId)
  const setDraft = useResumeStore((state) => state.setDraft)
  const setSaveStatus = useResumeStore((state) => state.setSaveStatus)

  const form = useForm<Resume>({
    resolver: zodResolver(resumeSchema) as Resolver<Resume>,
    defaultValues: defaultResume,
    mode: "onChange",
  })

  const applyPendingPreviewEdits = useCallback(() => {
    window.clearTimeout(previewEditTimerRef.current)
    previewEditTimerRef.current = undefined

    const edits = [...pendingPreviewEditsRef.current.entries()]
    pendingPreviewEditsRef.current.clear()

    edits.forEach(([path, value]) => {
      form.setValue(path as FieldPath<Resume>, value as never, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    })
  }, [form])

  const flushPreviewEditing = useCallback(() => {
    const activeElement = document.activeElement

    if (activeElement instanceof HTMLElement && activeElement.dataset.inlineEditable === "true") {
      activeElement.blur()
    }

    applyPendingPreviewEdits()
  }, [applyPendingPreviewEdits])

  const handlePreviewEdit = useCallback(
    (path: string, value: string) => {
      pendingPreviewEditsRef.current.set(path, value)
      window.clearTimeout(previewEditTimerRef.current)
      previewEditTimerRef.current = window.setTimeout(applyPendingPreviewEdits, 0)
    },
    [applyPendingPreviewEdits],
  )

  const watchedResume = useWatch({ control: form.control }) as Resume
  const previewResume = watchedResume?.id ? watchedResume : defaultResume
  const analysis = useMemo(() => analyzeResume(previewResume), [previewResume])
  const pageCount = actualPages ?? analysis.estimatedPages
  const isOverOnePage = pageCount > 1
  const tabLabels = useMemo(() => tabStats(previewResume, analysis.score), [analysis.score, previewResume])
  const previewScale = previewZoom === "fit" ? fitScale : previewZoom === "75" ? 0.75 : 1

  const printResume = useReactToPrint({
    contentRef: printRef,
    documentTitle: safeFileName(previewResume.title || previewResume.basics.name || "resume"),
  })

  const persistResume = useCallback(
    (values: Resume) => {
      const next: Resume = {
        ...values,
        id: resumeId,
        updatedAt: nowIso(),
      }
      const parsed = resumeSchema.safeParse(next)

      if (!parsed.success) {
        setSaveStatus("error", "简历数据不完整")
        return Promise.resolve(null)
      }

      const operation = saveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          const previousContentKey = lastContentKeyRef.current

          try {
            setSaveStatus("saving")
            lastContentKeyRef.current = resumeContentKey(parsed.data)
            await resumeRepo.save(parsed.data)
            setDraft(parsed.data)
            setSaveStatus("saved")
            form.setValue("updatedAt", parsed.data.updatedAt, { shouldDirty: false })
            return parsed.data
          } catch (error) {
            lastContentKeyRef.current = previousContentKey
            setSaveStatus("error", error instanceof Error ? `保存失败：${error.message}` : "保存失败")
            return null
          }
        })

      saveQueueRef.current = operation.then(() => undefined)
      return operation
    },
    [form, resumeId, setDraft, setSaveStatus],
  )

  useEffect(() => {
    if (!storedResume) {
      return
    }

    const normalized = normalizeResume(storedResume)
    const normalizedKey = resumeContentKey(normalized)

    if (normalizedKey === lastContentKeyRef.current && form.getValues("id") === normalized.id) {
      hydratedRef.current = true
      setDraft(normalized)
      setSaveStatus("saved")
      return
    }

    form.reset(normalized)
    lastContentKeyRef.current = normalizedKey
    hydratedRef.current = true
    setCurrentResumeId(normalized.id)
    setDraft(normalized)
    setSaveStatus("saved")
  }, [form, setCurrentResumeId, setDraft, setSaveStatus, storedResume])

  useEffect(() => {
    if (!storedResume) {
      return
    }

    let timeoutId: number | undefined
    const subscription = form.watch(() => {
      const values = form.getValues()
      const contentKey = resumeContentKey(values)

      if (contentKey === lastContentKeyRef.current) {
        return
      }

      setDraft(values)
      setSaveStatus("idle")
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        void persistResume(form.getValues())
      }, 800)
    })

    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timeoutId)
    }
  }, [form, persistResume, setDraft, setSaveStatus, storedResume])

  useEffect(
    () => () => {
      window.clearTimeout(previewEditTimerRef.current)
      flushPreviewEditing()

      if (!hydratedRef.current) {
        return
      }

      const values = form.getValues()
      const next = resumeSchema.safeParse({
        ...values,
        id: resumeId,
        updatedAt: nowIso(),
      })

      if (next.success && resumeContentKey(next.data) !== lastContentKeyRef.current) {
        saveQueueRef.current = saveQueueRef.current
          .catch(() => undefined)
          .then(() => resumeRepo.save(next.data))
          .then(() => undefined)
      }

      setCurrentResumeId(null)
      setDraft(null)
      setSaveStatus("idle")
    },
    [flushPreviewEditing, form, resumeId, setCurrentResumeId, setDraft, setSaveStatus],
  )

  useEffect(() => {
    const saveBeforePageExit = () => {
      if (!hydratedRef.current) {
        return
      }

      flushPreviewEditing()
      void persistResume(form.getValues())
    }
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        saveBeforePageExit()
      }
    }

    window.addEventListener("pagehide", saveBeforePageExit)
    document.addEventListener("visibilitychange", saveWhenHidden)

    return () => {
      window.removeEventListener("pagehide", saveBeforePageExit)
      document.removeEventListener("visibilitychange", saveWhenHidden)
    }
  }, [flushPreviewEditing, form, persistResume])

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const applyMobileMode = () => {
      if (media.matches) {
        setViewMode((current) => (current === "split" ? "edit" : current))
      }
    }

    applyMobileMode()
    media.addEventListener("change", applyMobileMode)
    return () => media.removeEventListener("change", applyMobileMode)
  }, [])

  useEffect(() => {
    const element = previewPaneRef.current

    if (!element) {
      return
    }

    const updateFitScale = () => {
      const availableWidth = Math.max(280, element.clientWidth - 16)
      const nextScale = Math.max(0.35, Math.min(1, availableWidth / a4WidthPx))

      setFitScale(Number(nextScale.toFixed(3)))
    }
    const observer = new ResizeObserver(updateFitScale)

    updateFitScale()
    observer.observe(element)
    return () => observer.disconnect()
  }, [storedResume, viewMode])

  async function handleExportCurrent() {
    flushPreviewEditing()
    const saved = await persistResume(form.getValues())

    if (!saved) {
      return
    }

    downloadJson(
      createResumeBackup([saved]),
      `${safeFileName(saved.title || saved.basics.name || "resume")}.json`,
    )
  }

  async function handleExportMarkdown() {
    flushPreviewEditing()
    const saved = await persistResume(form.getValues())

    if (!saved) {
      return
    }

    downloadTextFile(
      resumeToMarkdown(saved),
      `${safeFileName(saved.title || saved.basics.name || "resume")}.md`,
      "text/markdown;charset=utf-8",
    )
  }

  async function handleExportText() {
    flushPreviewEditing()
    const saved = await persistResume(form.getValues())

    if (!saved) {
      return
    }

    downloadTextFile(resumeToPlainText(saved), `${safeFileName(saved.title || saved.basics.name || "resume")}.txt`)
  }

  async function handleGoDashboard() {
    flushPreviewEditing()
    await persistResume(form.getValues())
    goDashboard()
  }

  function handlePrint() {
    flushPreviewEditing()
    window.requestAnimationFrame(() => printResume())
  }

  function handleReduceFontSize(target: "classic" | "sidebar" | "content") {
    const isClassicTarget = target === "classic"
    const designPath = isClassicTarget ? "classicDesign" : "design"
    const field = isClassicTarget ? "baseFontSize" : target === "sidebar" ? "sidebarFontSize" : "contentFontSize"
    const ratio = isClassicTarget ? 0.594 : 0.585
    const current = Number(form.getValues(`${designPath}.${field}`))
    const next = Math.max(12, (Number.isFinite(current) ? current : 17) - 0.5 / ratio)

    form.setValue(`${designPath}.${field}`, Number(next.toFixed(2)), {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  function handleCompactDensity() {
    const designPath = previewResume.templateId === "classic" ? "classicDesign" : "design"

    form.setValue(`${designPath}.density`, "compact", {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  function handleGoToTab(tab: EditorTab) {
    setActiveTab(tab)
    setViewMode((current) => (current === "preview" ? "split" : current))
    window.setTimeout(() => {
      document.querySelector<HTMLElement>("[data-editor-panel]")?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      })
    }, 0)
  }

  useEffect(() => {
    const element = printRef.current

    if (!element) {
      return
    }

    const updatePages = () => {
      const pageHeight = element.getBoundingClientRect().width * (297 / 210)
      const contentElement = element.querySelector<HTMLElement>("[data-resume-content]")
      const contentHeight = contentElement
        ? Math.max(contentElement.scrollHeight, contentElement.getBoundingClientRect().height)
        : 0
      const height = Math.max(contentHeight, element.scrollHeight, element.getBoundingClientRect().height)

      setActualPages(Math.max(1, Math.ceil((height - 2) / pageHeight)))
    }
    const observer = new ResizeObserver(updatePages)
    const contentElement = element.querySelector<HTMLElement>("[data-resume-content]")

    updatePages()
    observer.observe(element)
    if (contentElement) {
      observer.observe(contentElement)
    }

    return () => observer.disconnect()
  }, [previewResume])

  if (storedResume === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-sm text-muted-foreground">
        正在读取简历...
      </div>
    )
  }

  if (!storedResume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">没有找到这份简历</h1>
        <p className="text-sm text-muted-foreground">它可能已经被删除，或当前浏览器没有这条本地数据。</p>
        <Button type="button" onClick={goDashboard}>
          <ArrowLeft />
          返回列表
        </Button>
      </div>
    )
  }

  const showEditor = viewMode !== "preview"

  return (
    <FormProvider {...form}>
      <div className="min-h-screen pb-16 md:pb-0">
        <header className="no-print sticky top-0 z-20 border-b border-border bg-background/95 px-3 py-2 backdrop-blur sm:px-4">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                title="返回列表"
                aria-label="返回列表"
                onClick={() => void handleGoDashboard()}
              >
                <ArrowLeft />
              </Button>
              <Input
                className="h-9 min-w-0 max-w-md border-transparent bg-white text-base font-semibold shadow-sm"
                {...form.register("title")}
                placeholder="简历标题"
                aria-label="简历标题"
              />
              <Badge
                variant="secondary"
                className={
                  saveStatus === "error"
                    ? "shrink-0 whitespace-nowrap border-destructive text-destructive"
                    : "shrink-0 whitespace-nowrap"
                }
              >
                {statusLabel(saveStatus, saveError)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden grid-cols-3 gap-1 rounded-md bg-secondary p-1 md:grid">
                {viewModes.map((mode) => {
                  const ModeIcon = mode.icon
                  const active = viewMode === mode.id

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={cn(
                        "inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-2.5 text-xs font-medium text-muted-foreground transition-colors",
                        active ? "bg-white text-foreground shadow-sm" : "hover:bg-white/60 hover:text-foreground",
                      )}
                      title={mode.label}
                      aria-pressed={active}
                      onClick={() => setViewMode(mode.id)}
                    >
                      <ModeIcon className="size-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  )
                })}
              </div>
              <Select
                value={previewResume.templateId}
                onValueChange={(value) =>
                  form.setValue("templateId", value as TemplateId, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              >
                <SelectTrigger className="h-9 w-32 bg-white" aria-label="选择模板">
                  <SelectValue placeholder="选择模板" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => {
                  flushPreviewEditing()
                  void persistResume(form.getValues())
                }}
              >
                <Save />
                保存
              </Button>
              <ExportMenu
                onExportJson={() => void handleExportCurrent()}
                onExportText={() => void handleExportText()}
                onExportMarkdown={() => void handleExportMarkdown()}
              />
              <Button type="button" size="sm" onClick={handlePrint}>
                <Printer />
                打印 / PDF
              </Button>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "relative mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:h-[calc(100vh-57px)] lg:overflow-hidden lg:px-6",
            viewMode === "split"
              ? "lg:grid-cols-[minmax(420px,620px)_minmax(0,1fr)]"
              : "lg:grid-cols-1",
          )}
        >
          {showEditor ? (
            <section
              data-editor-panel
              className={cn(
                "no-print min-w-0 lg:h-full lg:overflow-y-auto lg:pb-8 lg:pr-1",
                viewMode === "edit" ? "mx-auto w-full max-w-4xl" : "",
              )}
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
                <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="basics" className="h-11 flex-col gap-0.5">
                    <span>基础</span>
                    <span className="text-[11px] font-normal opacity-70">{tabLabels.basics}</span>
                  </TabsTrigger>
                  <TabsTrigger value="career" className="h-11 flex-col gap-0.5">
                    <span>经历</span>
                    <span className="text-[11px] font-normal opacity-70">{tabLabels.career}</span>
                  </TabsTrigger>
                  <TabsTrigger value="extras" className="h-11 flex-col gap-0.5">
                    <span>技能</span>
                    <span className="text-[11px] font-normal opacity-70">{tabLabels.extras}</span>
                  </TabsTrigger>
                  <TabsTrigger value="check" className="h-11 flex-col gap-0.5">
                    <span>检查</span>
                    <span className="text-[11px] font-normal opacity-70">{tabLabels.check}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="basics">
                  <BasicsForm />
                </TabsContent>
                <TabsContent value="career" className="space-y-4">
                  <ExperienceForm />
                  <ProjectsForm />
                  <EducationForm />
                </TabsContent>
                <TabsContent value="extras" className="space-y-4">
                  <SkillsForm />
                  <CertificatesForm />
                </TabsContent>
                <TabsContent value="check">
                  <ResumeHealthPanel
                    resume={previewResume}
                    actualPages={actualPages}
                    onGoToSection={handleGoToTab}
                    onExportMarkdown={() => void handleExportMarkdown()}
                    onExportText={() => void handleExportText()}
                  />
                </TabsContent>
              </Tabs>
            </section>
          ) : null}

          <aside
            ref={previewPaneRef}
            data-preview-pane="true"
            className={cn(
              "min-w-0 overflow-x-auto pb-10 lg:h-full lg:overflow-auto lg:pb-8",
              isOverOnePage ? "scroll-pt-28" : "scroll-pt-12",
              viewMode === "split" ? "lg:self-start" : "mx-auto w-full",
              viewMode === "edit"
                ? "pointer-events-none absolute left-[-10000px] top-0 h-[297mm] w-[210mm] overflow-hidden opacity-0"
                : "",
            )}
            aria-hidden={viewMode === "edit"}
          >
            {viewMode !== "edit" ? (
              <div className="no-print sticky top-0 z-10 mb-3 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-1 pb-2 backdrop-blur">
                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  {pageCount} 页 · {Math.round(previewScale * 100)}%
                </p>
                <div className="flex shrink-0 rounded-md bg-secondary p-1" role="group" aria-label="预览缩放">
                  {([
                    ["fit", "适应"],
                    ["75", "75%"],
                    ["100", "100%"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={cn(
                        "h-7 rounded-sm px-2 text-xs font-medium text-muted-foreground transition-colors",
                        previewZoom === value ? "bg-white text-foreground shadow-sm" : "hover:text-foreground",
                      )}
                      aria-pressed={previewZoom === value}
                      onClick={() => setPreviewZoom(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {isOverOnePage && viewMode !== "edit" ? (
              <div className="no-print sticky top-11 z-10 mb-3 flex items-center justify-between gap-3 rounded-md border border-accent/40 bg-white px-3 py-2 text-sm shadow-sm">
                <div className="flex min-w-0 items-center gap-2 text-foreground">
                  <AlertTriangle className="size-4 shrink-0 text-accent" />
                  <span className="truncate">当前预览为 {pageCount} 页，打印可能分成多页</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {previewResume.templateId === "classic" ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => handleReduceFontSize("classic")}>
                      正文 -0.5
                    </Button>
                  ) : (
                    <>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleReduceFontSize("sidebar")}>
                        左栏 -0.5
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleReduceFontSize("content")}>
                        右栏 -0.5
                      </Button>
                    </>
                  )}
                  <Button type="button" size="sm" variant="outline" onClick={handleCompactDensity}>
                    紧凑密度
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="mx-auto w-fit">
              <ResumePreview
                ref={printRef}
                resume={previewResume}
                screenScale={previewScale}
                editable
                onEdit={handlePreviewEdit}
              />
            </div>
          </aside>
        </main>
        <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/96 px-3 py-2 shadow-[0_-8px_24px_rgba(28,38,49,0.08)] backdrop-blur md:hidden">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground",
                viewMode === "edit" && activeTab !== "check" ? "bg-secondary text-foreground" : "",
              )}
              aria-pressed={viewMode === "edit" && activeTab !== "check"}
              onClick={() => {
                setViewMode("edit")
                if (activeTab === "check") {
                  setActiveTab("basics")
                }
              }}
            >
              <Pencil className="size-4" />
              编辑
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground",
                viewMode === "preview" ? "bg-secondary text-foreground" : "",
              )}
              aria-pressed={viewMode === "preview"}
              onClick={() => setViewMode("preview")}
            >
              <Eye className="size-4" />
              预览
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground",
                viewMode === "edit" && activeTab === "check" ? "bg-secondary text-foreground" : "",
              )}
              aria-pressed={viewMode === "edit" && activeTab === "check"}
              onClick={() => {
                setViewMode("edit")
                setActiveTab("check")
              }}
            >
              <FileText className="size-4" />
              检查
            </button>
          </div>
        </nav>
      </div>
    </FormProvider>
  )
}
