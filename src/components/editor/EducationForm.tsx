import { useState } from "react"
import { nanoid } from "nanoid"
import { Plus } from "lucide-react"
import { useFieldArray, useFormContext, Controller, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CollapsibleEntryCard } from "@/components/editor/CollapsibleEntryCard"
import { FormField } from "@/components/editor/FormField"
import { SectionShell } from "@/components/editor/SectionShell"
import { TextListTextarea } from "@/components/editor/TextListTextarea"
import type { Resume } from "@/types/resume"
import { createEmptyEducation } from "@/utils/createEmptyResume"
import { formatDateRange } from "@/utils/date"

export function EducationForm() {
  const { control, getValues, register } = useFormContext<Resume>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const values = useWatch({ control, name: "education" }) ?? []
  const { fields, append, insert, move, remove } = useFieldArray({
    control,
    name: "education",
    keyName: "fieldKey",
  })

  return (
    <SectionShell
      title="教育经历"
      description="填写学校、专业、时间，也可以补充奖项或课程亮点。"
      action={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const next = createEmptyEducation()

            append(next)
            setExpandedId(next.id)
          }}
        >
          <Plus />
          添加教育
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white/70 px-4 py-6 text-sm text-muted-foreground">
          还没有教育经历。
        </p>
      ) : null}

      {fields.map((field, index) => {
        const item = values[index] ?? field
        const title = item.school.trim() || `教育经历 ${index + 1}`
        const subtitle = [item.degree, item.major].filter(Boolean).join(" · ") || "未填写学历和专业"

        return (
          <CollapsibleEntryCard
            key={field.fieldKey}
            title={title}
            subtitle={subtitle}
            meta={formatDateRange(item.startDate, item.endDate, item.current) || "未填写时间"}
            badge={`${item.highlights.length} 条`}
            expanded={expandedId === item.id}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            deleteLabel="删除教育经历"
            onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onDuplicate={() => {
              const source = getValues(`education.${index}`)
              const next = { ...source, id: nanoid(), highlights: [...source.highlights] }

              insert(index + 1, next)
              setExpandedId(next.id)
            }}
            onDelete={() => {
              if (!window.confirm(`确定删除「${title}」吗？`)) {
                return
              }

              remove(index)
              if (expandedId === item.id) {
                setExpandedId(null)
              }
            }}
          >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="学校" layout="inline">
              <Input {...register(`education.${index}.school`)} placeholder="学校名称" />
            </FormField>
            <FormField label="学历" layout="inline">
              <Input {...register(`education.${index}.degree`)} placeholder="本科 / 硕士" />
            </FormField>
            <FormField label="专业" layout="inline">
              <Input {...register(`education.${index}.major`)} placeholder="计算机科学与技术" />
            </FormField>
            <FormField label="地点" layout="inline">
              <Input {...register(`education.${index}.location`)} placeholder="北京" />
            </FormField>
            <FormField label="开始时间" layout="inline">
              <Input type="month" {...register(`education.${index}.startDate`)} />
            </FormField>
            <FormField label="结束时间" layout="inline">
              <Input type="month" {...register(`education.${index}.endDate`)} />
            </FormField>
            <label className="flex h-9 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-[var(--primary)]"
                {...register(`education.${index}.current`)}
              />
              仍在就读
            </label>
            <FormField label="亮点" className="sm:col-span-2">
              <Controller
                control={control}
                name={`education.${index}.highlights`}
                render={({ field: highlightField }) => (
                  <TextListTextarea
                    value={highlightField.value}
                    onChange={highlightField.onChange}
                    ariaLabel={`第 ${index + 1} 段教育经历亮点`}
                    placeholder="每行一条，例如：GPA 3.8 / 4.0"
                  />
                )}
              />
            </FormField>
          </div>
          </CollapsibleEntryCard>
        )
      })}
    </SectionShell>
  )
}
