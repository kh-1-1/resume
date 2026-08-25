import { useState } from "react"
import { nanoid } from "nanoid"
import { Plus } from "lucide-react"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CollapsibleEntryCard } from "@/components/editor/CollapsibleEntryCard"
import { FormField } from "@/components/editor/FormField"
import { SectionShell } from "@/components/editor/SectionShell"
import { TextListTextarea } from "@/components/editor/TextListTextarea"
import type { Resume } from "@/types/resume"
import { createEmptyProject } from "@/utils/createEmptyResume"
import { formatDateRange } from "@/utils/date"

export function ProjectsForm() {
  const { control, getValues, register } = useFormContext<Resume>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const values = useWatch({ control, name: "projects" }) ?? []
  const { fields, append, insert, move, remove } = useFieldArray({
    control,
    name: "projects",
    keyName: "fieldKey",
  })

  return (
    <SectionShell
      title="项目经历"
      description="适合写个人项目、业务项目或开源项目。"
      action={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const next = createEmptyProject()

            append(next)
            setExpandedId(next.id)
          }}
        >
          <Plus />
          添加项目
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white/70 px-4 py-6 text-sm text-muted-foreground">
          还没有项目经历。
        </p>
      ) : null}

      {fields.map((field, index) => {
        const item = values[index] ?? field
        const title = item.name.trim() || `项目 ${index + 1}`
        const subtitle = item.role.trim() || `${item.highlights.length} 条项目亮点`

        return (
          <CollapsibleEntryCard
            key={field.fieldKey}
            title={title}
            subtitle={subtitle}
            meta={formatDateRange(item.startDate, item.endDate) || "未填写时间"}
            badge={`${item.highlights.length} 条`}
            expanded={expandedId === item.id}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            deleteLabel="删除项目"
            onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onDuplicate={() => {
              const source = getValues(`projects.${index}`)
              const next = {
                ...source,
                id: nanoid(),
                techStack: [...source.techStack],
                highlights: [...source.highlights],
              }

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
            <FormField label="项目名称" layout="inline">
              <Input {...register(`projects.${index}.name`)} placeholder="项目名称" />
            </FormField>
            <FormField label="角色" layout="inline">
              <Input {...register(`projects.${index}.role`)} placeholder="负责人 / 开发者" />
            </FormField>
            <FormField label="链接" layout="inline">
              <Input {...register(`projects.${index}.url`)} placeholder="https://..." />
            </FormField>
            <FormField label="开始时间" layout="inline">
              <Input type="month" {...register(`projects.${index}.startDate`)} />
            </FormField>
            <FormField label="结束时间" layout="inline">
              <Input type="month" {...register(`projects.${index}.endDate`)} />
            </FormField>
            <FormField label="技术栈">
              <Controller
                control={control}
                name={`projects.${index}.techStack`}
                render={({ field: stackField }) => (
                  <TextListTextarea
                    value={stackField.value}
                    onChange={stackField.onChange}
                    ariaLabel={`第 ${index + 1} 个项目技术栈`}
                    placeholder="每行一个技术，例如：React"
                    rows={3}
                  />
                )}
              />
            </FormField>
            <FormField label="项目亮点" className="sm:col-span-2">
              <Controller
                control={control}
                name={`projects.${index}.highlights`}
                render={({ field: highlightField }) => (
                  <TextListTextarea
                    value={highlightField.value}
                    onChange={highlightField.onChange}
                    ariaLabel={`第 ${index + 1} 个项目亮点`}
                    placeholder="每行一条，例如：实现动态模板渲染，支持 2 种简历样式"
                    rows={5}
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
