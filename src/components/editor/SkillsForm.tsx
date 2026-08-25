import { Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/editor/FormField"
import { SectionShell } from "@/components/editor/SectionShell"
import { TextListTextarea } from "@/components/editor/TextListTextarea"
import type { Resume } from "@/types/resume"
import { createEmptySkillGroup } from "@/utils/createEmptyResume"

export function SkillsForm() {
  const { control, getValues, register } = useFormContext<Resume>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
    keyName: "fieldKey",
  })

  return (
    <SectionShell
      title="技能"
      description="按类别组织技能，预览里会自动以紧凑分组文本呈现。"
      action={
        <Button type="button" size="sm" onClick={() => append(createEmptySkillGroup())}>
          <Plus />
          添加技能组
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white/70 px-4 py-6 text-sm text-muted-foreground">
          还没有技能组。
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div
          key={field.fieldKey}
          data-skill-editor-card
          className="rounded-md border border-border bg-white p-3 transition-colors focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-ring"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">技能组 {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="删除技能组"
              aria-label="删除技能组"
              onClick={() => {
                const name = getValues(`skills.${index}.name`).trim() || `技能组 ${index + 1}`

                if (window.confirm(`确定删除「${name}」吗？`)) {
                  remove(index)
                }
              }}
            >
              <Trash2 />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
            <FormField label="类别" layout="inline">
              <Input {...register(`skills.${index}.name`)} placeholder="前端 / 工具 / 语言" />
            </FormField>
            <FormField label="技能">
              <Controller
                control={control}
                name={`skills.${index}.skills`}
                render={({ field: skillsField }) => (
                  <TextListTextarea
                    value={skillsField.value}
                    onChange={skillsField.onChange}
                    ariaLabel={`第 ${index + 1} 个技能组内容`}
                    placeholder="每行一个技能，例如：TypeScript"
                    rows={4}
                  />
                )}
              />
            </FormField>
          </div>
        </div>
      ))}
    </SectionShell>
  )
}
