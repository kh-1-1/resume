import { type MouseEvent, useEffect, useRef, useState } from "react"
import { CornerDownRight, ListChecks, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/utils/cn"
import { focusNextEditable } from "@/utils/focusNextEditable"

type TextListTextareaProps = {
  value?: string[]
  onChange: (value: string[]) => void
  ariaLabel?: string
  placeholder?: string
  rows?: number
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^([•\-*]|\d+[.)、])\s*/, ""))
    .filter(Boolean)
}

export function TextListTextarea({
  value = [],
  onChange,
  ariaLabel,
  placeholder,
  rows = 4,
}: TextListTextareaProps) {
  const externalText = value.join("\n")
  const [draft, setDraft] = useState(externalText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isEditingRef = useRef(false)

  useEffect(() => {
    if (!isEditingRef.current) {
      setDraft(externalText)
    }
  }, [externalText])

  function commit(nextText: string) {
    const nextValue = splitLines(nextText)

    onChange(nextValue)
    setDraft(nextValue.join("\n"))
  }

  function keepTextAreaFocus(event: MouseEvent) {
    event.preventDefault()
  }

  function addLine() {
    setDraft((current) => (current ? `${current}${current.endsWith("\n") ? "" : "\n"}` : "\n"))
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function focusNext() {
    if (textareaRef.current) {
      focusNextEditable(textareaRef.current)
    }
  }

  const itemCount = splitLines(draft).length

  return (
    <div className="overflow-hidden rounded-md border border-input bg-white transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-ring">
      <div className="flex h-9 items-center justify-between gap-2 border-b border-border bg-slate-50 px-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="整理列表"
            aria-label="整理列表"
            onMouseDown={keepTextAreaFocus}
            onClick={() => commit(draft)}
          >
            <ListChecks className="size-4" />
          </button>
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="新增一行"
            aria-label="新增一行"
            onMouseDown={keepTextAreaFocus}
            onClick={addLine}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="跳到下一个输入"
            aria-label="跳到下一个输入"
            onMouseDown={keepTextAreaFocus}
            onClick={focusNext}
          >
            <CornerDownRight className="size-4" />
          </button>
        </div>
        <span className={cn("text-xs font-medium", itemCount ? "text-accent" : "text-muted-foreground")}>
          {itemCount} 条
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        value={draft}
        aria-label={ariaLabel}
        className="min-h-0 rounded-none border-0 bg-white px-4 py-3 leading-7 focus-visible:ring-0"
        onFocus={() => {
          isEditingRef.current = true
        }}
        onChange={(event) => {
          const nextText = event.target.value

          setDraft(nextText)
          onChange(splitLines(nextText))
        }}
        onBlur={() => {
          isEditingRef.current = false
          commit(draft)
        }}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}
