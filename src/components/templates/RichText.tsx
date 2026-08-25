import type { ReactNode } from "react"

type RichTextProps = {
  text: string
  strongClassName: string
}

export function RichText({ text, strongClassName }: RichTextProps) {
  return <>{renderMarkedText(text, strongClassName)}</>
}

function renderMarkedText(text: string, strongClassName: string) {
  const parts: ReactNode[] = []
  const pattern = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    parts.push(
      <strong key={`${match.index}-${match[1]}`} className={strongClassName}>
        {match[1]}
      </strong>,
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
