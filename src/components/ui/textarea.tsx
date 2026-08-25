import * as React from "react"
import { cn } from "@/utils/cn"
import { focusNextEditable, isComposing } from "@/utils/focusNextEditable"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onKeyDown, ...props }, ref) => {
    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
      onKeyDown?.(event)

      if (
        event.defaultPrevented ||
        event.key !== "Enter" ||
        (!event.metaKey && !event.ctrlKey) ||
        event.shiftKey ||
        event.altKey ||
        isComposing(event)
      ) {
        return
      }

      event.preventDefault()
      focusNextEditable(event.currentTarget)
    }

    return (
      <textarea
        className={cn(
          "flex min-h-24 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
