import * as React from "react"
import { cn } from "@/utils/cn"
import { focusNextEditable, isComposing } from "@/utils/focusNextEditable"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onKeyDown, ...props }, ref) => {
    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      onKeyDown?.(event)

      if (
        event.defaultPrevented ||
        event.key !== "Enter" ||
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isComposing(event)
      ) {
        return
      }

      const inputType = type || "text"
      const shouldAdvance =
        !["button", "checkbox", "color", "file", "radio", "range", "reset", "submit"].includes(inputType)

      if (shouldAdvance) {
        event.preventDefault()
        focusNextEditable(event.currentTarget)
      }
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-transparent bg-slate-100 px-3 py-2 text-sm outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:bg-slate-50 focus-visible:border-accent/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
