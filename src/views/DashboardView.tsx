import { useEffect, useMemo, useRef, useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import {
  Database,
  Download,
  FilePlus2,
  FileText,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react"
import { ResumeCard } from "@/components/dashboard/ResumeCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDropdownMenu } from "@/components/ui/useDropdownMenu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resumeRepo } from "@/db/resumeRepo"
import type { Resume } from "@/types/resume"
import { cloneResume, createEmptyResume, createSampleResume } from "@/utils/createEmptyResume"
import { createResumeBackup, downloadJson, safeFileName } from "@/utils/exportJson"
import { importResumesFromFile } from "@/utils/importJson"
import { seedLocalPrivateResumes } from "@/utils/seedLocalPrivateResumes"

function goToResume(resumeId: string) {
  window.location.hash = `/resume/${encodeURIComponent(resumeId)}`
}

function exportFileName(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.json`
}

type DashboardActionsMenuProps = {
  onCreateSample: () => void
  onImport: () => void
  onExportAll: () => void
  onRestoreLocal?: () => void
}

function DashboardActionsMenu({ onCreateSample, onImport, onExportAll, onRestoreLocal }: DashboardActionsMenuProps) {
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
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <Button
        ref={triggerRef}
        type="button"
        size="sm"
        variant="outline"
        className="w-9 bg-white px-0 text-[#10263a] sm:w-auto sm:px-3"
        title="更多操作"
        aria-label="更多操作"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal />
        <span className="hidden sm:inline">更多</span>
      </Button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-30 w-44 overflow-hidden rounded-md border border-border bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-secondary"
            onClick={() => run(onCreateSample)}
          >
            <FilePlus2 className="size-4" />
            创建示例简历
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-secondary"
            onClick={() => run(onImport)}
          >
            <Upload className="size-4" />
            导入 JSON
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-secondary"
            onClick={() => run(onExportAll)}
          >
            <Download className="size-4" />
            导出全部
          </button>
          {onRestoreLocal ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-secondary"
              onClick={() => run(onRestoreLocal)}
            >
              <Database className="size-4" />
              恢复本机简历
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function DashboardView() {
  const resumes = useLiveQuery(() => resumeRepo.list(), [], null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [dialogMessage, setDialogMessage] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const resumeCount = resumes?.length ?? 0
  const visibleResumes = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()

    if (!resumes) {
      return []
    }

    return resumes
      .filter((resume) => {
        if (!query) {
          return true
        }

        return [resume.title, resume.basics.name, resume.basics.jobTitle]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query)
      })
      .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }, [resumes, searchQuery])

  function showMessage(message: string) {
    setDialogMessage(message)
    setDialogOpen(true)
  }

  async function handleCreateResume() {
    try {
      const resume = createEmptyResume("我的简历")

      await resumeRepo.save(resume)
      goToResume(resume.id)
    } catch (error) {
      showMessage(error instanceof Error ? `新建失败：${error.message}` : "新建简历失败。")
    }
  }

  async function handleCreateSampleResume() {
    try {
      const resume = createSampleResume()

      await resumeRepo.save(resume)
      goToResume(resume.id)
    } catch (error) {
      showMessage(error instanceof Error ? `创建示例失败：${error.message}` : "创建示例失败。")
    }
  }

  useEffect(() => {
    if (resumes === null) {
      return
    }

    if (resumes.length > 0) {
      return
    }

    const seedKey = "resume-maker-default-seeded-v2"

    if (window.localStorage.getItem(seedKey)) {
      return
    }

    window.localStorage.setItem(seedKey, "true")
    void resumeRepo.save(createSampleResume()).catch((error) => {
      window.localStorage.removeItem(seedKey)
      showMessage(error instanceof Error ? `初始化失败：${error.message}` : "初始化示例简历失败。")
    })
  }, [resumes])

  useEffect(() => {
    const hasPlaceholderShell = resumes?.some(
      (resume) => resume.title.trim() === "未命名简历" && !resume.basics.name.trim(),
    )

    if (!hasPlaceholderShell) {
      return
    }

    void seedLocalPrivateResumes().catch((error) => {
      showMessage(error instanceof Error ? `自动恢复失败：${error.message}` : "自动恢复本机简历失败。")
    })
  }, [resumes])

  function handleExportAll() {
    if (!resumes?.length) {
      setDialogMessage("当前没有可导出的简历。")
      setDialogOpen(true)
      return
    }

    downloadJson(createResumeBackup(resumes), exportFileName("resume-maker-backup"))
  }

  function handleExportResume(resume: Resume) {
    downloadJson(
      createResumeBackup([resume]),
      exportFileName(safeFileName(resume.title || resume.basics.name || "resume")),
    )
  }

  async function handleDeleteResume(resume: Resume) {
    const confirmed = window.confirm(`确定删除「${resume.title || "未命名简历"}」吗？`)

    if (!confirmed) {
      return
    }

    try {
      await resumeRepo.remove(resume.id)
    } catch (error) {
      showMessage(error instanceof Error ? `删除失败：${error.message}` : "删除简历失败。")
    }
  }

  async function handleDuplicateResume(resume: Resume) {
    try {
      const duplicated = cloneResume(resume)

      await resumeRepo.save(duplicated)
      goToResume(duplicated.id)
    } catch (error) {
      showMessage(error instanceof Error ? `复制失败：${error.message}` : "复制简历失败。")
    }
  }

  async function handleRestoreLocalResumes() {
    try {
      const result = await seedLocalPrivateResumes()

      showMessage(
        result.restored
          ? `已恢复 ${result.restored} 份本机简历。`
          : `本机备份中的 ${result.total} 份简历均已存在。`,
      )
    } catch (error) {
      showMessage(error instanceof Error ? `恢复失败：${error.message}` : "恢复本机简历失败。")
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    try {
      const imported = await importResumesFromFile(file)
      await resumeRepo.saveMany(imported)
      showMessage(`已导入 ${imported.length} 份简历。`)
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "导入失败，请检查 JSON 文件。")
    } finally {
      input.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      <header className="border-b border-[#203850] bg-[#10263a] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e29a45] text-[#10263a] shadow-sm">
              <FileText className="size-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-normal sm:text-2xl">简历工作台</h1>
                <Badge className="shrink-0 border-white/16 bg-white/10 text-white">
                  {resumeCount} 份
                </Badge>
              </div>
              <p className="mt-0.5 hidden items-center gap-1.5 text-xs text-[#bed0df] sm:flex">
                <ShieldCheck className="size-3.5 text-[#76c6ae]" />
                内容仅保存在当前浏览器
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-[#e29a45] text-[#10263a] hover:bg-[#efab5b]"
              onClick={handleCreateResume}
            >
              <FilePlus2 />
              <span className="sm:hidden">新建</span>
              <span className="hidden sm:inline">新建简历</span>
            </Button>
            <DashboardActionsMenu
              onCreateSample={() => void handleCreateSampleResume()}
              onImport={() => importInputRef.current?.click()}
              onExportAll={handleExportAll}
              onRestoreLocal={
                import.meta.env.DEV && import.meta.env.VITE_ENABLE_PRIVATE_RESUME_SEED === "true"
                  ? () => void handleRestoreLocalResumes()
                  : undefined
              }
            />
            <input
              ref={importInputRef}
              type="file"
              className="hidden"
              accept="application/json,.json"
              onChange={handleImport}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 border-b border-[#d7e0e7] pb-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-[#10263a]">我的简历</h2>
            <p className="mt-1 text-sm text-[#657483]">选择一份继续编辑，或创建新的投递版本。</p>
          </div>
          {resumes?.length ? (
            <label className="relative block w-full sm:w-72">
              <span className="sr-only">搜索简历</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#73818e]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索标题、姓名或方向"
                className="h-10 w-full rounded-md border border-[#cfd9e2] bg-white pl-9 pr-3 text-sm text-[#17212b] outline-none transition-colors placeholder:text-[#8995a0] focus:border-[#2b706a] focus:ring-2 focus:ring-[#2b706a]/15"
              />
            </label>
          ) : null}
        </section>

        {resumes === null ? (
          <div className="border border-[#d7e0e7] bg-white px-5 py-12 text-center text-sm text-[#657483]">
            正在读取本地数据库...
          </div>
        ) : resumes.length && visibleResumes.length ? (
          <section className="grid gap-5 lg:grid-cols-2">
            {visibleResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onOpen={(item) => goToResume(item.id)}
                onDelete={handleDeleteResume}
                onDuplicate={handleDuplicateResume}
                onExport={handleExportResume}
              />
            ))}
          </section>
        ) : resumes.length ? (
          <section className="border border-dashed border-[#c6d2dc] bg-white px-6 py-14 text-center">
            <Search className="mx-auto size-8 text-[#6f7f8c]" />
            <h2 className="mt-3 text-lg font-semibold text-[#10263a]">没有找到匹配的简历</h2>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-[#1f6f68] hover:underline"
              onClick={() => setSearchQuery("")}
            >
              清除搜索
            </button>
          </section>
        ) : (
          <section className="border border-dashed border-[#c6d2dc] bg-white px-6 py-16 text-center">
            <Database className="mx-auto size-10 text-[#1f6f68]" />
            <h2 className="mt-4 text-xl font-semibold tracking-normal text-[#10263a]">还没有简历</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#657483]">
              新建一份简历后，内容会自动保存在当前浏览器。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={handleCreateResume}>
                <FilePlus2 />
                新建第一份简历
              </Button>
              <Button type="button" variant="outline" onClick={handleCreateSampleResume}>
                <FilePlus2 />
                查看示例
              </Button>
            </div>
          </section>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提示</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
