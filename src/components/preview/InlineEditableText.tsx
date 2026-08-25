import { memo, useRef, type KeyboardEvent, type ReactNode } from "react"

type InlineEditableTextProps = {
  enabled?: boolean
  multiline?: boolean
  path?: string
  value: string
  children: ReactNode
  onCommit?: (path: string, value: string) => void
  className?: string
}

type InlineEditableJoinedTextProps = {
  enabled?: boolean
  fields: Array<{ path: string; value: string }>
  separator?: string
  onCommit?: (path: string, value: string) => void
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ""
  }

  if (!(node instanceof HTMLElement)) {
    return ""
  }

  if (node.tagName === "BR") {
    return "\n"
  }

  const content = Array.from(node.childNodes).map(nodeToMarkdown).join("")

  if (node.tagName === "STRONG" || node.tagName === "B") {
    return content ? `**${content}**` : ""
  }

  if (node.tagName === "DIV" || node.tagName === "P") {
    return `${content}\n`
  }

  return content
}

function readEditableValue(element: HTMLElement) {
  return Array.from(element.childNodes)
    .map(nodeToMarkdown)
    .join("")
    .replaceAll("\u00a0", " ")
    .replaceAll("\u200b", "")
    .replace(/\n{2,}/g, "\n")
    .trim()
}

function isEditableVisibleOnItsPage(element: HTMLElement) {
  const page = element.closest<HTMLElement>(".resume-screen-page")

  if (!page) {
    return false
  }

  const rect = element.getBoundingClientRect()
  const pageRect = page.getBoundingClientRect()
  const horizontalOverlap = Math.min(rect.right, pageRect.right) - Math.max(rect.left, pageRect.left)
  const verticalOverlap = Math.min(rect.bottom, pageRect.bottom) - Math.max(rect.top, pageRect.top)

  return horizontalOverlap > 1 && verticalOverlap > 1
}

function focusAdjacentEditable(current: HTMLElement, backwards: boolean) {
  const root = current.closest(".resume-screen-pages")

  if (!root) {
    return false
  }

  const seenPaths = new Set<string>()
  const candidates = [...root.querySelectorAll<HTMLElement>('[data-inline-editable="true"]')].filter(
    (element) => {
      const path = element.dataset.editPath

      if (!path || seenPaths.has(path) || !isEditableVisibleOnItsPage(element)) {
        return false
      }

      seenPaths.add(path)
      return true
    },
  )
  const currentPath = current.dataset.editPath
  const currentIndex = candidates.findIndex((element) => element.dataset.editPath === currentPath)
  const nextIndex =
    currentIndex < 0
      ? 0
      : (currentIndex + (backwards ? -1 : 1) + candidates.length) % candidates.length
  const next = candidates[nextIndex]

  if (!next) {
    return false
  }

  next.focus()
  return true
}

function InlineEditableTextComponent({
  enabled = false,
  multiline = false,
  path,
  value,
  children,
  onCommit,
  className,
}: InlineEditableTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const initialHtmlRef = useRef("")

  function commit() {
    if (!enabled || !path || !onCommit || !elementRef.current) {
      return
    }

    const nextValue = readEditableValue(elementRef.current)

    if (nextValue !== value) {
      onCommit(path, nextValue)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault()
      document.execCommand("bold")
      return
    }

    if (event.key === "Tab" && focusAdjacentEditable(event.currentTarget, event.shiftKey)) {
      event.preventDefault()
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()

      if (multiline && !event.ctrlKey && !event.metaKey) {
          const selection = window.getSelection()

        if (selection?.rangeCount && event.currentTarget.contains(selection.anchorNode)) {
          const range = selection.getRangeAt(0)
          const lineBreak = document.createTextNode("\n\u200b")

          range.deleteContents()
          range.insertNode(lineBreak)
          range.setStart(lineBreak, 1)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }

        return
      }

      event.currentTarget.blur()
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      event.currentTarget.innerHTML = initialHtmlRef.current
      event.currentTarget.blur()
    }
  }

  return (
    <span
      ref={elementRef}
      data-inline-editable={enabled ? "true" : undefined}
      data-inline-multiline={multiline ? "true" : undefined}
      data-edit-path={enabled ? path : undefined}
      className={className}
      contentEditable={enabled}
      tabIndex={enabled ? 0 : undefined}
      role={enabled ? "textbox" : undefined}
      aria-multiline={enabled ? multiline : undefined}
      aria-keyshortcuts={enabled ? "Control+B Control+Enter Escape" : undefined}
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={(event) => {
        initialHtmlRef.current = event.currentTarget.innerHTML
      }}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      onPaste={(event) => {
        if (!enabled) {
          return
        }

        event.preventDefault()
        document.execCommand("insertText", false, event.clipboardData.getData("text/plain"))
      }}
    >
      {children}
    </span>
  )
}

export const InlineEditableText = memo(
  InlineEditableTextComponent,
  (previous, next) =>
    previous.enabled === next.enabled &&
    previous.multiline === next.multiline &&
    previous.path === next.path &&
    previous.value === next.value &&
    previous.className === next.className &&
    previous.onCommit === next.onCommit,
)

export function InlineEditableJoinedText({
  enabled = false,
  fields,
  separator = " · ",
  onCommit,
}: InlineEditableJoinedTextProps) {
  const visibleFields = fields.filter((field) => field.value.trim())

  return visibleFields.map((field, index) => (
    <span key={field.path}>
      {index ? separator : null}
      <InlineEditableText
        enabled={enabled}
        path={field.path}
        value={field.value}
        onCommit={onCommit}
      >
        {field.value}
      </InlineEditableText>
    </span>
  ))
}
