import type { ReactNode } from "react"

type SectionShellProps = {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

export function SectionShell({ title, description, children, action }: SectionShellProps) {
  return (
    <section className="form-section overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="space-y-3 p-3">{children}</div>
    </section>
  )
}
