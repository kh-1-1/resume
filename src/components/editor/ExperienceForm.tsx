import { useState } from "react"
import { nanoid } from "nanoid"
import { Plus } from "lucide-react"
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CollapsibleEntryCard } from "@/components/editor/CollapsibleEntryCard"
import { FormField } from "@/components/editor/FormField"
import { SectionShell } from "@/components/editor/SectionShell"
import { TextListTextarea } from "@/components/editor/TextListTextarea"
import type { ExperienceKind, Resume } from "@/types/resume"
import { createEmptyExperience } from "@/utils/createEmptyResume"
import {
  experienceKindLabels,
  experienceKindOptions,
  getExperienceDateLabel,
} from "@/utils/experience"

export function ExperienceForm() {
  const { control, getValues, register } = useFormContext<Resume>()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const values = useWatch({ control, name: "experience" }) ?? []
  const { fields, append, insert, move, remove } = useFieldArray({
    control,
    name: "experience",
    keyName: "fieldKey",
  })

  return (
    <SectionShell
      title="经历"
      description="明确选择实习、工作或校园类型，预览会自动放到对应栏目。"
      action={
        <Button
          type="button"
          size="sm"
          onClick={() => {
            const next = createEmptyExperience()

            append(next)
            setExpandedId(next.id)
          }}
        >
          <Plus />
          添加经历
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white/70 px-4 py-6 text-sm text-muted-foreground">
          还没有经历。
        </p>
      ) : null}

      {fields.map((field, index) => {
        const item = values[index] ?? field
        const title = item.position.trim() || `${experienceKindLabels[item.kind]}经历 ${index + 1}`
        const subtitle = item.company.trim() || "未填写单位或组织"

        return (
          <CollapsibleEntryCard
            key={field.fieldKey}
            title={title}
            subtitle={subtitle}
            meta={getExperienceDateLabel(item) || "未填写时间"}
            badge={experienceKindLabels[item.kind]}
            expanded={expandedId === item.id}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            deleteLabel="删除经历"
            onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onDuplicate={() => {
              const next = { ...getValues(`experience.${index}`), id: nanoid() }

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
            <FormField label="类型" layout="inline">
              <Controller
                control={control}
                name={`experience.${index}.kind`}
                render={({ field: kindField }) => (
                  <Select
                    value={kindField.value}
                    onValueChange={(value) => kindField.onChange(value as ExperienceKind)}
                  >
                    <SelectTrigger className="bg-white" aria-label="经历类型">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceKindOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="单位 / 组织" layout="inline">
              <Input {...register(`experience.${index}.company`)} placeholder="公司名称" />
            </FormField>
            <FormField label="职位 / 角色" layout="inline">
              <Input {...register(`experience.${index}.position`)} placeholder="职位或校园任职" />
            </FormField>
            <FormField label="地点" layout="inline">
              <Input {...register(`experience.${index}.location`)} placeholder="上海" />
            </FormField>
            <FormField label="开始时间" layout="inline">
              <Input type="month" {...register(`experience.${index}.startDate`)} />
            </FormField>
            <FormField label="结束时间" layout="inline">
              <Input type="month" {...register(`experience.${index}.endDate`)} />
            </FormField>
            <label className="flex h-9 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-[var(--primary)]"
                {...register(`experience.${index}.current`)}
              />
              当前在职
            </label>
            <FormField label="显示时间（可选）" className="sm:col-span-2" layout="inline">
              <Input
                {...register(`experience.${index}.dateLabel`)}
                placeholder="留空则自动使用起止时间"
              />
            </FormField>
            <FormField label="经历亮点" className="sm:col-span-2">
              <Controller
                control={control}
                name={`experience.${index}.highlights`}
                render={({ field: highlightField }) => (
                  <TextListTextarea
                    value={highlightField.value}
                    onChange={highlightField.onChange}
                    ariaLabel={`第 ${index + 1} 段经历亮点`}
                    placeholder="每行一条，建议写清动作、方法和结果"
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
