import { useEffect, useRef, type KeyboardEvent } from "react"

export function useDropdownMenu(open: boolean, setOpen: (open: boolean) => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    })
    const closeFromOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeFromOutside)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("pointerdown", closeFromOutside)
    }
  }, [open, setOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = [...(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const currentIndex = items.indexOf(document.activeElement as HTMLElement)

    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !items.length) {
      return
    }

    event.preventDefault()
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (currentIndex + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length

    items[nextIndex]?.focus()
  }

  return { containerRef, triggerRef, handleKeyDown }
}
