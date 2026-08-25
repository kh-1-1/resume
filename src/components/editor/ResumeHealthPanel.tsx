import { AlertTriangle, ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionShell } from "@/components/editor/SectionShell"
import type { Resume } from "@/types/resume"
import { analyzeResume, type ResumeCheckLevel } from "@/utils/resumeAnalysis"
import { cn } from "@/utils/cn"

type ResumeHealthPanelProps = {
  resume: Resume
  actualPages?: number
  onGoToSection?: (target: ResumeHealthTarget) => void
  onExportText: () => void
  onExportMarkdown: () => void
}

type ResumeHealthTarget = "basics" | "career" | "extras"

const checkTargets: Record<string, ResumeHealthTarget> = {
  "basics-name": "basics",
  contact: "basics",
  summary: "basics",
  ats: "basics",
  experience: "career",
  projects: "career",
  dates: "career",
  impact: "career",
  skills: "extras",
}

function levelIcon(level: ResumeCheckLevel) {
  if (level === "good") {
    return <CheckCircle2 className="size-4 text-primary" />
  }

  return <AlertTriangle className={cn("size-4", level === "danger" ? "text-destructive" : "text-accent")} />
}

function scoreTone(score: number) {
  if (score >= 85) {
    return "text-primary"
  }

  if (score >= 65) {
    return "text-accent"
  }

  return "text-destructive"
}

export function ResumeHealthPanel({
  resume,
  actualPages,
  onGoToSection,
  onExportMarkdown,
  onExportText,
}: ResumeHealthPanelProps) {
  const analysis = analyzeResume(resume)
  const pageCount = actualPages ?? analysis.estimatedPages
  const isOnePage = pageCount <= 1

  return (
    <div className="space-y-4">
      <SectionShell title="简历检查" description="本地检查，不上传数据。参考 ATS 和招聘方快速浏览习惯给出建议。">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">综合分</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={cn("text-3xl font-bold", scoreTone(analysis.score))}>{analysis.score}</p>
              <p className="text-xs text-muted-foreground">通过 {analysis.strengths.length} 项检查</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">完整度</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-3xl font-bold text-foreground">{analysis.completion}%</p>
              <p className="text-xs text-muted-foreground">
                {analysis.completedFields}/{analysis.totalFields} 个核心项
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">页面</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className={cn("text-3xl font-bold", isOnePage ? "text-primary" : "text-accent")}>
                {pageCount}
              </p>
              <p className="text-xs text-muted-foreground">{isOnePage ? "适合一页投递" : "可能超过一页"}</p>
            </CardContent>
          </Card>
        </div>

        {!isOnePage ? (
          <div className="flex gap-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">内容已经超过一页</p>
              <p className="mt-1 text-muted-foreground">
                可以在基础设置里切换为紧凑密度、缩小字号，或把较弱经历压缩成 1 到 2 条成果。
              </p>
            </div>
            {onGoToSection ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 bg-white"
                onClick={() => onGoToSection("basics")}
              >
                调排版
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-md border border-border bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">下一步建议</h3>
          </div>
          {analysis.nextActions.length ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {analysis.nextActions.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">结构已经比较完整，可以针对具体岗位微调关键词。</p>
          )}
        </div>

        <div className="space-y-2">
          {analysis.checks.map((check) => {
            const target = checkTargets[check.id]
            const canEdit = onGoToSection && target && check.level !== "good"

            return (
              <div key={check.id} className="flex gap-3 rounded-md border border-border bg-white px-3 py-3">
                <div className="mt-0.5">{levelIcon(check.level)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{check.label}</p>
                    <Badge variant={check.level === "good" ? "secondary" : "outline"}>
                      {check.level === "good" ? "通过" : check.level === "danger" ? "必改" : "建议"}
                    </Badge>
                    {canEdit ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-7 px-2 text-xs"
                        onClick={() => onGoToSection(target)}
                      >
                        去修改
                        <ArrowRight className="size-3" />
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell title="文本导出" description="用于 ATS 纯文本检查、邮件粘贴或后续投递系统复制。">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onExportText}>
            <FileText />
            导出 TXT
          </Button>
          <Button type="button" variant="outline" onClick={onExportMarkdown}>
            <FileText />
            导出 Markdown
          </Button>
        </div>
      </SectionShell>
    </div>
  )
}
