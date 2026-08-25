import type { ReactNode } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

type CollapsibleEntryCardProps = {
  title: string
  subtitle?: string
  meta?: string
  badge?: string
  expanded: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  deleteLabel: string
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  children: ReactNode
}

export function CollapsibleEntryCard({
  title,
  subtitle,
  meta,
  badge,
  expanded,
  canMoveUp,
  canMoveDown,
  deleteLabel,
  onToggle,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  children,
}: CollapsibleEntryCardProps) {
  return (
    <div
      data-entry-card
      data-entry-expanded={expanded ? "true" : "false"}
      className={cn(
        "overflow-hidden rounded-md border bg-white transition-colors",
        expanded ? "border-accent/55 shadow-sm" : "border-border hover:border-primary/35",
      )}
    >
      <div className="flex min-h-16 items-stretch">
        <button
          type="button"
          data-entry-toggle
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded ? "rotate-180" : "",
            )}
          />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">{title}</span>
              {badge ? <Badge variant="secondary">{badge}</Badge> : null}
            </span>
            <span className="mt-0.5 flex min-w-0 flex-wrap gap-x-2 text-xs text-muted-foreground">
              {subtitle ? <span className="truncate">{subtitle}</span> : null}
              {meta ? <span className="shrink-0">{meta}</span> : null}
            </span>
          </span>
        </button>

        <div className="flex shrink-0 items-center border-l border-border px-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="上移"
            aria-label="上移"
            disabled={!canMoveUp}
            onClick={onMoveUp}
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="下移"
            aria-label="下移"
            disabled={!canMoveDown}
            onClick={onMoveDown}
          >
            <ArrowDown />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="复制"
            aria-label="复制"
            onClick={onDuplicate}
          >
            <Copy />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            title={deleteLabel}
            aria-label={deleteLabel}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {expanded ? <div className="border-t border-border p-3">{children}</div> : null}
    </div>
  )
}
