import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils/cn"

type FormFieldProps = {
  label: string
  htmlFor?: string
  className?: string
  children: ReactNode
  layout?: "stack" | "inline"
}

export function FormField({ label, htmlFor, className, children, layout = "stack" }: FormFieldProps) {
  const generatedId = useId()
  const controlId = htmlFor || generatedId
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, {
        id: (children.props as { id?: string }).id || controlId,
      })
    : children

  if (layout === "inline") {
    return (
      <div className={cn("grid items-center gap-2 sm:grid-cols-[72px_1fr]", className)}>
        <Label htmlFor={controlId} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {child}
      </div>
    )
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={controlId} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {child}
    </div>
  )
}
