import type { KeyboardEvent } from "react"

const editableSelector = [
  "input:not([type='hidden']):not([disabled]):not([readonly])",
  "textarea:not([disabled]):not([readonly])",
  "button:not([disabled])",
  "[role='button']:not([aria-disabled='true'])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

function isVisible(element: HTMLElement) {
  return Boolean(element.offsetParent || element.getClientRects().length)
}

export function focusNextEditable(current: HTMLElement) {
  const elements = Array.from(current.ownerDocument.querySelectorAll<HTMLElement>(editableSelector)).filter(
    (element) => isVisible(element) && element.tabIndex !== -1,
  )
  const currentIndex = elements.indexOf(current)
  const next = elements.slice(currentIndex + 1).find((element) => element !== current)

  next?.focus()
}

export function isComposing(event: KeyboardEvent) {
  return event.nativeEvent.isComposing || event.key === "Process"
}
